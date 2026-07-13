import { useEffect, useMemo, useState } from "react";
import type {
  ActualizarEquipoInput,
  CatalogoOpcion,
  EquipoDashboard,
} from "../interfaces/equipos";
import "../styles/EditEquipoModal.css";

interface EditEquipoModalProps {
  equipo: EquipoDashboard | null;
  onClose: () => void;
  onSave: (datos: ActualizarEquipoInput) => Promise<void>;

  sucursales?: CatalogoOpcion[];
  departamentos?: CatalogoOpcion[];
  ubicacionesSucursal?: CatalogoOpcion[];
}

interface FormularioEdicion {
  hostname: string;
  tipoEquipo: string;
  marca: string;
  modelo: string;
  numeroSerie: string;

  direccionIP: string;
  sistemaOperativo: string;
  claveAnyDesk: string;

  responsable: string;

  sucursalId: string;
  departamentoId: string;
  ubicacionSucursalId: string;
  ubicacionExacta: string;

  estadoFuncionamiento: string;
  condicionFisica: string;
  activo: boolean;

  observaciones: string;
}

function EditEquipoModal({
  equipo,
  onClose,
  onSave,
  sucursales = [],
  departamentos = [],
  ubicacionesSucursal = [],
}: EditEquipoModalProps) {
  const [formulario, setFormulario] = useState<FormularioEdicion | null>(null);
  const [formularioInicial, setFormularioInicial] =
    useState<FormularioEdicion | null>(null);

  const [estaGuardando, setEstaGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{
    tipo: "exito" | "error";
    texto: string;
  } | null>(null);

  useEffect(() => {
    if (!equipo) return;

    const datosIniciales: FormularioEdicion = {
      hostname: equipo.hostname ?? "",
      tipoEquipo: equipo.tipoEquipo ?? "",
      marca: equipo.marca ?? "",
      modelo: equipo.modelo ?? "",
      numeroSerie: equipo.numeroSerie ?? "",

      direccionIP: equipo.direccionIP ?? "",
      sistemaOperativo: equipo.sistemaOperativo ?? "",
      claveAnyDesk: equipo.claveAnyDesk ?? "",

      responsable: equipo.responsable ?? "",

        sucursalId:
        equipo.sucursalId ||
        sucursales.find((sucursal) => sucursal.nombre === equipo.sucursal)?.id ||
        "",

        departamentoId:
        equipo.departamentoId ||
        departamentos.find(
            (departamento) => departamento.nombre === equipo.departamento
        )?.id ||
        "",

        ubicacionSucursalId:
        equipo.ubicacionSucursalId ||
        ubicacionesSucursal.find(
            (ubicacion) => ubicacion.nombre === equipo.ubicacion
        )?.id ||
    "",

    ubicacionExacta: equipo.ubicacionExacta ?? "",

      estadoFuncionamiento: equipo.estadoFuncionamiento ?? "",
      condicionFisica: equipo.condicionFisica ?? "",
      activo: equipo.activo,

      observaciones: equipo.observaciones ?? "",
    };

    setFormulario(datosIniciales);
    setFormularioInicial(datosIniciales);
    setMensaje(null);
    setEstaGuardando(false);
  }, [equipo]);

  useEffect(() => {
    if (!equipo) return;

    const overflowOriginal = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = overflowOriginal;
    };
  }, [equipo]);

  const ubicacionesFiltradas = useMemo(() => {
    if (!formulario?.sucursalId) return [];

    return ubicacionesSucursal.filter(
      (ubicacion) => ubicacion.sucursalId === formulario.sucursalId
    );
  }, [ubicacionesSucursal, formulario?.sucursalId]);

  const hayCambiosSinGuardar =
    formulario &&
    formularioInicial &&
    JSON.stringify(formulario) !== JSON.stringify(formularioInicial);

  function actualizarCampo<K extends keyof FormularioEdicion>(
    campo: K,
    valor: FormularioEdicion[K]
  ) {
    setFormulario((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        [campo]: valor,
      };
    });
  }

  function validarFormulario(): string | null {
    if (!formulario) {
      return "No hay datos para guardar.";
    }

    const camposRequeridos: Array<[keyof FormularioEdicion, string]> = [
      ["hostname", "Hostname"],
      ["tipoEquipo", "Tipo de equipo"],
      ["marca", "Marca"],
      ["modelo", "Modelo"],
      ["numeroSerie", "Número de serie"],
      ["direccionIP", "Dirección IP"],
      ["sistemaOperativo", "Sistema operativo"],
      ["responsable", "Responsable"],
      ["sucursalId", "Sucursal"],
      ["departamentoId", "Departamento"],
      ["estadoFuncionamiento", "Estado de funcionamiento"],
      ["condicionFisica", "Condición física"],
    ];

    for (const [campo, etiqueta] of camposRequeridos) {
      const valor = formulario[campo];

      if (typeof valor === "string" && valor.trim() === "") {
        return `El campo "${etiqueta}" no puede quedar vacío.`;
      }
    }

    return null;
  }

  function intentarCerrar() {
    if (hayCambiosSinGuardar && !estaGuardando) {
      const confirmarSalida = window.confirm(
        "Tienes cambios sin guardar. ¿Deseas cerrar sin guardar?"
      );

      if (!confirmarSalida) return;
    }

    onClose();
  }

  async function guardarCambios() {
    if (!formulario || !equipo) {
      setMensaje({
        tipo: "error",
        texto: "No se pudo cargar la información del equipo.",
      });
      return;
    }

    setMensaje(null);

    const errorValidacion = validarFormulario();

    if (errorValidacion) {
      setMensaje({
        tipo: "error",
        texto: errorValidacion,
      });
      return;
    }

    try {
      setEstaGuardando(true);

      const payload: ActualizarEquipoInput = {
        id: equipo.id,
        hostname: formulario.hostname,
        tipoEquipo: formulario.tipoEquipo,
        marca: formulario.marca,
        modelo: formulario.modelo,
        numeroSerie: formulario.numeroSerie,
        direccionIP: formulario.direccionIP,
        sistemaOperativo: formulario.sistemaOperativo,
        claveAnyDesk: formulario.claveAnyDesk,
        responsable: formulario.responsable,
        estadoFuncionamiento: formulario.estadoFuncionamiento,
        condicionFisica: formulario.condicionFisica,
        observaciones: formulario.observaciones,
        sucursalId: formulario.sucursalId,
        departamentoId: formulario.departamentoId,
        ubicacionSucursalId: formulario.ubicacionSucursalId,
        ubicacionExacta: formulario.ubicacionExacta,
        activo: formulario.activo,
      };

      await onSave(payload);

      setMensaje({
        tipo: "exito",
        texto: "Equipo actualizado correctamente.",
      });

      onClose();
    } catch (error) {
      console.error("ERROR EN guardarCambios:", error);

      setMensaje({
        tipo: "error",
        texto: "No se pudieron guardar los cambios.",
      });
    } finally {
      setEstaGuardando(false);
    }
  }

  if (!equipo || !formulario) return null;

  return (
    <div className="edit-modal-overlay">
      <section
        className="edit-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-modal-title"
      >
        <header className="edit-modal-header">
          <div>
            <p className="edit-modal-eyebrow">Edición de equipo</p>
            <h2 id="edit-modal-title">{equipo.hostname}</h2>

            <span className="edit-modal-summary">
              {equipo.tipoEquipo} · {equipo.sucursal} · {equipo.departamento}
            </span>

            <p className="edit-modal-id">
              ID Equipo: <strong>{equipo.idequipo}</strong>
            </p>
          </div>

          <button
            type="button"
            className="edit-modal-close"
            onClick={intentarCerrar}
            aria-label="Cerrar editor"
            disabled={estaGuardando}
          >
            ×
          </button>
        </header>

        <form
          className="edit-modal-body"
          onSubmit={(event) => event.preventDefault()}
        >
          {mensaje && (
            <div
              className={
                mensaje.tipo === "exito"
                  ? "edit-modal-message success"
                  : "edit-modal-message error"
              }
            >
              {mensaje.texto}
            </div>
          )}

          <section className="edit-form-section">
            <h3>Identificación</h3>

            <div className="edit-form-grid">
              <label>
                Hostname
                <input
                  value={formulario.hostname}
                  onChange={(event) =>
                    actualizarCampo("hostname", event.target.value)
                  }
                />
              </label>

              <label>
                Tipo de equipo
                <select
                  value={formulario.tipoEquipo}
                  onChange={(event) =>
                    actualizarCampo("tipoEquipo", event.target.value)
                  }
                >
                  <option value="">Selecciona un tipo</option>
                  <option value="Laptop">Laptop</option>
                  <option value="PC de Escritorio">PC de Escritorio</option>
                </select>
              </label>

              <label>
                Marca
                <input
                  value={formulario.marca}
                  onChange={(event) =>
                    actualizarCampo("marca", event.target.value)
                  }
                />
              </label>

              <label>
                Modelo
                <input
                  value={formulario.modelo}
                  onChange={(event) =>
                    actualizarCampo("modelo", event.target.value)
                  }
                />
              </label>

              <label>
                Número de serie
                <input
                  value={formulario.numeroSerie}
                  onChange={(event) =>
                    actualizarCampo("numeroSerie", event.target.value)
                  }
                />
              </label>
            </div>
          </section>

          <section className="edit-form-section">
            <h3>Red y sistema</h3>

            <div className="edit-form-grid">
              <label>
                Dirección IP
                <input
                  value={formulario.direccionIP}
                  onChange={(event) =>
                    actualizarCampo("direccionIP", event.target.value)
                  }
                />
              </label>

              <label>
                Sistema operativo
                <input
                  value={formulario.sistemaOperativo}
                  onChange={(event) =>
                    actualizarCampo("sistemaOperativo", event.target.value)
                  }
                />
              </label>

              <label>
                Clave AnyDesk
                <input
                  value={formulario.claveAnyDesk}
                  onChange={(event) =>
                    actualizarCampo("claveAnyDesk", event.target.value)
                  }
                />
              </label>
            </div>
          </section>

          <section className="edit-form-section">
            <h3>Asignación y ubicación</h3>

            <div className="edit-form-grid">
              <label>
                Responsable
                <input
                  value={formulario.responsable}
                  onChange={(event) =>
                    actualizarCampo("responsable", event.target.value)
                  }
                />
              </label>

              <label>
                Sucursal
                <select
                  value={formulario.sucursalId}
                  onChange={(event) => {
                    actualizarCampo("sucursalId", event.target.value);
                    actualizarCampo("ubicacionSucursalId", "");
                  }}
                >
                  <option value="">Selecciona una sucursal</option>

                  {sucursales.map((sucursal) => (
                    <option key={sucursal.id} value={sucursal.id}>
                      {sucursal.nombre}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Departamento
                <select
                  value={formulario.departamentoId}
                  onChange={(event) =>
                    actualizarCampo("departamentoId", event.target.value)
                  }
                >
                  <option value="">Selecciona un departamento</option>

                  {departamentos.map((departamento) => (
                    <option key={departamento.id} value={departamento.id}>
                      {departamento.nombre}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Ubicación dentro de sucursal <span className="edit-optional">(opcional)</span>
                <select
                  value={formulario.ubicacionSucursalId}
                  onChange={(event) =>
                    actualizarCampo("ubicacionSucursalId", event.target.value)
                  }
                  disabled={!formulario.sucursalId}
                >
                  <option value="">
                    {formulario.sucursalId
                      ? ubicacionesFiltradas.length > 0
                        ? "Selecciona una ubicación"
                        : "Esta sucursal no tiene ubicaciones internas"
                      : "Selecciona primero una sucursal"}
                  </option>

                  {ubicacionesFiltradas.map((ubicacion) => (
                    <option key={ubicacion.id} value={ubicacion.id}>
                      {ubicacion.nombre}
                    </option>
                  ))}
                </select>
            </label>
          </div>

          <label className="edit-form-textarea">
            Ubicación exacta
            <textarea
              value={formulario.ubicacionExacta}
              rows={3}
              placeholder="Ej. Segundo escritorio del lado derecho, junto al rack, oficina de sistemas..."
              onChange={(event) =>
                actualizarCampo("ubicacionExacta", event.target.value)
              }
            />
          </label>
        </section>

          <section className="edit-form-section">
            <h3>Estado operativo</h3>

            <div className="edit-form-grid">
              <label>
                Estado de equipo
                <select
                  value={formulario.estadoFuncionamiento}
                  onChange={(event) =>
                    actualizarCampo("estadoFuncionamiento", event.target.value)
                  }
                >
                  <option value="">Selecciona un estado</option>
                  <option value="Excelente">Excelente</option>
                  <option value="Bueno">Bueno</option>
                  <option value="Regular">Regular</option>
                  <option value="Malo">Malo</option>
                  <option value="Disfuncional">Disfuncional</option>
                </select>
              </label>

              <label>
                Condición física
                <select
                  value={formulario.condicionFisica}
                  onChange={(event) =>
                    actualizarCampo("condicionFisica", event.target.value)
                  }
                >
                  <option value="">Selecciona una condición</option>
                  <option value="Excelente">Excelente</option>
                  <option value="Bueno">Bueno</option>
                  <option value="Regular">Regular</option>
                  <option value="Malo">Malo</option>
                  <option value="Disfuncional">Disfuncional</option>
                </select>
              </label>

              <label>
                Estatus
                <select
                  value={formulario.activo ? "Activo" : "Inactivo"}
                  onChange={(event) =>
                    actualizarCampo(
                      "activo",
                      event.target.value === "Activo"
                    )
                  }
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </label>
            </div>
          </section>

          <section className="edit-form-section">
            <h3>Observaciones</h3>

            <label className="edit-form-textarea">
              Notas del equipo
              <textarea
                value={formulario.observaciones}
                rows={4}
                onChange={(event) =>
                  actualizarCampo("observaciones", event.target.value)
                }
              />
            </label>
          </section>

          <footer className="edit-modal-footer">
            <button
              type="button"
              className="edit-modal-secondary"
              onClick={intentarCerrar}
              disabled={estaGuardando}
            >
              Cancelar
            </button>

            <button
              type="button"
              className="edit-modal-primary"
              onClick={guardarCambios}
              disabled={estaGuardando}
            >
              {estaGuardando ? "Guardando..." : "Guardar cambios"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

export default EditEquipoModal;