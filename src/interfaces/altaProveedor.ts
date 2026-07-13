export type SucursalOption = {
  id: string;
  nombre: string;
};


export type AltaProveedorForm = {
  nombreProveedor: string;

  nombreContacto: string;
  tipoContacto: string;
  puestoContacto: string;
  telefonoContacto: string;
  correoContacto: string;
  observacionesContacto: string;

  sucursalId: string;
  tipoServicio: string;
  estadoServicio: string;
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

  sucursalId: "",
  tipoServicio: "",
  estadoServicio: "Activo",
  telefonoSoporte: "",
  correoSoporte: "",
  horarioAtencion: "",
};

export const tipoContactoOptions = [
  "Ventas",
  "Soporte",
  "Técnico",
  "Administrativo",
  "Emergencia",
];

export const tipoServicioOptions = ["Internet", "CCTV", "Computadoras"];

export const estadoServicioOptions = ["Activo", "Inactivo", "Suspendido"];