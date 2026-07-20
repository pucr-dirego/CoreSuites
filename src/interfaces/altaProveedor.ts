export type SucursalOption = {
  id: string;
  nombre: string;
};

export const tipoContactoOptions = [
  "Ventas",
  "Soporte",
  "Técnico",
  "Administrativo",
  "Emergencia",
] as const;

export type TipoContacto = (typeof tipoContactoOptions)[number];

export const tipoServicioOptions = [
  "Internet",
  "CCTV",
  "Computadoras",
] as const;

export type TipoServicio = (typeof tipoServicioOptions)[number];

export const estadoServicioOptions = [
  "Activo",
  "Inactivo",
] as const;

export type EstadoServicio = (typeof estadoServicioOptions)[number];

export type AltaProveedorForm = {
  nombreProveedor: string;

  nombreContacto: string;
  tipoContacto: TipoContacto | "";
  puestoContacto: string;
  telefonoContacto: string;
  correoContacto: string;
  observacionesContacto: string;

  /*
   * Un proveedor puede atender una o varias sucursales.
   */
  sucursalIds: string[];

  /*
   * Un proveedor puede ofrecer uno o varios servicios.
   */
  tiposServicio: TipoServicio[];

  /*
   * Esta configuración se aplicará a todas las combinaciones
   * de sucursales y servicios seleccionadas.
   */
  estadoServicio: EstadoServicio;

  /*
   * true:
   * El teléfono y correo del contacto se reutilizan como soporte.
   *
   * false:
   * Se utilizan telefonoSoporte y correoSoporte.
   */
  usarContactoComoSoporte: boolean;

  telefonoSoporte: string;
  correoSoporte: string;
  horarioAtencion: string;
};

export const initialAltaProveedorForm: AltaProveedorForm = {
  nombreProveedor: "",

  nombreContacto: "",
  tipoContacto: "",
  puestoContacto: "",
  telefonoContacto: "",
  correoContacto: "",
  observacionesContacto: "",

  sucursalIds: [],
  tiposServicio: [],
  estadoServicio: "Activo",

  usarContactoComoSoporte: true,

  telefonoSoporte: "",
  correoSoporte: "",
  horarioAtencion: "",
};