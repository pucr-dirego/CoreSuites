import { useEffect, useRef, useState } from "react";

import CoreFormField from "../shared/CoreFormField";
import CoreFormSection from "../shared/CoreFormSection";

import {
  condicionFisicaOptions,
  estadoFuncionamientoOptions,
  initialAltaEquipoForm,
  tipoEquipoOptions,
  type AltaEquipoForm,
  type DepartamentoOption,
  type SucursalOption,
} from "../../../interfaces/altaEquipo";

import {
  crearEquipo,
  getDepartamentosEquipo,
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

  const mostrarResumenUbicacion = Boolean(
    sucursalSeleccionada &&
      departamentoSeleccionado &&
      form.ubicacionExacta.trim()
  );

  const totalCamposRequeridos = 8;

  const camposRequeridosCompletos = [
    Boolean(form.tipoEquipo),
    Boolean(form.marca.trim()),
    Boolean(form.numeroSerie.trim()),
    Boolean(form.hostname.trim()),
    Boolean(form.direccionIP.trim()),
    Boolean(form.sucursalId),
    Boolean(form.departamentoId),
    Boolean(form.ubicacionExacta.trim()),
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

      const [sucursalesData, departamentosData] = await Promise.all([
        getSucursalesEquipo(),
        getDepartamentosEquipo(),
      ]);

      setSucursales(sucursalesData);
      setDepartamentos(departamentosData);
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
          "No se pudo guardar el equipo. Revisa la información e intenta nuevamente.",
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
              Captura un nuevo activo tecnológico, su identificación técnica,
              asignación y ubicación dentro de la sucursal.
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
            className={`coreforms-modal ${
              instruccionesWarning ? "coreforms-modal-critical" : ""
            }`}
          >
            <h2>Instrucciones del formulario</h2>

            <p>
              Usa este formulario para registrar equipos nuevos en el inventario.
            </p>

            <ul>
              <li>
                Registra aquí únicamente equipos de cómputo nuevos que aún no
                existan en CoreInventory.
              </li>

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
              OK
            </div>

            <h2>Equipo registrado correctamente</h2>

            <p>
              La información fue guardada y ya puede consultarse desde
              CoreInventory.
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