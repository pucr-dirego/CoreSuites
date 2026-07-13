import { useEffect, useRef, useState } from "react";

import CoreFormField from "../shared/CoreFormField";
import CoreFormSection from "../shared/CoreFormSection";

import {
  estadoServicioOptions,
  initialAltaProveedorForm,
  tipoContactoOptions,
  tipoServicioOptions,
  type AltaProveedorForm,
  type SucursalOption,
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

const MIN_INSTRUCTION_READ_SECONDS = 12;

const SUPPLIER_INSTRUCTIONS_STORAGE_KEY =
  "coreforms:alta-proveedor:instructions-read";

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

export default function AltaProveedorPage({ onBack }: AltaProveedorPageProps) {
  const [mostrarModalExito, setMostrarModalExito] = useState(false);
  const [mostrarConfirmacionLimpiar, setMostrarConfirmacionLimpiar] =
    useState(false);

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

  const sucursalSeleccionada = sucursales.find(
    (sucursal) => sucursal.id === form.sucursalId
  );

  const mostrarResumenServicio = Boolean(
    form.nombreProveedor.trim() &&
      sucursalSeleccionada &&
      form.tipoServicio &&
      form.estadoServicio
  );

  const totalCamposRequeridos = 6;

  const camposRequeridosCompletos = [
    Boolean(form.nombreProveedor.trim()),
    Boolean(form.nombreContacto.trim()),
    Boolean(form.tipoContacto),
    Boolean(form.sucursalId),
    Boolean(form.tipoServicio),
    Boolean(form.estadoServicio),
  ].filter(Boolean).length;

  const progresoRequeridos = Math.round(
    (camposRequeridosCompletos / totalCamposRequeridos) * 100
  );

  useEffect(() => {
    cargarCatalogos();
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

    if (!form.sucursalId) {
      nextErrors.sucursalId = "Selecciona una sucursal.";
    }

    if (!form.tipoServicio) {
      nextErrors.tipoServicio = "Selecciona el tipo de servicio.";
    }

    if (!form.estadoServicio) {
      nextErrors.estadoServicio = "Selecciona el estado del servicio.";
    }

    if (form.correoSoporte && !isValidEmail(form.correoSoporte)) {
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
      setMostrarModalExito(true);
    } catch (error) {
      console.error("Error guardando proveedor:", error);

      setMostrarModalExito(false);

      setMensaje({
        tipo: "error",
        texto:
          "No se pudo guardar el proveedor. Revisa la información e intenta nuevamente.",
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
              Captura el proveedor, su contacto principal y el primer servicio
              asociado a una sucursal.
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
              Antes de registrar, verifica que el proveedor no exista
              previamente en el catálogo.
            </span>

            {errors.nombreProveedor && (
              <span className="coreforms-field-error">
                {errors.nombreProveedor}
              </span>
            )}
          </CoreFormField>
        </CoreFormSection>

        <CoreFormSection
          title="Contacto / ejecutivo principal"
          description="Persona o canal que atiende directamente al equipo de TI."
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
                updateField("tipoContacto", event.target.value)
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

            {errors.tipoContacto && (
              <span className="coreforms-field-error">
                {errors.tipoContacto}
              </span>
            )}
          </CoreFormField>

          <CoreFormField label="Puesto / área">
            <input
              value={form.puestoContacto}
              onChange={(event) =>
                updateField("puestoContacto", event.target.value)
              }
              placeholder="Ej. Ejecutivo de cuenta, soporte técnico"
              disabled={guardando}
            />
          </CoreFormField>

          <CoreFormField label="Teléfono del contacto">
            <input
              value={form.telefonoContacto}
              onChange={(event) =>
                updateField("telefonoContacto", event.target.value)
              }
              placeholder="Teléfono directo o extensión"
              disabled={guardando}
            />
          </CoreFormField>

          <CoreFormField label="Correo del contacto">
            <input
              value={form.correoContacto}
              onChange={(event) =>
                updateField("correoContacto", event.target.value)
              }
              placeholder="contacto@proveedor.com"
              disabled={guardando}
              className={errors.correoContacto ? "is-invalid" : ""}
            />

            {errors.correoContacto && (
              <span className="coreforms-field-error">
                {errors.correoContacto}
              </span>
            )}
          </CoreFormField>

          <CoreFormField label="Observaciones del contacto" fullWidth>
            <textarea
              value={form.observacionesContacto}
              onChange={(event) =>
                updateField("observacionesContacto", event.target.value)
              }
              placeholder="Notas adicionales del contacto"
              disabled={guardando}
            />
          </CoreFormField>
        </CoreFormSection>

        <CoreFormSection
          title="Servicio inicial por sucursal"
          description="Primer servicio asociado al proveedor y a una sucursal."
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

          <CoreFormField label="Tipo de servicio" required>
            <select
              value={form.tipoServicio}
              onChange={(event) =>
                updateField("tipoServicio", event.target.value)
              }
              disabled={guardando}
              className={errors.tipoServicio ? "is-invalid" : ""}
            >
              <option value="">Seleccionar servicio</option>

              {tipoServicioOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            {errors.tipoServicio && (
              <span className="coreforms-field-error">
                {errors.tipoServicio}
              </span>
            )}
          </CoreFormField>

          <CoreFormField label="Estado del servicio" required>
            <select
              value={form.estadoServicio}
              onChange={(event) =>
                updateField("estadoServicio", event.target.value)
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

            {errors.estadoServicio && (
              <span className="coreforms-field-error">
                {errors.estadoServicio}
              </span>
            )}
          </CoreFormField>

          <CoreFormField label="Teléfono de soporte">
            <input
              value={form.telefonoSoporte}
              onChange={(event) =>
                updateField("telefonoSoporte", event.target.value)
              }
              placeholder="Teléfono de soporte para este servicio"
              disabled={guardando}
            />
          </CoreFormField>

          <CoreFormField label="Correo de soporte">
            <input
              value={form.correoSoporte}
              onChange={(event) =>
                updateField("correoSoporte", event.target.value)
              }
              placeholder="soporte@proveedor.com"
              disabled={guardando}
              className={errors.correoSoporte ? "is-invalid" : ""}
            />

            {errors.correoSoporte && (
              <span className="coreforms-field-error">
                {errors.correoSoporte}
              </span>
            )}
          </CoreFormField>

          <CoreFormField label="Horario de atención">
            <input
              value={form.horarioAtencion}
              onChange={(event) =>
                updateField("horarioAtencion", event.target.value)
              }
              placeholder="Ej. Lunes a viernes 8:00 a 18:00 / 24x7"
              disabled={guardando}
            />
          </CoreFormField>

          {mostrarResumenServicio && (
            <div className="coreforms-location-summary coreforms-field-full">
              <span>Resumen del servicio</span>
              <strong>
                {form.nombreProveedor.trim()}
                {" → "}
                {form.tipoServicio}
                {" → "}
                {sucursalSeleccionada?.nombre}
              </strong>
              <p>Estado del servicio: {form.estadoServicio}</p>
            </div>
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
            {guardando ? "Guardando proveedor..." : "Guardar proveedor"}
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
            className={`coreforms-modal ${
              instruccionesWarning ? "coreforms-modal-critical" : ""
            }`}
          >
            <h2>Instrucciones del formulario</h2>

            <p>
              Usa este formulario para registrar proveedores nuevos en el
              catálogo.
            </p>

            <ul>
              <li>
                Registra aquí únicamente proveedores nuevos que aún no existan en
                CoreSuppliers.
              </li>

              <li>
                Captura el nombre del proveedor y un contacto principal válido
                para seguimiento o soporte.
              </li>

              <li>
                Asocia correctamente la sucursal, tipo de servicio y estado del
                servicio.
              </li>

              <li>
                Este formulario crea el proveedor, su contacto principal y su
                primer servicio asociado.
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
              La información fue guardada y ya puede utilizarse en el catálogo
              de proveedores.
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