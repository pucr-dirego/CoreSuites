import { useEffect, useMemo, useRef, useState } from "react";

import CoreFormField from "../shared/CoreFormField";
import CoreFormSection from "../shared/CoreFormSection";

import {
  condicionFisicaOptions,
  estadoFuncionamientoOptions,
  initialAltaEquipoForm,
  MAX_FACTURA_PDF_BYTES,
  MAX_FACTURA_XML_BYTES,
  modoFacturaOptions,
  tipoIncorporacionOptions,
  tipoEquipoOptions,
  type AltaEquipoForm,
  type DepartamentoOption,
  type FacturaCompraOption,
  type MonedaOption,
  type ProveedorEmisorOption,
  type RazonSocialOption,
  type SucursalOption,
} from "../../../interfaces/altaEquipo";

import {
  crearEquipo,
  getDepartamentosEquipo,
  getFacturasEquipo,
  getMonedasEquipo,
  getProveedoresEmisoresEquipo,
  getRazonesSocialesEquipo,
  getSucursalesEquipo,
} from "../../../services/equiposFormService";

type FormErrors = Partial<Record<keyof AltaEquipoForm, string>>;

type Mensaje = {
  tipo: "success" | "error" | "info";
  texto: string;
};

type AltaEquipoPageProps = {
  onBack?: () => void;
};

const MIN_INSTRUCTION_READ_SECONDS = 12;

const EQUIPMENT_INSTRUCTIONS_STORAGE_KEY =
  "coreforms:alta-equipo:instructions-read";

function getInstructionElapsedSeconds(startTime: number) {
  return Math.max(0, Math.floor((Date.now() - startTime) / 1000));
}

function getSessionInstructionRead(key: string) {
  try {
    return window.sessionStorage.getItem(key) === "true";
  } catch {
    return false;
  }
}

function markSessionInstructionRead(key: string) {
  try {
    window.sessionStorage.setItem(key, "true");
  } catch {
    // Si sessionStorage no está disponible, simplemente no persiste.
  }
}

function normalizeIp(value: string) {
  return value.trim().replace(/\s+/g, "");
}

function isValidIPv4(value: string) {
  const ip = normalizeIp(value);

  if (!ip) return false;

  const parts = ip.split(".");

  if (parts.length !== 4) return false;

  return parts.every((part) => {
    if (!/^\d+$/.test(part)) return false;

    const number = Number(part);

    return number >= 0 && number <= 255;
  });
}

function isValidMoney(value: string) {
  const normalized = value.replace(/,/g, "").trim();

  if (!normalized) return true;

  const number = Number(normalized);

  return Number.isFinite(number) && number >= 0;
}

function hasExpectedExtension(file: File, extension: ".pdf" | ".xml") {
  return file.name.toLocaleLowerCase("es-MX").endsWith(extension);
}

function formatFileSize(bytes: number) {
  const megabytes = bytes / (1024 * 1024);

  return `${megabytes.toFixed(megabytes >= 10 ? 0 : 1)} MB`;
}

function formatAmount(value?: number) {
  if (value === undefined) {
    return "No capturado";
  }

  return new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function AltaEquipoPage({ onBack }: AltaEquipoPageProps) {
  const [mostrarModalExito, setMostrarModalExito] = useState(false);
  const [mostrarConfirmacionLimpiar, setMostrarConfirmacionLimpiar] =
    useState(false);

  const instructionStartTimeRef = useRef(Date.now());

  const [instruccionesLeidas, setInstruccionesLeidas] = useState(() =>
    getSessionInstructionRead(EQUIPMENT_INSTRUCTIONS_STORAGE_KEY)
  );

  const [mostrarModalInstrucciones, setMostrarModalInstrucciones] = useState(
    () => !getSessionInstructionRead(EQUIPMENT_INSTRUCTIONS_STORAGE_KEY)
  );

  const [instruccionesWarning, setInstruccionesWarning] = useState("");

  const [form, setForm] = useState<AltaEquipoForm>(initialAltaEquipoForm);

  const [sucursales, setSucursales] = useState<SucursalOption[]>([]);
  const [departamentos, setDepartamentos] = useState<DepartamentoOption[]>([]);
  const [razonesSociales, setRazonesSociales] = useState<RazonSocialOption[]>(
    []
  );
  const [monedas, setMonedas] = useState<MonedaOption[]>([]);
  const [proveedoresEmisores, setProveedoresEmisores] = useState<
    ProveedorEmisorOption[]
  >([]);
  const [facturas, setFacturas] = useState<FacturaCompraOption[]>([]);

  const [loadingCatalogos, setLoadingCatalogos] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<Mensaje | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const sucursalSeleccionada = sucursales.find(
    (sucursal) => sucursal.id === form.sucursalId
  );

  const departamentoSeleccionado = departamentos.find(
    (departamento) => departamento.id === form.departamentoId
  );

  const razonSocialSeleccionada = razonesSociales.find(
    (razonSocial) => razonSocial.id === form.razonSocialReceptoraId
  );

  const monedaSeleccionada = monedas.find(
    (moneda) => moneda.id === form.monedaId
  );

  const facturaSeleccionada = facturas.find(
    (factura) => factura.id === form.facturaId
  );

  const mostrarResumenUbicacion = Boolean(
    sucursalSeleccionada &&
      departamentoSeleccionado &&
      form.ubicacionExacta.trim()
  );

  const esCompraNueva = form.esAdquisicionNueva;
  const seleccionaFacturaExistente =
    esCompraNueva &&
    form.modoFactura === "Seleccionar factura existente";
  const registraFacturaNueva =
    esCompraNueva && form.modoFactura === "Registrar factura nueva";

  const requiredValues = useMemo(
    () => [
      Boolean(form.tipoEquipo),
      Boolean(form.marca.trim()),
      Boolean(form.numeroSerie.trim()),
      Boolean(form.hostname.trim()),
      Boolean(form.direccionIP.trim()),
      Boolean(form.sucursalId),
      Boolean(form.departamentoId),
      Boolean(form.ubicacionExacta.trim()),
      Boolean(form.tipoAdquisicion),
    ],
    [form]
  );

  const totalCamposRequeridos = requiredValues.length;
  const camposRequeridosCompletos = requiredValues.filter(Boolean).length;

  const progresoRequeridos = Math.round(
    (camposRequeridosCompletos / totalCamposRequeridos) * 100
  );

  useEffect(() => {
    void cargarCatalogos();
  }, []);

  async function cargarCatalogos() {
    try {
      setLoadingCatalogos(true);
      setMensaje(null);

      const [
        sucursalesData,
        departamentosData,
        razonesSocialesData,
        monedasData,
        proveedoresData,
        facturasData,
      ] = await Promise.all([
        getSucursalesEquipo(),
        getDepartamentosEquipo(),
        getRazonesSocialesEquipo(),
        getMonedasEquipo(),
        getProveedoresEmisoresEquipo(),
        getFacturasEquipo(),
      ]);

      setSucursales(sucursalesData);
      setDepartamentos(departamentosData);
      setRazonesSociales(razonesSocialesData);
      setMonedas(monedasData);
      setProveedoresEmisores(proveedoresData);
      setFacturas(facturasData);

      const monedaMxn = monedasData.find(
        (moneda) => moneda.codigo.toUpperCase() === "MXN"
      );

      if (monedaMxn) {
        setForm((current) =>
          current.esAdquisicionNueva
            ? {
                ...current,
                monedaId: current.monedaId || monedaMxn.id,
              }
            : current
        );
      }
    } catch (error) {
      console.error("Error cargando catálogos:", error);

      setMensaje({
        tipo: "error",
        texto:
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los catálogos. Intenta nuevamente.",
      });
    } finally {
      setLoadingCatalogos(false);
    }
  }

  function updateField<K extends keyof AltaEquipoForm>(
    field: K,
    value: AltaEquipoForm[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  }

  function handleEsAdquisicionNuevaChange(checked: boolean) {
    const monedaMxn = monedas.find(
      (moneda) => moneda.codigo.toUpperCase() === "MXN"
    );

    setForm((current) => {
      if (checked) {
        return {
          ...current,
          esAdquisicionNueva: true,
          tipoAdquisicion: "Compra nueva",
          monedaId: current.monedaId || monedaMxn?.id || "",
        };
      }

      return {
        ...current,
        esAdquisicionNueva: false,
        tipoAdquisicion:
          current.tipoAdquisicion &&
          current.tipoAdquisicion !== "Compra nueva"
            ? current.tipoAdquisicion
            : "Equipo existente",
        costoIndividualEquipo: "",
        numeroPartidaFactura: "",
        monedaId: "",
        modoFactura: "Sin factura por el momento",
        facturaId: "",
        numeroFactura: "",
        uuidFiscal: "",
        fechaFactura: "",
        razonSocialReceptoraId: "",
        proveedorEmisorId: "",
        razonSocialEmisor: "",
        rfcEmisor: "",
        subtotalFactura: "",
        impuestosFactura: "",
        montoTotalFactura: "",
        observacionesFactura: "",
        facturaPdf: null,
        facturaXml: null,
      };
    });

    setErrors((current) => ({
      ...current,
      tipoAdquisicion: "",
      costoIndividualEquipo: "",
      numeroPartidaFactura: "",
      monedaId: "",
      modoFactura: "",
      facturaId: "",
      numeroFactura: "",
      uuidFiscal: "",
      fechaFactura: "",
      razonSocialReceptoraId: "",
      proveedorEmisorId: "",
      razonSocialEmisor: "",
      rfcEmisor: "",
      subtotalFactura: "",
      impuestosFactura: "",
      montoTotalFactura: "",
      observacionesFactura: "",
      facturaPdf: "",
      facturaXml: "",
    }));
  }

  function handleProveedorEmisorChange(proveedorId: string) {
    const proveedor = proveedoresEmisores.find(
      (item) => item.id === proveedorId
    );

    setForm((current) => ({
      ...current,
      proveedorEmisorId: proveedorId,
      razonSocialEmisor: proveedor
        ? proveedor.razonSocial || proveedor.nombre
        : current.razonSocialEmisor,
      rfcEmisor: proveedor?.rfc || current.rfcEmisor,
    }));

    setErrors((current) => ({
      ...current,
      proveedorEmisorId: "",
      razonSocialEmisor: "",
      rfcEmisor: "",
    }));
  }

  function handleFacturaExistenteChange(facturaId: string) {
    const factura = facturas.find((item) => item.id === facturaId);

    setForm((current) => ({
      ...current,
      facturaId,
      monedaId: factura?.monedaId || current.monedaId,
    }));

    setErrors((current) => ({
      ...current,
      facturaId: "",
      monedaId: "",
    }));
  }

  function validateForm() {
    const nextErrors: FormErrors = {};

    if (!form.tipoEquipo) {
      nextErrors.tipoEquipo = "Selecciona el tipo de equipo.";
    }

    if (!form.marca.trim()) {
      nextErrors.marca = "Captura la marca del equipo.";
    }

    if (!form.numeroSerie.trim()) {
      nextErrors.numeroSerie = "Captura el número de serie.";
    }

    if (!form.hostname.trim()) {
      nextErrors.hostname = "Captura el hostname.";
    }

    if (!form.direccionIP.trim()) {
      nextErrors.direccionIP = "Captura la dirección IP.";
    } else if (!isValidIPv4(form.direccionIP)) {
      nextErrors.direccionIP = "Captura una dirección IPv4 válida.";
    }

    if (!form.sucursalId) {
      nextErrors.sucursalId = "Selecciona una sucursal.";
    }

    if (!form.departamentoId) {
      nextErrors.departamentoId = "Selecciona un departamento.";
    }

    if (!form.ubicacionExacta.trim()) {
      nextErrors.ubicacionExacta = "Captura la ubicación exacta del equipo.";
    }

    if (!form.tipoAdquisicion) {
      nextErrors.tipoAdquisicion =
        "Selecciona cómo se adquirió o incorporó el equipo.";
    }

    if (
      form.costoIndividualEquipo &&
      !isValidMoney(form.costoIndividualEquipo)
    ) {
      nextErrors.costoIndividualEquipo =
        "Captura un costo válido mayor o igual a cero.";
    }

    const monedaCostoId = facturaSeleccionada?.monedaId || form.monedaId;

    if (form.costoIndividualEquipo.trim() && !monedaCostoId) {
      nextErrors.monedaId =
        "Selecciona una moneda para el costo individual.";
    }

    if (registraFacturaNueva) {
      if (form.montoTotalFactura && !isValidMoney(form.montoTotalFactura)) {
        nextErrors.montoTotalFactura =
          "Captura un monto total válido mayor o igual a cero.";
      }

      if (form.subtotalFactura && !isValidMoney(form.subtotalFactura)) {
        nextErrors.subtotalFactura =
          "Captura un subtotal válido mayor o igual a cero.";
      }

      if (form.impuestosFactura && !isValidMoney(form.impuestosFactura)) {
        nextErrors.impuestosFactura =
          "Captura un importe de impuestos válido.";
      }

      const tieneImportesFactura = Boolean(
        form.subtotalFactura.trim() ||
          form.impuestosFactura.trim() ||
          form.montoTotalFactura.trim()
      );

      if (tieneImportesFactura && !form.monedaId) {
        nextErrors.monedaId =
          "Selecciona una moneda cuando captures importes de factura.";
      }

      if (form.facturaPdf) {
        if (!hasExpectedExtension(form.facturaPdf, ".pdf")) {
          nextErrors.facturaPdf = "El archivo de factura debe ser PDF.";
        } else if (form.facturaPdf.size > MAX_FACTURA_PDF_BYTES) {
          nextErrors.facturaPdf = `El PDF no puede superar ${formatFileSize(
            MAX_FACTURA_PDF_BYTES
          )}.`;
        }
      }

      if (form.facturaXml) {
        if (!hasExpectedExtension(form.facturaXml, ".xml")) {
          nextErrors.facturaXml = "El archivo fiscal debe ser XML.";
        } else if (form.facturaXml.size > MAX_FACTURA_XML_BYTES) {
          nextErrors.facturaXml = `El XML no puede superar ${formatFileSize(
            MAX_FACTURA_XML_BYTES
          )}.`;
        }
      }
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  function limpiarFormulario() {
    setMostrarConfirmacionLimpiar(true);
  }

  function confirmarLimpiarFormulario() {
    setForm(initialAltaEquipoForm);
    setErrors({});
    setMensaje(null);
    setMostrarModalExito(false);
    setMostrarConfirmacionLimpiar(false);
  }

  async function handleSubmit() {
    try {
      setMensaje(null);

      const isValid = validateForm();

      if (!isValid) {
        setMensaje({
          tipo: "error",
          texto: "Revisa los campos obligatorios antes de guardar.",
        });
        return;
      }

      setGuardando(true);

      const normalizedForm: AltaEquipoForm = {
        ...form,
        direccionIP: normalizeIp(form.direccionIP),
      };

      await crearEquipo(normalizedForm);

      setMensaje(null);
      setForm(initialAltaEquipoForm);
      setErrors({});
      setMostrarModalExito(true);
    } catch (error) {
      console.error("Error guardando equipo:", error);

      setMostrarModalExito(false);

      setMensaje({
        tipo: "error",
        texto:
          error instanceof Error
            ? error.message
            : "No se pudo guardar el equipo. Revisa la información e intenta nuevamente.",
      });
    } finally {
      setGuardando(false);
    }
  }

  function abrirInstrucciones() {
    instructionStartTimeRef.current = Date.now();
    setInstruccionesWarning("");
    setMostrarModalInstrucciones(true);
  }

  function continuarDesdeInstrucciones() {
    const segundosTranscurridos = getInstructionElapsedSeconds(
      instructionStartTimeRef.current
    );

    if (
      !instruccionesLeidas &&
      segundosTranscurridos < MIN_INSTRUCTION_READ_SECONDS
    ) {
      setInstruccionesWarning(
        `Lectura omitida detectada. Intentaste continuar en ${segundosTranscurridos} segundo${
          segundosTranscurridos === 1 ? "" : "s"
        }, pero ese tiempo no alcanza para revisar las instrucciones operativas. Debes leerlas antes de continuar con el registro.`
      );

      return;
    }

    markSessionInstructionRead(EQUIPMENT_INSTRUCTIONS_STORAGE_KEY);
    setInstruccionesLeidas(true);
    setInstruccionesWarning("");
    setMostrarModalInstrucciones(false);
  }

  return (
    <main className="coreforms-page">
      <section className="coreforms-shell">
        <header className="coreforms-header">
          <div>
            <p className="coreforms-eyebrow">CoreForms · Activos de TI</p>
            <h1>Registrar equipo TI</h1>
            <p>
              Captura un activo tecnológico, su identificación técnica,
              ubicación e información de adquisición.
            </p>
          </div>

          <div className="coreforms-header-actions">
            {onBack && (
              <button
                type="button"
                className="coreforms-secondary-button"
                onClick={onBack}
              >
                Volver a CoreForms
              </button>
            )}

            <button
              type="button"
              className="coreforms-secondary-button"
              onClick={abrirInstrucciones}
            >
              Ver instrucciones
            </button>
          </div>
        </header>

        <div className="coreforms-progress-card">
          <div className="coreforms-progress-header">
            <div>
              <strong>
                Campos requeridos completados: {camposRequeridosCompletos}/
                {totalCamposRequeridos}
              </strong>
              <span>Los campos requeridos están marcados con *</span>
            </div>

            <span className="coreforms-progress-percent">
              {progresoRequeridos}%
            </span>
          </div>

          <div className="coreforms-progress-track">
            <div
              className="coreforms-progress-fill"
              style={{ width: `${progresoRequeridos}%` }}
            />
          </div>
        </div>

        {mensaje && (
          <div className={`coreforms-message coreforms-message-${mensaje.tipo}`}>
            {mensaje.texto}
          </div>
        )}

        {loadingCatalogos && (
          <div className="coreforms-message coreforms-message-info">
            Cargando catálogos de inventario, facturas y monedas...
          </div>
        )}

        <CoreFormSection
          title="Identificación del equipo"
          description="Datos base para reconocer el activo dentro del inventario."
        >
          <CoreFormField label="Tipo de equipo" required>
            <select
              value={form.tipoEquipo}
              onChange={(event) =>
                updateField("tipoEquipo", event.target.value)
              }
              disabled={guardando}
              className={errors.tipoEquipo ? "is-invalid" : ""}
            >
              <option value="">Seleccionar tipo</option>

              {tipoEquipoOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            {errors.tipoEquipo && (
              <span className="coreforms-field-error">
                {errors.tipoEquipo}
              </span>
            )}
          </CoreFormField>

          <CoreFormField label="Marca" required>
            <input
              value={form.marca}
              onChange={(event) => updateField("marca", event.target.value)}
              placeholder="Ej. Dell, HP, Lenovo"
              disabled={guardando}
              className={errors.marca ? "is-invalid" : ""}
            />

            {errors.marca && (
              <span className="coreforms-field-error">{errors.marca}</span>
            )}
          </CoreFormField>

          <CoreFormField label="Modelo">
            <input
              value={form.modelo}
              onChange={(event) => updateField("modelo", event.target.value)}
              placeholder="Modelo del equipo"
              disabled={guardando}
            />
          </CoreFormField>

          <CoreFormField label="Número de serie" required>
            <input
              value={form.numeroSerie}
              onChange={(event) =>
                updateField("numeroSerie", event.target.value)
              }
              placeholder="Número de serie físico"
              disabled={guardando}
              className={errors.numeroSerie ? "is-invalid" : ""}
            />

            {errors.numeroSerie && (
              <span className="coreforms-field-error">
                {errors.numeroSerie}
              </span>
            )}
          </CoreFormField>
        </CoreFormSection>

        <CoreFormSection
          title="Datos técnicos"
          description="Información técnica para soporte, conectividad y acceso remoto."
        >
          <CoreFormField label="Hostname" required>
            <input
              value={form.hostname}
              onChange={(event) => updateField("hostname", event.target.value)}
              placeholder="Ej. LAP-TAM-001"
              disabled={guardando}
              className={errors.hostname ? "is-invalid" : ""}
            />

            {errors.hostname && (
              <span className="coreforms-field-error">{errors.hostname}</span>
            )}
          </CoreFormField>

          <CoreFormField label="Dirección IP" required>
            <input
              value={form.direccionIP}
              onChange={(event) =>
                updateField("direccionIP", event.target.value)
              }
              onBlur={() =>
                updateField("direccionIP", normalizeIp(form.direccionIP))
              }
              placeholder="Ej. 192.168.1.2"
              disabled={guardando}
              className={errors.direccionIP ? "is-invalid" : ""}
            />

            <span className="coreforms-field-help">
              Captura una IPv4 válida con cuatro bloques numéricos.
            </span>

            {errors.direccionIP && (
              <span className="coreforms-field-error">
                {errors.direccionIP}
              </span>
            )}
          </CoreFormField>

          <CoreFormField label="Sistema operativo">
            <input
              value={form.sistemaOperativo}
              onChange={(event) =>
                updateField("sistemaOperativo", event.target.value)
              }
              placeholder="Ej. Windows 11 Pro"
              disabled={guardando}
            />
          </CoreFormField>

          <CoreFormField label="Clave AnyDesk">
            <input
              value={form.claveAnyDesk}
              onChange={(event) =>
                updateField("claveAnyDesk", event.target.value)
              }
              placeholder="Clave o ID de acceso remoto"
              disabled={guardando}
            />
          </CoreFormField>
        </CoreFormSection>
        <CoreFormSection
          title="Estado inicial"
          description="Condición operativa y física del equipo al momento del registro."
        >
          <CoreFormField label="Estado de funcionamiento">
            <select
              value={form.estadoFuncionamiento}
              onChange={(event) =>
                updateField("estadoFuncionamiento", event.target.value)
              }
              disabled={guardando}
            >
              {estadoFuncionamientoOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </CoreFormField>

          <CoreFormField label="Condición física">
            <select
              value={form.condicionFisica}
              onChange={(event) =>
                updateField("condicionFisica", event.target.value)
              }
              disabled={guardando}
            >
              {condicionFisicaOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </CoreFormField>

          <CoreFormField label="Observaciones" fullWidth>
            <textarea
              value={form.observaciones}
              onChange={(event) =>
                updateField("observaciones", event.target.value)
              }
              placeholder="Notas adicionales del equipo"
              disabled={guardando}
            />
          </CoreFormField>
        </CoreFormSection>

        <CoreFormSection
          title="Asignación y ubicación"
          description="Sucursal, departamento y ubicación física donde opera el equipo."
        >
          <CoreFormField label="Sucursal" required>
            <select
              value={form.sucursalId}
              onChange={(event) => updateField("sucursalId", event.target.value)}
              disabled={loadingCatalogos || guardando}
              className={errors.sucursalId ? "is-invalid" : ""}
            >
              <option value="">Seleccionar sucursal</option>

              {sucursales.map((sucursal) => (
                <option key={sucursal.id} value={sucursal.id}>
                  {sucursal.nombre}
                </option>
              ))}
            </select>

            {errors.sucursalId && (
              <span className="coreforms-field-error">
                {errors.sucursalId}
              </span>
            )}
          </CoreFormField>

          <CoreFormField label="Departamento" required>
            <select
              value={form.departamentoId}
              onChange={(event) =>
                updateField("departamentoId", event.target.value)
              }
              disabled={loadingCatalogos || guardando}
              className={errors.departamentoId ? "is-invalid" : ""}
            >
              <option value="">Seleccionar departamento</option>

              {departamentos.map((departamento) => (
                <option key={departamento.id} value={departamento.id}>
                  {departamento.nombre}
                </option>
              ))}
            </select>

            {errors.departamentoId && (
              <span className="coreforms-field-error">
                {errors.departamentoId}
              </span>
            )}
          </CoreFormField>

          <CoreFormField label="Responsable">
            <input
              value={form.responsable}
              onChange={(event) =>
                updateField("responsable", event.target.value)
              }
              placeholder="Persona responsable del equipo"
              disabled={guardando}
            />
          </CoreFormField>

          <CoreFormField label="Ubicación exacta" required fullWidth>
            <textarea
              value={form.ubicacionExacta}
              onChange={(event) =>
                updateField("ubicacionExacta", event.target.value)
              }
              placeholder="Ej. Oficina de gerencia, mostrador principal, escritorio junto a recepción"
              disabled={guardando}
              className={errors.ubicacionExacta ? "is-invalid" : ""}
            />

            {errors.ubicacionExacta && (
              <span className="coreforms-field-error">
                {errors.ubicacionExacta}
              </span>
            )}
          </CoreFormField>

          {mostrarResumenUbicacion && (
            <div className="coreforms-location-summary coreforms-field-full">
              <span>Resumen de ubicación</span>
              <strong>
                {sucursalSeleccionada?.nombre}
                {" → "}
                {departamentoSeleccionado?.nombre}
              </strong>
              <p>{form.ubicacionExacta.trim()}</p>
            </div>
          )}
        </CoreFormSection>

        <CoreFormSection
          title="Información de adquisición"
          description="Indica si corresponde a una compra reciente. Todos los datos de facturación son opcionales y pueden completarse posteriormente."
        >
          <CoreFormField
            label="¿Este equipo corresponde a una compra nueva?"
            fullWidth
          >
            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.75rem",
                cursor: guardando ? "not-allowed" : "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={form.esAdquisicionNueva}
                onChange={(event) =>
                  handleEsAdquisicionNuevaChange(event.target.checked)
                }
                disabled={guardando}
                style={{
                  width: "18px",
                  height: "18px",
                  marginTop: "2px",
                  flex: "0 0 auto",
                }}
              />

              <span>
                <strong>
                  Sí, es una compra reciente y deseo capturar o asociar su
                  factura
                </strong>
                <span
                  className="coreforms-field-help"
                  style={{ display: "block", marginTop: "0.25rem" }}
                >
                  Déjalo desactivado para equipos existentes, transferidos,
                  arrendados, donados o incorporados sin una compra reciente.
                </span>
              </span>
            </label>
          </CoreFormField>

          {!esCompraNueva && (
            <>
              <CoreFormField label="Tipo de incorporación" required>
                <select
                  value={form.tipoAdquisicion}
                  onChange={(event) =>
                    updateField(
                      "tipoAdquisicion",
                      event.target.value as AltaEquipoForm["tipoAdquisicion"]
                    )
                  }
                  disabled={guardando}
                  className={errors.tipoAdquisicion ? "is-invalid" : ""}
                >
                  {tipoIncorporacionOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                {errors.tipoAdquisicion && (
                  <span className="coreforms-field-error">
                    {errors.tipoAdquisicion}
                  </span>
                )}
              </CoreFormField>

              <CoreFormField label="Fecha de incorporación">
                <input
                  type="date"
                  value={form.fechaAdquisicion}
                  onChange={(event) =>
                    updateField("fechaAdquisicion", event.target.value)
                  }
                  disabled={guardando}
                />

                <span className="coreforms-field-help">
                  Fecha aproximada o real en que el activo se incorporó al
                  inventario. Es opcional.
                </span>
              </CoreFormField>

              <div className="coreforms-location-summary coreforms-field-full">
                <span>Registro sin compra nueva</span>
                <strong>{form.tipoAdquisicion}</strong>
                <p>
                  No se solicitarán factura, importes, archivos fiscales ni
                  número de partida para este registro.
                </p>
              </div>
            </>
          )}

          {esCompraNueva && (
            <>
          <CoreFormField label="Fecha de adquisición">
            <input
              type="date"
              value={form.fechaAdquisicion}
              onChange={(event) =>
                updateField("fechaAdquisicion", event.target.value)
              }
              disabled={guardando}
            />

            <span className="coreforms-field-help">
              Fecha en que el activo fue comprado, recibido o incorporado.
            </span>
          </CoreFormField>

          <CoreFormField label="Costo individual del equipo">
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.costoIndividualEquipo}
              onChange={(event) =>
                updateField("costoIndividualEquipo", event.target.value)
              }
              placeholder="0.00"
              disabled={guardando}
              className={errors.costoIndividualEquipo ? "is-invalid" : ""}
            />

            <span className="coreforms-field-help">
              Importe asignado únicamente a este equipo, no el total completo
              de la factura.
            </span>

            {errors.costoIndividualEquipo && (
              <span className="coreforms-field-error">
                {errors.costoIndividualEquipo}
              </span>
            )}
          </CoreFormField>

          <CoreFormField label="Moneda">
            <select
              value={form.monedaId}
              onChange={(event) => updateField("monedaId", event.target.value)}
              disabled={
                loadingCatalogos ||
                guardando ||
                Boolean(seleccionaFacturaExistente && facturaSeleccionada)
              }
              className={errors.monedaId ? "is-invalid" : ""}
            >
              <option value="">Seleccionar moneda</option>

              {monedas.map((moneda) => (
                <option key={moneda.id} value={moneda.id}>
                  {moneda.codigo} · {moneda.nombre}
                </option>
              ))}
            </select>

            <span className="coreforms-field-help">
              {seleccionaFacturaExistente && facturaSeleccionada
                ? "La moneda se toma automáticamente de la factura seleccionada."
                : "Se utiliza para el costo individual y para una factura nueva."}
            </span>

            {errors.monedaId && (
              <span className="coreforms-field-error">{errors.monedaId}</span>
            )}
          </CoreFormField>

              <CoreFormField label="Manejo de la factura" fullWidth>
                <select
                  value={form.modoFactura}
                  onChange={(event) =>
                    updateField(
                      "modoFactura",
                      event.target.value as AltaEquipoForm["modoFactura"]
                    )
                  }
                  disabled={guardando}
                >
                  {modoFacturaOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <span className="coreforms-field-help">
                  Puedes asociar una factura ya registrada, capturar una nueva o
                  dejar la relación pendiente.
                </span>
              </CoreFormField>

              {form.modoFactura === "Sin factura por el momento" && (
                <div className="coreforms-location-summary coreforms-field-full">
                  <span>Factura pendiente</span>
                  <strong>El equipo se registrará sin factura asociada</strong>
                  <p>
                    La factura podrá relacionarse posteriormente desde
                    CoreInventory cuando la documentación esté disponible.
                  </p>
                </div>
              )}

              {seleccionaFacturaExistente && (
                <>
                  <CoreFormField label="Factura existente" fullWidth>
                    <select
                      value={form.facturaId}
                      onChange={(event) =>
                        handleFacturaExistenteChange(event.target.value)
                      }
                      disabled={loadingCatalogos || guardando}
                      className={errors.facturaId ? "is-invalid" : ""}
                    >
                      <option value="">Seleccionar factura</option>

                      {facturas.map((factura) => (
                        <option key={factura.id} value={factura.id}>
                          {factura.referencia}
                        </option>
                      ))}
                    </select>

                    <span className="coreforms-field-help">
                      Selecciona la factura cuando ya fue utilizada para
                      registrar otro equipo o se capturó previamente.
                    </span>

                    {errors.facturaId && (
                      <span className="coreforms-field-error">
                        {errors.facturaId}
                      </span>
                    )}
                  </CoreFormField>

                  {facturaSeleccionada && (
                    <div className="coreforms-location-summary coreforms-field-full">
                      <span>Factura seleccionada</span>
                      <strong>{facturaSeleccionada.referencia}</strong>
                      <p>
                        Receptora: {facturaSeleccionada.razonSocialReceptoraNombre || "Sin dato"}
                        {" · "}
                        Emisor: {facturaSeleccionada.razonSocialEmisor || facturaSeleccionada.proveedorEmisorNombre || "Sin dato"}
                      </p>
                      <p>
                        Fecha: {facturaSeleccionada.fechaFactura || "Sin fecha"}
                        {" · "}
                        Total: {formatAmount(facturaSeleccionada.montoTotal)}
                        {" · "}
                        Moneda: {facturaSeleccionada.monedaNombre || "Sin moneda"}
                      </p>
                      <p>
                        PDF: {facturaSeleccionada.tienePdf ? "Disponible" : "No"}
                        {" · "}
                        XML: {facturaSeleccionada.tieneXml ? "Disponible" : "No"}
                      </p>
                    </div>
                  )}
                </>
              )}

              {registraFacturaNueva && (
                <>
                  <CoreFormField label="Número de factura">
                    <input
                      value={form.numeroFactura}
                      onChange={(event) =>
                        updateField("numeroFactura", event.target.value)
                      }
                      placeholder="Folio o número visible de la factura"
                      disabled={guardando}
                      className={errors.numeroFactura ? "is-invalid" : ""}
                    />

                    {errors.numeroFactura && (
                      <span className="coreforms-field-error">
                        {errors.numeroFactura}
                      </span>
                    )}
                  </CoreFormField>

                  <CoreFormField label="Fecha de factura">
                    <input
                      type="date"
                      value={form.fechaFactura}
                      onChange={(event) =>
                        updateField("fechaFactura", event.target.value)
                      }
                      disabled={guardando}
                      className={errors.fechaFactura ? "is-invalid" : ""}
                    />

                    {errors.fechaFactura && (
                      <span className="coreforms-field-error">
                        {errors.fechaFactura}
                      </span>
                    )}
                  </CoreFormField>

                  <CoreFormField label="UUID fiscal">
                    <input
                      value={form.uuidFiscal}
                      onChange={(event) =>
                        updateField("uuidFiscal", event.target.value)
                      }
                      placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
                      disabled={guardando}
                      className={errors.uuidFiscal ? "is-invalid" : ""}
                    />

                    <span className="coreforms-field-help">
                      Es obligatorio cuando adjuntes el XML fiscal.
                    </span>

                    {errors.uuidFiscal && (
                      <span className="coreforms-field-error">
                        {errors.uuidFiscal}
                      </span>
                    )}
                  </CoreFormField>

                  <CoreFormField label="Razón social receptora">
                    <select
                      value={form.razonSocialReceptoraId}
                      onChange={(event) =>
                        updateField("razonSocialReceptoraId", event.target.value)
                      }
                      disabled={loadingCatalogos || guardando}
                      className={errors.razonSocialReceptoraId ? "is-invalid" : ""}
                    >
                      <option value="">Seleccionar razón social</option>

                      {razonesSociales.map((razonSocial) => (
                        <option key={razonSocial.id} value={razonSocial.id}>
                          {razonSocial.nombre}
                        </option>
                      ))}
                    </select>

                    {razonSocialSeleccionada?.rfc && (
                      <span className="coreforms-field-help">
                        RFC receptor: {razonSocialSeleccionada.rfc}
                      </span>
                    )}

                    {errors.razonSocialReceptoraId && (
                      <span className="coreforms-field-error">
                        {errors.razonSocialReceptoraId}
                      </span>
                    )}
                  </CoreFormField>

                  <CoreFormField label="Proveedor del catálogo">
                    <select
                      value={form.proveedorEmisorId}
                      onChange={(event) =>
                        handleProveedorEmisorChange(event.target.value)
                      }
                      disabled={loadingCatalogos || guardando}
                    >
                      <option value="">
                        No está en catálogo / Capturar manualmente
                      </option>

                      {proveedoresEmisores.map((proveedor) => (
                        <option key={proveedor.id} value={proveedor.id}>
                          {proveedor.nombre}
                        </option>
                      ))}
                    </select>

                    <span className="coreforms-field-help">
                      Es opcional. Al seleccionar un proveedor se completarán
                      sus datos fiscales disponibles.
                    </span>
                  </CoreFormField>

                  <CoreFormField label="Razón social del emisor">
                    <input
                      value={form.razonSocialEmisor}
                      onChange={(event) =>
                        updateField("razonSocialEmisor", event.target.value)
                      }
                      placeholder="Razón social que aparece en la factura"
                      disabled={guardando}
                      className={errors.razonSocialEmisor ? "is-invalid" : ""}
                    />

                    {errors.razonSocialEmisor && (
                      <span className="coreforms-field-error">
                        {errors.razonSocialEmisor}
                      </span>
                    )}
                  </CoreFormField>

                  <CoreFormField label="RFC del emisor">
                    <input
                      value={form.rfcEmisor}
                      onChange={(event) =>
                        updateField("rfcEmisor", event.target.value)
                      }
                      placeholder="RFC del proveedor emisor"
                      disabled={guardando}
                      className={errors.rfcEmisor ? "is-invalid" : ""}
                    />

                    {errors.rfcEmisor && (
                      <span className="coreforms-field-error">
                        {errors.rfcEmisor}
                      </span>
                    )}
                  </CoreFormField>

                  <CoreFormField label="Subtotal">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.subtotalFactura}
                      onChange={(event) =>
                        updateField("subtotalFactura", event.target.value)
                      }
                      placeholder="0.00"
                      disabled={guardando}
                      className={errors.subtotalFactura ? "is-invalid" : ""}
                    />

                    {errors.subtotalFactura && (
                      <span className="coreforms-field-error">
                        {errors.subtotalFactura}
                      </span>
                    )}
                  </CoreFormField>

                  <CoreFormField label="Impuestos">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.impuestosFactura}
                      onChange={(event) =>
                        updateField("impuestosFactura", event.target.value)
                      }
                      placeholder="0.00"
                      disabled={guardando}
                      className={errors.impuestosFactura ? "is-invalid" : ""}
                    />

                    {errors.impuestosFactura && (
                      <span className="coreforms-field-error">
                        {errors.impuestosFactura}
                      </span>
                    )}
                  </CoreFormField>

                  <CoreFormField label="Monto total">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.montoTotalFactura}
                      onChange={(event) =>
                        updateField("montoTotalFactura", event.target.value)
                      }
                      placeholder="0.00"
                      disabled={guardando}
                      className={errors.montoTotalFactura ? "is-invalid" : ""}
                    />

                    {errors.montoTotalFactura && (
                      <span className="coreforms-field-error">
                        {errors.montoTotalFactura}
                      </span>
                    )}
                  </CoreFormField>

                  <CoreFormField label="Factura PDF">
                    <input
                      key={form.facturaPdf?.name || "factura-pdf-empty"}
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(event) =>
                        updateField("facturaPdf", event.target.files?.[0] || null)
                      }
                      disabled={guardando}
                      className={errors.facturaPdf ? "is-invalid" : ""}
                    />

                    <span className="coreforms-field-help">
                      Archivo opcional. Máximo {formatFileSize(MAX_FACTURA_PDF_BYTES)}.
                    </span>

                    {form.facturaPdf && (
                      <div className="coreforms-location-summary">
                        <span>PDF SELECCIONADO</span>
                        <strong>{form.facturaPdf.name}</strong>
                        <p>Tamaño: {formatFileSize(form.facturaPdf.size)}</p>

                        <button
                          type="button"
                          className="coreforms-secondary-button"
                          onClick={() => updateField("facturaPdf", null)}
                          disabled={guardando}
                        >
                          Quitar PDF
                        </button>
                      </div>
                    )}

                    {errors.facturaPdf && (
                      <span className="coreforms-field-error">
                        {errors.facturaPdf}
                      </span>
                    )}
                  </CoreFormField>

                  <CoreFormField label="Factura XML">
                    <input
                      key={form.facturaXml?.name || "factura-xml-empty"}
                      type="file"
                      accept=".xml,text/xml,application/xml"
                      onChange={(event) =>
                        updateField("facturaXml", event.target.files?.[0] || null)
                      }
                      disabled={guardando}
                      className={errors.facturaXml ? "is-invalid" : ""}
                    />

                    <span className="coreforms-field-help">
                      Archivo opcional. Máximo {formatFileSize(MAX_FACTURA_XML_BYTES)}.
                    </span>

                    {form.facturaXml && (
                      <div className="coreforms-location-summary">
                        <span>XML SELECCIONADO</span>
                        <strong>{form.facturaXml.name}</strong>
                        <p>Tamaño: {formatFileSize(form.facturaXml.size)}</p>

                        <button
                          type="button"
                          className="coreforms-secondary-button"
                          onClick={() => updateField("facturaXml", null)}
                          disabled={guardando}
                        >
                          Quitar XML
                        </button>
                      </div>
                    )}

                    {errors.facturaXml && (
                      <span className="coreforms-field-error">
                        {errors.facturaXml}
                      </span>
                    )}
                  </CoreFormField>

                  <CoreFormField label="Observaciones de la factura" fullWidth>
                    <textarea
                      value={form.observacionesFactura}
                      onChange={(event) =>
                        updateField("observacionesFactura", event.target.value)
                      }
                      placeholder="Notas fiscales, aclaraciones o información adicional"
                      disabled={guardando}
                    />
                  </CoreFormField>

                  <div className="coreforms-location-summary coreforms-field-full">
                    <span>Resumen de factura nueva</span>
                    <strong>
                      {form.numeroFactura.trim() || "Sin número de factura"}
                      {" · "}
                      {monedaSeleccionada?.codigo || "Sin moneda"}
                    </strong>
                    <p>
                      Receptora: {razonSocialSeleccionada?.nombre || "Sin razón social seleccionada"}
                    </p>
                    <p>
                      Emisor: {form.razonSocialEmisor.trim() || "Sin razón social del emisor"}
                      {" · "}
                      Total: {form.montoTotalFactura.trim() || "0.00"}
                    </p>
                  </div>
                </>
              )}

              {form.modoFactura !== "Sin factura por el momento" && (
                <CoreFormField label="Número de partida de factura" fullWidth>
                  <input
                    value={form.numeroPartidaFactura}
                    onChange={(event) =>
                      updateField("numeroPartidaFactura", event.target.value)
                    }
                    placeholder="Ej. 1, 01, PART-003 o Renglón 5"
                    disabled={guardando}
                  />

                  <span className="coreforms-field-help">
                    Identifica el renglón de la factura donde aparece este
                    equipo. Es opcional.
                  </span>
                </CoreFormField>
              )}
            </>
          )}
        </CoreFormSection>


        <div className="coreforms-actions">
          <button
            type="button"
            className="coreforms-secondary-button"
            onClick={limpiarFormulario}
            disabled={guardando}
          >
            Limpiar formulario
          </button>

          <button
            type="button"
            className="coreforms-primary-button"
            onClick={handleSubmit}
            disabled={loadingCatalogos || guardando}
          >
            {guardando ? "Guardando equipo..." : "Guardar equipo"}
          </button>
        </div>
      </section>

      {mostrarModalInstrucciones && (
        <div
          className={`coreforms-modal-backdrop ${
            instruccionesWarning ? "coreforms-modal-backdrop-critical" : ""
          }`}
          role="dialog"
          aria-modal="true"
        >
          <div
            className={`coreforms-modal coreforms-modal-instructions ${
              instruccionesWarning ? "coreforms-modal-critical" : ""
            }`}
          >
            <h2>Instrucciones del formulario</h2>

            <p>
              Usa este formulario para registrar equipos nuevos o existentes en
              CoreInventory.
            </p>

            <ul>
              <li>
                Verifica bien los datos clave: tipo de equipo, marca, número de
                serie, hostname y dirección IP.
              </li>

              <li>
                La IP debe tener formato válido, por ejemplo:{" "}
                <strong>192.168.1.2</strong>.
              </li>

              <li>
                Selecciona correctamente la sucursal, departamento y ubicación
                exacta del equipo.
              </li>

              <li>
                Activa la casilla de compra nueva únicamente cuando el equipo
                corresponda a una adquisición reciente. Al activarla podrás
                seleccionar una factura existente, registrar una nueva o dejar
                la documentación pendiente.
              </li>

              <li>
                El costo individual corresponde únicamente a este equipo; no
                necesariamente debe coincidir con el monto total de la factura.
              </li>

              <li>
                Si adjuntas XML, captura también el UUID fiscal. El PDF admite
                hasta 15 MB y el XML hasta 5 MB.
              </li>

              <li>
                Si el formulario falla, escribe a{" "}
                <strong>soporte@dirego.com</strong>. Para dudas de captura,
                contacta por Teams a{" "}
                <strong>Pedro Uriel Cruz Rivera</strong>.
              </li>
            </ul>

            {instruccionesWarning && (
              <div className="coreforms-instruction-warning">
                {instruccionesWarning}
              </div>
            )}

            <div className="coreforms-modal-actions">
              <button
                type="button"
                className="coreforms-primary-button"
                onClick={continuarDesdeInstrucciones}
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

              {guardando && (
          <div
            className="coreforms-modal-backdrop coreforms-saving-backdrop"
            role="dialog"
            aria-modal="true"
            aria-labelledby="coreforms-saving-title"
            aria-describedby="coreforms-saving-description"
          >
            <div className="coreforms-modal coreforms-saving-modal">
              <div
                className="coreforms-saving-spinner"
                aria-hidden="true"
              />

              <h2 id="coreforms-saving-title">
                Guardando equipo
              </h2>

              <p id="coreforms-saving-description">
                Estamos registrando la información del equipo
                y sus datos relacionados.
              </p>

              <div className="coreforms-saving-status">
                <span className="coreforms-saving-status-dot" />
                <span>
                  No cierres esta pantalla. El proceso puede tardar
                  algunos segundos.
                </span>
              </div>
            </div>
          </div>
        )}


      {mostrarModalExito && (
        <div className="coreforms-modal-backdrop" role="dialog" aria-modal="true">
          <div className="coreforms-modal">
            <div className="coreforms-modal-icon coreforms-modal-icon-success">
              OK
            </div>

            <h2>Equipo registrado correctamente</h2>

            <p>
              La información del activo y, cuando correspondía, su factura,
              archivos y relación de compra fueron guardados correctamente.
            </p>

            <div className="coreforms-modal-actions">
              <button
                type="button"
                className="coreforms-primary-button"
                onClick={() => {
                  setMensaje(null);
                  setErrors({});
                  setMostrarModalExito(false);

                  requestAnimationFrame(() => {
                    window.scrollTo({
                      top: 0,
                      left: 0,
                      behavior: "smooth",
                    });
                  });
                }}
              >
                Capturar otro equipo
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarConfirmacionLimpiar && (
        <div className="coreforms-modal-backdrop" role="dialog" aria-modal="true">
          <div className="coreforms-modal">
            <div className="coreforms-modal-icon coreforms-modal-icon-warning">
              !
            </div>

            <h2>Limpiar formulario</h2>

            <p>
              Se eliminarán los datos capturados en pantalla, incluidos los
              archivos seleccionados. Esta acción no afectará registros ya
              guardados.
            </p>

            <div className="coreforms-modal-actions coreforms-modal-actions-split">
              <button
                type="button"
                className="coreforms-secondary-button"
                onClick={() => setMostrarConfirmacionLimpiar(false)}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="coreforms-danger-button"
                onClick={confirmarLimpiarFormulario}
              >
                Sí, limpiar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
