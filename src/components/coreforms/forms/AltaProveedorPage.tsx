import { useEffect, useMemo, useRef, useState } from "react";

import CoreFormField from "../shared/CoreFormField";
import CoreFormSection from "../shared/CoreFormSection";
import CoreMultiSelectModal from "../shared/CoreMultiSelectModal";

import {
  estadoServicioOptions,
  initialAltaProveedorForm,
  tipoContactoOptions,
  tipoServicioOptions,
  type AltaProveedorForm,
  type SucursalOption,
  type TipoServicio,
} from "../../../interfaces/altaProveedor";

import {
  crearProveedorCompleto,
  getSucursalesProveedor,
} from "../../../services/proveedoresFormService";

type FormErrors = Partial<Record<keyof AltaProveedorForm, string>>;

type Mensaje = {
  tipo: "success" | "error" | "info";
  texto: string;
};

type AltaProveedorPageProps = {
  onBack?: () => void;
};

type SelectorAbierto = "sucursales" | "servicios" | null;

const MIN_INSTRUCTION_READ_SECONDS = 12;

const SUPPLIER_INSTRUCTIONS_STORAGE_KEY =
  "coreforms:alta-proveedor:instructions-read";

const descripcionServicios: Record<TipoServicio, string> = {
  Internet: "Conectividad, enlaces, redes y servicio de internet.",
  CCTV: "Videovigilancia, cámaras, grabadores y soporte relacionado.",
  Computadoras: "Equipos, reparación, mantenimiento y soporte de cómputo.",
};

function isValidEmail(value: string) {
  const email = value.trim();

  if (!email) return true;

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

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

export default function AltaProveedorPage({
  onBack,
}: AltaProveedorPageProps) {
  const [mostrarModalExito, setMostrarModalExito] = useState(false);
  const [mostrarConfirmacionLimpiar, setMostrarConfirmacionLimpiar] =
    useState(false);

  const [selectorAbierto, setSelectorAbierto] =
    useState<SelectorAbierto>(null);

  const instructionStartTimeRef = useRef(Date.now());

  const [instruccionesLeidas, setInstruccionesLeidas] = useState(() =>
    getSessionInstructionRead(SUPPLIER_INSTRUCTIONS_STORAGE_KEY)
  );

  const [mostrarModalInstrucciones, setMostrarModalInstrucciones] = useState(
    () => !getSessionInstructionRead(SUPPLIER_INSTRUCTIONS_STORAGE_KEY)
  );

  const [instruccionesWarning, setInstruccionesWarning] = useState("");

  const [form, setForm] =
    useState<AltaProveedorForm>(initialAltaProveedorForm);

  const [sucursales, setSucursales] = useState<SucursalOption[]>([]);

  const [loadingCatalogos, setLoadingCatalogos] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<Mensaje | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const sucursalesSeleccionadas = useMemo(
    () =>
      sucursales.filter((sucursal) =>
        form.sucursalIds.includes(sucursal.id)
      ),
    [form.sucursalIds, sucursales]
  );

  const totalAsignaciones =
    form.sucursalIds.length * form.tiposServicio.length;

  const mostrarResumenServicio = Boolean(
    form.nombreProveedor.trim() &&
      form.sucursalIds.length > 0 &&
      form.tiposServicio.length > 0 &&
      form.estadoServicio
  );

  const totalCamposRequeridos = 6;

  const camposRequeridosCompletos = [
    Boolean(form.nombreProveedor.trim()),
    Boolean(form.nombreContacto.trim()),
    Boolean(form.tipoContacto),
    form.sucursalIds.length > 0,
    form.tiposServicio.length > 0,
    Boolean(form.estadoServicio),
  ].filter(Boolean).length;

  const progresoRequeridos = Math.round(
    (camposRequeridosCompletos / totalCamposRequeridos) * 100
  );

  const sucursalModalOptions = useMemo(
    () =>
      sucursales.map((sucursal) => ({
        id: sucursal.id,
        label: sucursal.nombre,
      })),
    [sucursales]
  );

  const servicioModalOptions = useMemo(
    () =>
      tipoServicioOptions.map((servicio) => ({
        id: servicio,
        label: servicio,
        description: descripcionServicios[servicio],
      })),
    []
  );

  useEffect(() => {
    void cargarCatalogos();
  }, []);

  async function cargarCatalogos() {
    try {
      setLoadingCatalogos(true);
      setMensaje(null);

      const sucursalesData = await getSucursalesProveedor();

      setSucursales(sucursalesData);
    } catch (error) {
      console.error("Error cargando catálogos:", error);

      setMensaje({
        tipo: "error",
        texto: "No se pudieron cargar los catálogos. Intenta nuevamente.",
      });
    } finally {
      setLoadingCatalogos(false);
    }
  }

  function updateField<K extends keyof AltaProveedorForm>(
    field: K,
    value: AltaProveedorForm[K]
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

  function removeSucursal(sucursalId: string) {
    updateField(
      "sucursalIds",
      form.sucursalIds.filter((id) => id !== sucursalId)
    );
  }

  function removeServicio(tipoServicio: TipoServicio) {
    updateField(
      "tiposServicio",
      form.tiposServicio.filter(
        (servicio) => servicio !== tipoServicio
      )
    );
  }

  function validateForm() {
    const nextErrors: FormErrors = {};

    if (!form.nombreProveedor.trim()) {
      nextErrors.nombreProveedor = "Captura el nombre del proveedor.";
    }

    if (!form.nombreContacto.trim()) {
      nextErrors.nombreContacto = "Captura el nombre del contacto principal.";
    }

    if (!form.tipoContacto) {
      nextErrors.tipoContacto = "Selecciona el tipo de contacto.";
    }

    if (form.correoContacto && !isValidEmail(form.correoContacto)) {
      nextErrors.correoContacto = "Captura un correo de contacto válido.";
    }

    if (form.sucursalIds.length === 0) {
      nextErrors.sucursalIds =
        "Selecciona al menos una sucursal atendida.";
    }

    if (form.tiposServicio.length === 0) {
      nextErrors.tiposServicio =
        "Selecciona al menos un servicio proporcionado.";
    }

    if (!form.estadoServicio) {
      nextErrors.estadoServicio = "Selecciona el estado del servicio.";
    }

    if (
      !form.usarContactoComoSoporte &&
      form.correoSoporte &&
      !isValidEmail(form.correoSoporte)
    ) {
      nextErrors.correoSoporte = "Captura un correo de soporte válido.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  function limpiarFormulario() {
    setMostrarConfirmacionLimpiar(true);
  }

  function confirmarLimpiarFormulario() {
    setForm(initialAltaProveedorForm);
    setErrors({});
    setMensaje(null);
    setSelectorAbierto(null);
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

      await crearProveedorCompleto(form);

      setMensaje(null);
      setForm(initialAltaProveedorForm);
      setErrors({});
      setSelectorAbierto(null);
      setMostrarModalExito(true);
    } catch (error) {
      console.error("Error guardando proveedor:", error);

      setMostrarModalExito(false);

      setMensaje({
        tipo: "error",
        texto:
          error instanceof Error
            ? error.message
            : "No se pudo guardar el proveedor. Revisa la información e intenta nuevamente.",
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

    markSessionInstructionRead(SUPPLIER_INSTRUCTIONS_STORAGE_KEY);
    setInstruccionesLeidas(true);
    setInstruccionesWarning("");
    setMostrarModalInstrucciones(false);
  }

  return (
    <main className="coreforms-page">
      <section className="coreforms-shell">
        <header className="coreforms-header">
          <div>
            <p className="coreforms-eyebrow">CoreForms · Proveedores</p>
            <h1>Registrar proveedor</h1>
            <p>
              Captura el proveedor, un contacto operativo y todos los servicios
              que brinda en una o varias sucursales.
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
            Cargando catálogos...
          </div>
        )}

        <CoreFormSection
          title="Datos del proveedor"
          description="Información principal para identificar al proveedor."
        >
          <CoreFormField label="Nombre del proveedor" required fullWidth>
            <input
              value={form.nombreProveedor}
              onChange={(event) =>
                updateField("nombreProveedor", event.target.value)
              }
              placeholder="Ej. Telmex, Megacable, Proveedor ABC"
              disabled={guardando}
              className={errors.nombreProveedor ? "is-invalid" : ""}
            />

            <span className="coreforms-field-help">
              Escribe el nombre comercial con el que se identifica al
              proveedor. Antes de registrar, verifica que no exista previamente
              en el catálogo.
            </span>

            {errors.nombreProveedor && (
              <span className="coreforms-field-error">
                {errors.nombreProveedor}
              </span>
            )}
          </CoreFormField>
        </CoreFormSection>

        <CoreFormSection
          title="Contacto de atención"
          description="Persona, ejecutivo, mesa de ayuda o canal que atenderá al equipo de TI."
        >
          <CoreFormField label="Nombre del contacto" required>
            <input
              value={form.nombreContacto}
              onChange={(event) =>
                updateField("nombreContacto", event.target.value)
              }
              placeholder="Ej. Juan Pérez, Mesa de ayuda, Ejecutivo de cuenta"
              disabled={guardando}
              className={errors.nombreContacto ? "is-invalid" : ""}
            />

            <span className="coreforms-field-help">
              Puede ser una persona o un canal general de atención.
            </span>

            {errors.nombreContacto && (
              <span className="coreforms-field-error">
                {errors.nombreContacto}
              </span>
            )}
          </CoreFormField>

          <CoreFormField label="Tipo de contacto" required>
            <select
              value={form.tipoContacto}
              onChange={(event) =>
                updateField(
                  "tipoContacto",
                  event.target.value as AltaProveedorForm["tipoContacto"]
                )
              }
              disabled={guardando}
              className={errors.tipoContacto ? "is-invalid" : ""}
            >
              <option value="">Seleccionar tipo</option>

              {tipoContactoOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <span className="coreforms-field-help">
              Selecciona la función principal del contacto dentro de la atención
              al proveedor.
            </span>

            {errors.tipoContacto && (
              <span className="coreforms-field-error">
                {errors.tipoContacto}
              </span>
            )}
          </CoreFormField>

          <CoreFormField label="Puesto / área (opcional)">
            <input
              value={form.puestoContacto}
              onChange={(event) =>
                updateField("puestoContacto", event.target.value)
              }
              placeholder="Ej. Ejecutivo de cuenta, soporte técnico"
              disabled={guardando}
            />

            <span className="coreforms-field-help">
              Si no conoces el puesto o área, puedes dejar este campo vacío.
            </span>
          </CoreFormField>

          <CoreFormField label="Teléfono del contacto (opcional)">
            <input
              value={form.telefonoContacto}
              onChange={(event) =>
                updateField("telefonoContacto", event.target.value)
              }
              placeholder="Teléfono directo, extensión o número de atención"
              disabled={guardando}
            />

            <span className="coreforms-field-help">
              Captura el número que debe utilizar TI para comunicarse. Si no lo
              conoces, puedes dejarlo vacío.
            </span>
          </CoreFormField>

          <CoreFormField label="Correo del contacto (opcional)">
            <input
              type="email"
              value={form.correoContacto}
              onChange={(event) =>
                updateField("correoContacto", event.target.value)
              }
              placeholder="contacto@proveedor.com"
              disabled={guardando}
              className={errors.correoContacto ? "is-invalid" : ""}
            />

            <span className="coreforms-field-help">
              Correo de la persona o canal que atenderá solicitudes. Puedes
              dejarlo vacío si no tienes el dato.
            </span>

            {errors.correoContacto && (
              <span className="coreforms-field-error">
                {errors.correoContacto}
              </span>
            )}
          </CoreFormField>

          <CoreFormField
            label="Observaciones del contacto (opcional)"
            fullWidth
          >
            <textarea
              value={form.observacionesContacto}
              onChange={(event) =>
                updateField("observacionesContacto", event.target.value)
              }
              placeholder="Horarios, extensiones, instrucciones o notas adicionales"
              disabled={guardando}
            />

            <span className="coreforms-field-help">
              Agrega información que ayude a utilizar correctamente este
              contacto.
            </span>
          </CoreFormField>
        </CoreFormSection>

        <CoreFormSection
          title="Cobertura y servicios"
          description="Selecciona todas las sucursales atendidas y todos los servicios proporcionados."
        >
          <CoreFormField label="Sucursales atendidas" required fullWidth>
            <button
              type="button"
              className={`coreforms-multiselect-trigger ${
                errors.sucursalIds ? "is-invalid" : ""
              }`}
              onClick={() => setSelectorAbierto("sucursales")}
              disabled={loadingCatalogos || guardando}
            >
              <span>
                {form.sucursalIds.length === 0
                  ? "Seleccionar sucursales"
                  : `${form.sucursalIds.length} ${
                      form.sucursalIds.length === 1
                        ? "sucursal seleccionada"
                        : "sucursales seleccionadas"
                    }`}
              </span>

              <strong>Administrar selección</strong>
            </button>

            <span className="coreforms-field-help">
              Selecciona una o varias sucursales donde este proveedor puede
              brindar atención.
            </span>

            {sucursalesSeleccionadas.length > 0 && (
              <div className="coreforms-selection-chips">
                {sucursalesSeleccionadas.map((sucursal) => (
                  <button
                    type="button"
                    key={sucursal.id}
                    className="coreforms-selection-chip"
                    onClick={() => removeSucursal(sucursal.id)}
                    disabled={guardando}
                    title={`Quitar ${sucursal.nombre}`}
                  >
                    {sucursal.nombre}
                    <span>×</span>
                  </button>
                ))}
              </div>
            )}

            {errors.sucursalIds && (
              <span className="coreforms-field-error">
                {errors.sucursalIds}
              </span>
            )}
          </CoreFormField>

          <CoreFormField label="Servicios proporcionados" required fullWidth>
            <button
              type="button"
              className={`coreforms-multiselect-trigger ${
                errors.tiposServicio ? "is-invalid" : ""
              }`}
              onClick={() => setSelectorAbierto("servicios")}
              disabled={guardando}
            >
              <span>
                {form.tiposServicio.length === 0
                  ? "Seleccionar servicios"
                  : `${form.tiposServicio.length} ${
                      form.tiposServicio.length === 1
                        ? "servicio seleccionado"
                        : "servicios seleccionados"
                    }`}
              </span>

              <strong>Administrar selección</strong>
            </button>

            <span className="coreforms-field-help">
              Puedes elegir Internet, CCTV, Computadoras o cualquier
              combinación.
            </span>

            {form.tiposServicio.length > 0 && (
              <div className="coreforms-selection-chips">
                {form.tiposServicio.map((servicio) => (
                  <button
                    type="button"
                    key={servicio}
                    className="coreforms-selection-chip"
                    onClick={() => removeServicio(servicio)}
                    disabled={guardando}
                    title={`Quitar ${servicio}`}
                  >
                    {servicio}
                    <span>×</span>
                  </button>
                ))}
              </div>
            )}

            {errors.tiposServicio && (
              <span className="coreforms-field-error">
                {errors.tiposServicio}
              </span>
            )}
          </CoreFormField>

          <CoreFormField label="Estado de los servicios" required>
            <select
              value={form.estadoServicio}
              onChange={(event) =>
                updateField(
                  "estadoServicio",
                  event.target.value as AltaProveedorForm["estadoServicio"]
                )
              }
              disabled={guardando}
              className={errors.estadoServicio ? "is-invalid" : ""}
            >
              {estadoServicioOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <span className="coreforms-field-help">
              Este estado se aplicará a todas las combinaciones de sucursal y
              servicio seleccionadas.
            </span>

            {errors.estadoServicio && (
              <span className="coreforms-field-error">
                {errors.estadoServicio}
              </span>
            )}
          </CoreFormField>

          <CoreFormField label="Horario de atención (opcional)">
            <input
              value={form.horarioAtencion}
              onChange={(event) =>
                updateField("horarioAtencion", event.target.value)
              }
              placeholder="Ej. Lunes a viernes 8:00 a 18:00 / 24x7"
              disabled={guardando}
            />

            <span className="coreforms-field-help">
              Indica el horario general en que el proveedor atiende estos
              servicios.
            </span>
          </CoreFormField>
        </CoreFormSection>

        <CoreFormSection
          title="Canal de atención y soporte"
          description="Define qué teléfono y correo utilizará TI para solicitar soporte en los servicios seleccionados."
        >
          <div className="coreforms-support-choice coreforms-field-full">
            <label
              className={`coreforms-support-choice-card ${
                form.usarContactoComoSoporte ? "is-selected" : ""
              }`}
            >
              <input
                type="radio"
                name="support-source"
                checked={form.usarContactoComoSoporte}
                onChange={() =>
                  updateField("usarContactoComoSoporte", true)
                }
                disabled={guardando}
              />

              <span>
                <strong>Usar los datos del contacto registrado arriba</strong>
                <small>
                  El teléfono y correo del contacto se copiarán automáticamente
                  como canal de soporte para todas las sucursales y servicios
                  seleccionados.
                </small>
              </span>
            </label>

            <label
              className={`coreforms-support-choice-card ${
                !form.usarContactoComoSoporte ? "is-selected" : ""
              }`}
            >
              <input
                type="radio"
                name="support-source"
                checked={!form.usarContactoComoSoporte}
                onChange={() =>
                  updateField("usarContactoComoSoporte", false)
                }
                disabled={guardando}
              />

              <span>
                <strong>Usar un canal de soporte diferente</strong>
                <small>
                  Elige esta opción cuando exista una mesa de ayuda, número de
                  emergencia o correo específico distinto al contacto.
                </small>
              </span>
            </label>
          </div>

          {form.usarContactoComoSoporte ? (
            <div className="coreforms-support-preview coreforms-field-full">
              <span>Datos que se utilizarán para soporte</span>

              <div>
                <p>
                  Teléfono:{" "}
                  <strong>
                    {form.telefonoContacto.trim() ||
                      "Sin teléfono capturado"}
                  </strong>
                </p>

                <p>
                  Correo:{" "}
                  <strong>
                    {form.correoContacto.trim() || "Sin correo capturado"}
                  </strong>
                </p>
              </div>

              <small>
                Si estos datos no son correctos, actualízalos en la sección de
                contacto o selecciona un canal diferente.
              </small>
            </div>
          ) : (
            <>
              <CoreFormField label="Teléfono específico de soporte (opcional)">
                <input
                  value={form.telefonoSoporte}
                  onChange={(event) =>
                    updateField("telefonoSoporte", event.target.value)
                  }
                  placeholder="Número de mesa de ayuda o emergencias"
                  disabled={guardando}
                />

                <span className="coreforms-field-help">
                  Captura únicamente un número distinto al contacto registrado
                  arriba.
                </span>
              </CoreFormField>

              <CoreFormField label="Correo específico de soporte (opcional)">
                <input
                  type="email"
                  value={form.correoSoporte}
                  onChange={(event) =>
                    updateField("correoSoporte", event.target.value)
                  }
                  placeholder="soporte@proveedor.com"
                  disabled={guardando}
                  className={errors.correoSoporte ? "is-invalid" : ""}
                />

                <span className="coreforms-field-help">
                  Correo de mesa de ayuda o canal específico de atención.
                </span>

                {errors.correoSoporte && (
                  <span className="coreforms-field-error">
                    {errors.correoSoporte}
                  </span>
                )}
              </CoreFormField>
            </>
          )}
        </CoreFormSection>

        {mostrarResumenServicio && (
          <section className="coreforms-registration-summary">
            <div>
              <p className="coreforms-eyebrow">Resumen del registro</p>
              <h2>Revisa antes de guardar</h2>
              <p>
                Se creará un proveedor, un contacto y una asignación por cada
                combinación de sucursal y servicio.
              </p>
            </div>

            <div className="coreforms-registration-summary-grid">
              <article>
                <span>Proveedor</span>
                <strong>{form.nombreProveedor.trim()}</strong>
              </article>

              <article>
                <span>Sucursales</span>
                <strong>{form.sucursalIds.length}</strong>
              </article>

              <article>
                <span>Servicios</span>
                <strong>{form.tiposServicio.length}</strong>
              </article>

              <article>
                <span>Asignaciones a crear</span>
                <strong>{totalAsignaciones}</strong>
              </article>
            </div>

            <div className="coreforms-registration-summary-detail">
              <p>
                <strong>Servicios:</strong>{" "}
                {form.tiposServicio.join(", ")}
              </p>

              <p>
                <strong>Sucursales:</strong>{" "}
                {sucursalesSeleccionadas
                  .map((sucursal) => sucursal.nombre)
                  .join(", ")}
              </p>

              <p>
                <strong>Canal de soporte:</strong>{" "}
                {form.usarContactoComoSoporte
                  ? "Se reutilizarán los datos del contacto."
                  : "Se utilizará un canal de soporte diferente."}
              </p>
            </div>
          </section>
        )}

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
            {guardando ? "Guardando proveedor..." : "Guardar proveedor"}
          </button>
        </div>
      </section>

      <CoreMultiSelectModal
        open={selectorAbierto === "sucursales"}
        title="Seleccionar sucursales atendidas"
        description="Marca todas las sucursales donde este proveedor puede brindar servicio."
        options={sucursalModalOptions}
        selectedIds={form.sucursalIds}
        searchPlaceholder="Buscar sucursal..."
        confirmLabel="Confirmar sucursales"
        emptyMessage="No se encontraron sucursales."
        onClose={() => setSelectorAbierto(null)}
        onConfirm={(selectedIds) => {
          updateField("sucursalIds", selectedIds);
          setSelectorAbierto(null);
        }}
      />

      <CoreMultiSelectModal
        open={selectorAbierto === "servicios"}
        title="Seleccionar servicios proporcionados"
        description="Marca uno o varios servicios ofrecidos por este proveedor."
        options={servicioModalOptions}
        selectedIds={form.tiposServicio}
        searchPlaceholder="Buscar servicio..."
        confirmLabel="Confirmar servicios"
        emptyMessage="No se encontraron servicios."
        onClose={() => setSelectorAbierto(null)}
        onConfirm={(selectedIds) => {
          const validServices = selectedIds.filter(
            (value): value is TipoServicio =>
              tipoServicioOptions.includes(value as TipoServicio)
          );

          updateField("tiposServicio", validServices);
          setSelectorAbierto(null);
        }}
      />

      {mostrarModalInstrucciones && (
        <div
          className={`coreforms-modal-backdrop ${
            instruccionesWarning ? "coreforms-modal-backdrop-critical" : ""
          }`}
          role="dialog"
          aria-modal="true"
        >
          <div
            className={`coreforms-modal ${
              instruccionesWarning ? "coreforms-modal-critical" : ""
            }`}
          >
            <h2>Instrucciones del formulario</h2>

            <p>
              Este formulario puede ser completado por personal de TI o por el
              propio proveedor.
            </p>

            <ul>
              <li>
                Registra únicamente proveedores nuevos que aún no existan en
                CoreSuppliers.
              </li>

              <li>
                Captura un contacto real de atención. Los campos identificados
                como opcionales pueden dejarse vacíos si no conoces la
                información.
              </li>

              <li>
                Selecciona todas las sucursales atendidas y todos los servicios
                proporcionados. El sistema creará automáticamente las
                combinaciones necesarias.
              </li>

              <li>
                Por defecto se reutilizan el teléfono y correo del contacto como
                canal de soporte. Selecciona un canal diferente solo cuando
                exista una mesa de ayuda o dato específico.
              </li>

              <li>
                Revisa el resumen antes de guardar para confirmar cuántas
                asignaciones se crearán.
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

      {mostrarModalExito && (
        <div className="coreforms-modal-backdrop" role="dialog" aria-modal="true">
          <div className="coreforms-modal">
            <div className="coreforms-modal-icon coreforms-modal-icon-success">
              ✓
            </div>

            <h2>Proveedor registrado correctamente</h2>

            <p>
              El proveedor, su contacto y todas las asignaciones seleccionadas
              fueron guardados en el catálogo.
            </p>

            <div className="coreforms-modal-actions">
              <button
                type="button"
                className="coreforms-primary-button"
                onClick={() => {
                  setMensaje(null);
                  setErrors({});
                  setMostrarModalExito(false);
                }}
              >
                Capturar otro proveedor
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
              Se eliminarán los datos capturados en pantalla. Esta acción no
              afectará los registros ya guardados.
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
