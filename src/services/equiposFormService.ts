import {
  Cr22e_departamentosesService,
  Cr22e_equipostisService,
  Cr22e_sucursalesesService,
} from "../generated";

import type {
  AltaEquipoForm,
  DepartamentoOption,
  SucursalOption,
} from "../interfaces/altaEquipo";

import type { Cr22e_sucursaleses } from "../generated/models/Cr22e_sucursalesesModel";
import type { Cr22e_departamentoses } from "../generated/models/Cr22e_departamentosesModel";


import type {
  Cr22e_equipostiscr22e_condicionfisica,
  Cr22e_equipostiscr22e_estadodeequipo,
  Cr22e_equipostiscr22e_tipoequipo,
} from "../generated/models/Cr22e_equipostisModel";

type OperationResultLike<T> = {
  data?: T;
  value?: T;
  result?: T;
};

function unwrapData<T>(response: unknown): T {
  const result = response as OperationResultLike<T>;

  if (result.data !== undefined) return result.data;
  if (result.value !== undefined) return result.value;
  if (result.result !== undefined) return result.result;

  return response as T;
}

function sortByNombre<T extends { nombre: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.nombre.localeCompare(b.nombre));
}

function clean(value: string) {
  return value.trim();
}

function mapTipoEquipo(
  value: string
): Cr22e_equipostiscr22e_tipoequipo | undefined {
  const map: Record<string, Cr22e_equipostiscr22e_tipoequipo> = {
    Laptop: 100000000,
    "PC de Escritorio": 100000001,
  };

  return map[value];
}

function mapEstadoEquipo(
  value: string
): Cr22e_equipostiscr22e_estadodeequipo | undefined {
  const map: Record<string, Cr22e_equipostiscr22e_estadodeequipo> = {
    Excelente: 100000000,
    Bueno: 100000001,
    Regular: 100000002,
    Malo: 100000003,
    Disfuncional: 100000004,
  };

  return map[value];
}

function mapCondicionFisica(
  value: string
): Cr22e_equipostiscr22e_condicionfisica | undefined {
  const map: Record<string, Cr22e_equipostiscr22e_condicionfisica> = {
    Excelente: 100000000,
    Bueno: 100000001,
    Regular: 100000002,
    Malo: 100000003,
    Disfuncional: 100000004,
  };

  return map[value];
}

export async function getSucursalesEquipo(): Promise<SucursalOption[]> {
  const response = await Cr22e_sucursalesesService.getAll();
  const rows = unwrapData<Cr22e_sucursaleses[]>(response);

  const sucursales = rows
    .filter((row) => row.statecode === 0)
    .filter((row) => row.cr22e_activo !== false)
    .map((row) => ({
      id: row.cr22e_sucursalesid,
      nombre: row.cr22e_nombresucursal || row.cr22e_name || "Sin nombre",
    }))
    .filter((row) => Boolean(row.id && row.nombre));

  return sortByNombre(sucursales);
}

export async function getDepartamentosEquipo(): Promise<DepartamentoOption[]> {
  const response = await Cr22e_departamentosesService.getAll();
  const rows = unwrapData<Cr22e_departamentoses[]>(response);

  const departamentos = rows
    .filter((row) => row.statecode === 0)
    .filter((row) => row.cr22e_activo !== false)
    .map((row) => ({
      id: row.cr22e_departamentosid,
      nombre: row.cr22e_nombredepartamento || row.cr22e_name || "Sin nombre",
    }))
    .filter((row) => Boolean(row.id && row.nombre));

  return sortByNombre(departamentos);
}


export async function crearEquipo(form: AltaEquipoForm) {
  const hostname = clean(form.hostname);
  const nombreVisible =
    hostname ||
    clean(form.numeroSerie) ||
    clean(form.modelo) ||
    "Equipo TI sin hostname";

  const record = {
    cr22e_name: nombreVisible,
    cr22e_hostname: nombreVisible,

    cr22e_tipoequipo: mapTipoEquipo(form.tipoEquipo),
    cr22e_marca: clean(form.marca),
    cr22e_modelo: clean(form.modelo),
    cr22e_numerodeserie: clean(form.numeroSerie),
    cr22e_direccionip: clean(form.direccionIP),
    cr22e_sistemaoperativo: clean(form.sistemaOperativo),
    cr22e_claveanydesk: clean(form.claveAnyDesk),

    cr22e_responsable: clean(form.responsable),
    cr22e_ubicacionexacta: clean(form.ubicacionExacta),
    cr22e_observaciones: clean(form.observaciones),

    cr22e_estadodeequipo: mapEstadoEquipo(form.estadoFuncionamiento),
    cr22e_condicionfisica: mapCondicionFisica(form.condicionFisica),

    cr22e_activo: true,

    ...(form.sucursalId
      ? {
          "cr22e_sucursal@odata.bind": `/cr22e_sucursaleses(${form.sucursalId})`,
        }
      : {}),

    ...(form.departamentoId
      ? {
          "cr22e_departamento@odata.bind": `/cr22e_departamentoses(${form.departamentoId})`,
        }
      : {}),

  };

  return Cr22e_equipostisService.create(record as never);
}