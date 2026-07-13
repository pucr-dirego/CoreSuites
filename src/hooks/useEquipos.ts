import { useCallback, useEffect, useMemo, useState } from "react";
import { Cr22e_equipostisService } from "../generated/services/Cr22e_equipostisService";
import { Cr22e_sucursalesesService } from "../generated/services/Cr22e_sucursalesesService";
import { Cr22e_departamentosesService } from "../generated/services/Cr22e_departamentosesService";
import { Cr22e_ubicacionessucursalsService } from "../generated/services/Cr22e_ubicacionessucursalsService";

import type { Cr22e_equipostis } from "../generated/models/Cr22e_equipostisModel";
import type {
  ActualizarEquipoInput,
  CatalogoOpcion,
  EquipoDashboard,
  EstadoFuncionamiento,
} from "../interfaces/equipos";

type RegistroDataverse = Record<string, unknown>;
type MapaNombres = Record<string, string>;

function normalizarEstado(
  estadoNombre?: string,
  estadoValor?: number | string
): EstadoFuncionamiento {
  if (
    estadoNombre === "Excelente" ||
    estadoNombre === "Bueno" ||
    estadoNombre === "Regular" ||
    estadoNombre === "Malo" ||
    estadoNombre === "Disfuncional"
  ) {
    return estadoNombre;
  }

  const mapaEstados: Record<number, EstadoFuncionamiento> = {
    100000000: "Excelente",
    100000001: "Bueno",
    100000002: "Regular",
    100000003: "Malo",
    100000004: "Disfuncional",
  };

  return mapaEstados[Number(estadoValor)] ?? "Sin estado";
}

function normalizarTipoEquipo(
  tipoNombre?: string,
  tipoValor?: number | string
): string {
  if (tipoNombre) {
    if (tipoNombre === "PCdeEscritorio") return "PC de Escritorio";
    return tipoNombre;
  }

  const mapaTipos: Record<number, string> = {
    100000000: "Laptop",
    100000001: "PC de Escritorio",
  };

  return mapaTipos[Number(tipoValor)] ?? "Sin tipo";
}

function normalizarCondicionFisica(
  condicionNombre?: string,
  condicionValor?: number | string
): string {
  if (condicionNombre) return condicionNombre;

  const mapaCondiciones: Record<number, string> = {
    100000000: "Excelente",
    100000001: "Bueno",
    100000002: "Regular",
    100000003: "Malo",
    100000004: "Disfuncional",
  };

  return mapaCondiciones[Number(condicionValor)] ?? "Sin condición";
}

function limpiarTexto(valor: string): string {
  const texto = valor.trim();

  if (!texto) return texto;

  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function obtenerTexto(
  registro: RegistroDataverse,
  posiblesCampos: string[],
  valorFallback: string
): string {
  for (const campo of posiblesCampos) {
    const valor = registro[campo];

    if (typeof valor === "string" && valor.trim().length > 0) {
      return valor;
    }
  }

  return valorFallback;
}

function crearMapaNombres(
  registros: RegistroDataverse[],
  posiblesIds: string[],
  posiblesNombres: string[]
): MapaNombres {
  return registros.reduce<MapaNombres>((mapa, registro) => {
    const id = obtenerTexto(registro, posiblesIds, "");
    const nombre = obtenerTexto(registro, posiblesNombres, "");

    if (id && nombre) {
      mapa[id] = nombre;
    }

    return mapa;
  }, {});
}

function crearCatalogoOpciones(
  registros: RegistroDataverse[],
  posiblesIds: string[],
  posiblesNombres: string[],
  posiblesSucursalIds: string[] = []
): CatalogoOpcion[] {
  return registros
    .map((registro) => {
      const id = obtenerTexto(registro, posiblesIds, "");
      const nombre = limpiarTexto(obtenerTexto(registro, posiblesNombres, ""));
      const sucursalId = obtenerTexto(registro, posiblesSucursalIds, "");

      if (!id || !nombre) return null;

      return {
        id,
        nombre,
        ...(sucursalId ? { sucursalId } : {}),
      };
    })
    .filter((opcion): opcion is CatalogoOpcion => opcion !== null)
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
}

function normalizarEquipo(
  equipo: Cr22e_equipostis,
  sucursalesPorId: MapaNombres,
  departamentosPorId: MapaNombres,
  ubicacionesPorId: MapaNombres
): EquipoDashboard {
  const sucursalId =
    equipo._cr22e_sucursales_value ?? equipo._cr22e_sucursal_value ?? "";

  const departamentoId =
    equipo._cr22e_departamentos_value ?? equipo._cr22e_departamento_value ?? "";

  const ubicacionId =
    equipo._cr22e_ubicacionessucursalv2_value ??
    equipo._cr22e_ubicacionessucursal_value ??
    "";

  return {
    id: equipo.cr22e_equipostiid,
    idequipo: equipo.cr22e_idequipo ?? "Sin ID",
    hostname: equipo.cr22e_hostname ?? equipo.cr22e_name ?? "Sin hostname",

    sucursalId,
    departamentoId,
    ubicacionSucursalId: ubicacionId,

    tipoEquipo: normalizarTipoEquipo(
      equipo.cr22e_tipoequiponame,
      equipo.cr22e_tipoequipo
    ),

    marca: equipo.cr22e_marca ?? "Sin marca",
    modelo: equipo.cr22e_modelo ?? "Sin modelo",
    numeroSerie: equipo.cr22e_numerodeserie ?? "Sin serie",
    sistemaOperativo: equipo.cr22e_sistemaoperativo ?? "Sin sistema operativo",
    claveAnyDesk: equipo.cr22e_claveanydesk ?? "Sin AnyDesk",
    observaciones: equipo.cr22e_observaciones ?? "Sin observaciones",
    direccionIP: equipo.cr22e_direccionip ?? "Sin IP",
    responsable: equipo.cr22e_responsable ?? "Sin responsable",

    sucursal: limpiarTexto(
      equipo.cr22e_sucursalesname ??
      equipo.cr22e_sucursalname ??
      sucursalesPorId[sucursalId] ??
      "Sin sucursal"
    ),

    departamento: limpiarTexto(
      equipo.cr22e_departamentosname ??
      equipo.cr22e_departamentoname ??
      departamentosPorId[departamentoId] ??
      "Sin departamento"
    ),

    ubicacion: limpiarTexto(
      equipo.cr22e_ubicacionessucursalv2name ??
      equipo.cr22e_ubicacionessucursalname ??
      ubicacionesPorId[ubicacionId] ??
      equipo.cr22e_ubicacionexacta ??
      "Sin ubicación"
    ),

    ubicacionExacta: equipo.cr22e_ubicacionexacta ?? "",

    estadoFuncionamiento: normalizarEstado(
      equipo.cr22e_estadodeequiponame,
      equipo.cr22e_estadodeequipo
    ),

    condicionFisica: normalizarCondicionFisica(
      equipo.cr22e_condicionfisicaname,
      equipo.cr22e_condicionfisica
    ),

    activo:
      typeof equipo.cr22e_activo === "boolean"
      ? equipo.cr22e_activo
      : equipo.statecode === 0,

    createdon: equipo.createdon,
    modifiedon: equipo.modifiedon,
  };
}

function obtenerValorTipoEquipo(tipoEquipo: string): number {
  const mapaTipos: Record<string, number> = {
    Laptop: 100000000,
    "PC de Escritorio": 100000001,
  };

  return mapaTipos[tipoEquipo] ?? 100000000;
}

function obtenerValorEstado(estado: string): number {
  const mapaEstados: Record<string, number> = {
    Excelente: 100000000,
    Bueno: 100000001,
    Regular: 100000002,
    Malo: 100000003,
    Disfuncional: 100000004,
  };

  return mapaEstados[estado] ?? 100000002;
}

function obtenerValorCondicion(condicion: string): number {
  const mapaCondiciones: Record<string, number> = {
    Excelente: 100000000,
    Bueno: 100000001,
    Regular: 100000002,
    Malo: 100000003,
    Disfuncional: 100000004,
  };

  return mapaCondiciones[condicion] ?? 100000002;
}

function limpiarGuid(valor: string): string {
  return valor.trim().replace(/[{}]/g, "");
}

function crearBindLookup(nombreTabla: string, id: string): string {
  return `/${nombreTabla}(${limpiarGuid(id)})`;
}

function crearPayloadActualizacion(datos: ActualizarEquipoInput) {
  const cambios: RegistroDataverse = {
    cr22e_hostname: datos.hostname.trim(),
    cr22e_tipoequipo: obtenerValorTipoEquipo(datos.tipoEquipo),
    cr22e_marca: datos.marca.trim(),
    cr22e_modelo: datos.modelo.trim(),
    cr22e_numerodeserie: datos.numeroSerie.trim(),

    cr22e_direccionip: datos.direccionIP.trim(),
    cr22e_sistemaoperativo: datos.sistemaOperativo.trim(),
    cr22e_claveanydesk: datos.claveAnyDesk.trim(),

    cr22e_responsable: datos.responsable.trim(),
    cr22e_ubicacionexacta: datos.ubicacionExacta.trim(),

    cr22e_estadodeequipo: obtenerValorEstado(datos.estadoFuncionamiento),
    cr22e_condicionfisica: obtenerValorCondicion(datos.condicionFisica),
    cr22e_activo: datos.activo,

    cr22e_observaciones: datos.observaciones.trim(),
  };

  if (datos.sucursalId.trim()) {
    const sucursalBind = crearBindLookup(
      "cr22e_sucursaleses",
      datos.sucursalId
    );

    cambios["cr22e_sucursales@odata.bind"] = sucursalBind;
    cambios["cr22e_sucursal@odata.bind"] = sucursalBind;
  }

  if (datos.departamentoId.trim()) {
    cambios["cr22e_departamento@odata.bind"] = crearBindLookup(
      "cr22e_departamentoses",
      datos.departamentoId
    );
  }
  if (datos.ubicacionSucursalId.trim()) {
  cambios["cr22e_ubicacionesSucursal@odata.bind"] = crearBindLookup(
    "cr22e_ubicacionessucursals",
    datos.ubicacionSucursalId
  );
  } else {
    cambios["cr22e_ubicacionesSucursal@odata.bind"] = null;
  }

  return cambios;
}

export function useEquipos() {
  const [equipos, setEquipos] = useState<EquipoDashboard[]>([]);
  const [sucursales, setSucursales] = useState<CatalogoOpcion[]>([]);
  const [departamentos, setDepartamentos] = useState<CatalogoOpcion[]>([]);
  const [ubicacionesSucursal, setUbicacionesSucursal] = useState<
    CatalogoOpcion[]
  >([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarEquipos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [
        resultadoEquipos,
        resultadoSucursales,
        resultadoDepartamentos,
        resultadoUbicaciones,
      ] = await Promise.all([
        Cr22e_equipostisService.getAll(),
        Cr22e_sucursalesesService.getAll(),
        Cr22e_departamentosesService.getAll(),
        Cr22e_ubicacionessucursalsService.getAll(),
      ]);

      if (!resultadoEquipos.success) {
        throw new Error("No se pudieron cargar los equipos desde Dataverse.");
      }

      const sucursalesPorId = crearMapaNombres(
        (resultadoSucursales.data ?? []) as unknown as RegistroDataverse[],
        ["cr22e_sucursalesid"],
        ["cr22e_nombresucursal", "cr22e_name", "name"]
      );

      const departamentosPorId = crearMapaNombres(
        (resultadoDepartamentos.data ?? []) as unknown as RegistroDataverse[],
        ["cr22e_departamentosid"],
        ["cr22e_nombredepartamento", "cr22e_name", "name"]
      );

      const ubicacionesPorId = crearMapaNombres(
        (resultadoUbicaciones.data ?? []) as unknown as RegistroDataverse[],
        [
          "cr22e_ubicacionessucursalid",
          "cr22e_ubicacionessucursalv2id",
        ],
        [
          "cr22e_nombreubicacion",
          "cr22e_nombreubicacionessucursal",
          "cr22e_name",
          "name",
        ]
      );

      const sucursalesCatalogo = crearCatalogoOpciones(
        (resultadoSucursales.data ?? []) as unknown as RegistroDataverse[],
        ["cr22e_sucursalesid"],
        ["cr22e_nombresucursal", "cr22e_name", "name"]
      );

      const departamentosCatalogo = crearCatalogoOpciones(
        (resultadoDepartamentos.data ?? []) as unknown as RegistroDataverse[],
        ["cr22e_departamentosid"],
        ["cr22e_nombredepartamento", "cr22e_name", "name"]
      );

      const ubicacionesSucursalCatalogo = crearCatalogoOpciones(
        (resultadoUbicaciones.data ?? []) as unknown as RegistroDataverse[],
        [
          "cr22e_ubicacionessucursalid",
          "cr22e_ubicacionessucursalv2id",
        ],
        [
          "cr22e_nombreubicacion",
          "cr22e_nombreubicacionessucursal",
          "cr22e_name",
          "name",
        ],
        ["_cr22e_sucursales_value", "_cr22e_sucursal_value"]
      );

      const datos = resultadoEquipos.data ?? [];

      const equiposNormalizados = datos.map((equipo: Cr22e_equipostis) =>
        normalizarEquipo(
          equipo,
          sucursalesPorId,
          departamentosPorId,
          ubicacionesPorId
        )
      );

      setEquipos(equiposNormalizados);
      setSucursales(sucursalesCatalogo);
      setDepartamentos(departamentosCatalogo);
      setUbicacionesSucursal(ubicacionesSucursalCatalogo);
    } catch (err) {
      console.error("Error al cargar equipos:", err);
      setError("No se pudieron cargar los equipos desde Dataverse.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarEquipos();
  }, [cargarEquipos]);

  const resumen = useMemo(() => {
    const total = equipos.length;

    const equiposBuenos = equipos.filter(
      (equipo) =>
        equipo.estadoFuncionamiento === "Excelente" ||
        equipo.estadoFuncionamiento === "Bueno"
    ).length;

    const equiposCriticos = equipos.filter(
      (equipo) =>
        equipo.estadoFuncionamiento === "Malo" ||
        equipo.estadoFuncionamiento === "Disfuncional"
    ).length;

    const equiposInactivos = equipos.filter((equipo) => !equipo.activo).length;

    return {
      total,
      equiposBuenos,
      equiposCriticos,
      equiposInactivos,
    };
  }, [equipos]);

  const actualizarEquipo = useCallback(
    async (datos: ActualizarEquipoInput) => {
      if (!datos.id) {
        throw new Error("No se encontró el ID interno del equipo.");
      }
      const inspeccionEquipo = await Cr22e_equipostisService.get(datos.id);

if (inspeccionEquipo.success && inspeccionEquipo.data) {
  const equipoRaw = inspeccionEquipo.data as unknown as Record<string, unknown>;

  const camposUbicacion = Object.fromEntries(
    Object.entries(equipoRaw).filter(([clave]) =>
      clave.toLowerCase().includes("ubicacion")
    )
  );

  console.log("Diagnóstico ubicación en EquiposTI:", camposUbicacion);
}

console.log("Ubicación seleccionada en modal:", {
  ubicacionSucursalId: datos.ubicacionSucursalId,
});


      const cambios = crearPayloadActualizacion(datos);

      const resultado = await Cr22e_equipostisService.update(
        datos.id,
        cambios as Parameters<typeof Cr22e_equipostisService.update>[1]
      );

      if (!resultado.success) {
        const resultadoConError = resultado as unknown as {
          error?: {
            message?: string;
          };
          message?: string;
        };

        throw new Error(
          resultadoConError.error?.message ??
            resultadoConError.message ??
            "Dataverse no pudo actualizar el equipo."
        );
      }

      return resultado.data;
    },
    []
  );

  return {
    equipos,
    sucursales,
    departamentos,
    ubicacionesSucursal,
    actualizarEquipo,
    recargarEquipos: cargarEquipos,
    isLoading,
    error,
    total: resumen.total,
    equiposBuenos: resumen.equiposBuenos,
    equiposCriticos: resumen.equiposCriticos,
    equiposInactivos: resumen.equiposInactivos,
  };
}