export type EstadoServicioProveedor =
  | "Activo"
  | "Inactivo"
  | "Suspendido"
  | "Sin estado";

export type TipoServicioProveedor =
  | "Internet"
  | "CCTV"
  | "Computadoras"
  | "Sin clasificar";

export interface ContactoProveedorVista {
  id: string;
  proveedorId?: string;
  nombre: string;
  puesto?: string;
  telefono?: string;
  correo?: string;
  tipoContacto: string;
  observaciones?: string;
  activo: boolean;
}

export interface ServicioProveedorVista {
  id: string;
  nombreServicio: string;

  proveedorId?: string;
  proveedor: string;

  sucursalId?: string;
  sucursal: string;

  ubicacionId?: string;
  ubicacion?: string;

  tipoServicio: TipoServicioProveedor;
  estadoServicio: EstadoServicioProveedor;

  telefonoSoporte?: string;
  correoSoporte?: string;
  horarioAtencion?: string;
  observaciones?: string;
  fechaUltimaActualizacion?: string;

  contactoPrincipal?: ContactoProveedorVista;

  activo: boolean;
}

export interface CoreSuppliersResumen {
  totalProveedores: number;
  serviciosActivos: number;
  sucursalesCubiertas: number;
  serviciosSinContacto: number;
}