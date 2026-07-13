import { Cr22e_contactosproveedorsService } from "../generated/services/Cr22e_contactosproveedorsService";
import { Cr22e_proveedoresesService } from "../generated/services/Cr22e_proveedoresesService";
import { Cr22e_serviciosproveedorsucursalsService } from "../generated/services/Cr22e_serviciosproveedorsucursalsService";
import { Cr22e_sucursalesesService } from "../generated/services/Cr22e_sucursalesesService";

import type { Cr22e_sucursaleses } from "../generated/models/Cr22e_sucursalesesModel";

import type { Cr22e_contactosproveedorscr22e_tipocontacto } from "../generated/models/Cr22e_contactosproveedorsModel";

import type {
  Cr22e_serviciosproveedorsucursalscr22e_estadoservicio,
  Cr22e_serviciosproveedorsucursalscr22e_tiposervicio,
} from "../generated/models/Cr22e_serviciosproveedorsucursalsModel";

import type {
  AltaProveedorForm,
  SucursalOption,
} from "../interfaces/altaProveedor";

function unwrapData<T>(response: unknown): T[] {
  if (Array.isArray(response)) {
    return response as T[];
  }

  const wrapped = response as {
    data?: T[];
    value?: T[];
    result?: T[];
  };

  if (Array.isArray(wrapped.data)) return wrapped.data;
  if (Array.isArray(wrapped.value)) return wrapped.value;
  if (Array.isArray(wrapped.result)) return wrapped.result;

  return [];
}

function sortByNombre<T extends { nombre: string }>(items: T[]) {
  return [...items].sort((a, b) => a.nombre.localeCompare(b.nombre));
}

function clean(value: string) {
  return value.trim();
}

function mapTipoContacto(
  value: string
): Cr22e_contactosproveedorscr22e_tipocontacto {
  switch (value) {
    case "Ventas":
      return 100000001;
    case "Soporte":
      return 100000002;
    case "Técnico":
      return 100000003;
    case "Administrativo":
      return 100000004;
    case "Emergencia":
      return 100000005;
    default:
      return 100000002;
  }
}

function mapTipoServicio(
  value: string
): Cr22e_serviciosproveedorsucursalscr22e_tiposervicio {
  switch (value) {
    case "Internet":
      return 100000000;
    case "CCTV":
      return 100000001;
    case "Computadoras":
      return 100000002;
    default:
      return 100000000;
  }
}

function mapEstadoServicio(
  value: string
): Cr22e_serviciosproveedorsucursalscr22e_estadoservicio {
  switch (value) {
    case "Activo":
      return 100000001;
    case "Inactivo":
      return 100000002;
    case "Suspendido":
      return 100000003;
    default:
      return 100000001;
  }
}

function obtenerProveedorId(response: unknown) {
  const result = response as {
    cr22e_proveedoresid?: string;
    id?: string;
    data?: {
      cr22e_proveedoresid?: string;
      id?: string;
    };
    record?: {
      cr22e_proveedoresid?: string;
      id?: string;
    };
  };

  const id =
    result.cr22e_proveedoresid ||
    result.id ||
    result.data?.cr22e_proveedoresid ||
    result.data?.id ||
    result.record?.cr22e_proveedoresid ||
    result.record?.id;

  if (!id) {
    throw new Error("No se pudo obtener el ID del proveedor creado.");
  }

  return id;
}

export async function getSucursalesProveedor(): Promise<SucursalOption[]> {
  const response = await Cr22e_sucursalesesService.getAll();
  const data = unwrapData<Cr22e_sucursaleses>(response);

  return sortByNombre(
    data
      .filter((sucursal) => sucursal.statecode === 0)
      .filter((sucursal) => sucursal.cr22e_activo !== false)
      .map((sucursal) => ({
        id: sucursal.cr22e_sucursalesid,
        nombre:
          sucursal.cr22e_nombresucursal ||
          sucursal.cr22e_name ||
          "Sin nombre",
      }))
      .filter((sucursal) => Boolean(sucursal.id && sucursal.nombre))
  );
}

export async function crearProveedorCompleto(form: AltaProveedorForm) {
  const nombreProveedor = clean(form.nombreProveedor);
  const nombreContacto = clean(form.nombreContacto);

  const proveedorRecord = {
    cr22e_name: nombreProveedor,
    cr22e_activo: true,
  };

  const proveedorCreado = await Cr22e_proveedoresesService.create(
    proveedorRecord as never
  );

  const proveedorId = obtenerProveedorId(proveedorCreado);

  const contactoRecord = {
    cr22e_name: nombreContacto,
    cr22e_tipocontacto: mapTipoContacto(form.tipoContacto),
    cr22e_puesto: clean(form.puestoContacto),
    cr22e_telefono: clean(form.telefonoContacto),
    cr22e_correo: clean(form.correoContacto),
    cr22e_observaciones: clean(form.observacionesContacto),
    cr22e_activo: true,
    "cr22e_Proveedor@odata.bind": `/cr22e_proveedoreses(${proveedorId})`,
  };

  const servicioRecord = {
    cr22e_name: `${nombreProveedor} - ${form.tipoServicio}`,
    cr22e_tiposervicio: mapTipoServicio(form.tipoServicio),
    cr22e_estadoservicio: mapEstadoServicio(form.estadoServicio),
    cr22e_telefonosoporte: clean(form.telefonoSoporte),
    cr22e_correosoporte: clean(form.correoSoporte),
    cr22e_horarioatencion: clean(form.horarioAtencion),
    cr22e_activo: true,

    "cr22e_Proveedor@odata.bind": `/cr22e_proveedoreses(${proveedorId})`,
    "cr22e_Sucursal@odata.bind": `/cr22e_sucursaleses(${form.sucursalId})`,
  };

  await Cr22e_contactosproveedorsService.create(contactoRecord as never);

  await Cr22e_serviciosproveedorsucursalsService.create(
    servicioRecord as never
  );

  return proveedorCreado;
}