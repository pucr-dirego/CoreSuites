export type SucursalOption = {
  id: string;
  nombre: string;
};

export type DepartamentoOption = {
  id: string;
  nombre: string;
};

export type RazonSocialOption = {
  id: string;
  nombre: string;
  nombreCorto?: string;
  rfc?: string;
};

export type MonedaOption = {
  id: string;
  codigo: string;
  nombre: string;
  simbolo: string;
};

export type ProveedorEmisorOption = {
  id: string;
  nombre: string;
  razonSocial?: string;
  rfc?: string;
};

export type FacturaCompraOption = {
  id: string;
  referencia: string;
  numeroFactura?: string;
  uuidFiscal?: string;
  fechaFactura?: string;
  razonSocialReceptoraId?: string;
  razonSocialReceptoraNombre?: string;
  proveedorEmisorId?: string;
  proveedorEmisorNombre?: string;
  razonSocialEmisor?: string;
  rfcEmisor?: string;
  subtotal?: number;
  impuestos?: number;
  montoTotal?: number;
  monedaId?: string;
  monedaNombre?: string;
  tienePdf: boolean;
  tieneXml: boolean;
};

export const tipoAdquisicionOptions = [
  "Compra nueva",
  "Equipo existente",
  "Transferencia",
  "Arrendamiento",
  "Donación",
  "Otro",
] as const;

export type TipoAdquisicion =
  (typeof tipoAdquisicionOptions)[number];

export const tipoIncorporacionOptions = [
  "Equipo existente",
  "Transferencia",
  "Arrendamiento",
  "Donación",
  "Otro",
] as const satisfies readonly TipoAdquisicion[];

export const modoFacturaOptions = [
  "Sin factura por el momento",
  "Seleccionar factura existente",
  "Registrar factura nueva",
] as const;

export type ModoFactura =
  (typeof modoFacturaOptions)[number];

export type AltaEquipoForm = {
  tipoEquipo: string;
  marca: string;
  modelo: string;
  numeroSerie: string;
  hostname: string;
  direccionIP: string;
  sistemaOperativo: string;
  claveAnyDesk: string;

  sucursalId: string;
  departamentoId: string;
  ubicacionExacta: string;

  responsable: string;
  estadoFuncionamiento: string;
  condicionFisica: string;
  observaciones: string;

  /*
   * Control visual principal. Cuando está activo se habilita toda la captura
   * de compra, factura, importes y archivos.
   */
  esAdquisicionNueva: boolean;

  tipoAdquisicion: TipoAdquisicion | "";
  fechaAdquisicion: string;
  costoIndividualEquipo: string;
  numeroPartidaFactura: string;
  monedaId: string;

  modoFactura: ModoFactura;
  facturaId: string;

  numeroFactura: string;
  uuidFiscal: string;
  fechaFactura: string;
  razonSocialReceptoraId: string;

  proveedorEmisorId: string;
  razonSocialEmisor: string;
  rfcEmisor: string;

  subtotalFactura: string;
  impuestosFactura: string;
  montoTotalFactura: string;
  observacionesFactura: string;

  facturaPdf: File | null;
  facturaXml: File | null;
};

export const initialAltaEquipoForm: AltaEquipoForm = {
  tipoEquipo: "",
  marca: "",
  modelo: "",
  numeroSerie: "",
  hostname: "",
  direccionIP: "",
  sistemaOperativo: "",
  claveAnyDesk: "",

  sucursalId: "",
  departamentoId: "",
  ubicacionExacta: "",

  responsable: "",
  estadoFuncionamiento: "Bueno",
  condicionFisica: "Bueno",
  observaciones: "",

  esAdquisicionNueva: false,
  tipoAdquisicion: "Equipo existente",
  fechaAdquisicion: "",
  costoIndividualEquipo: "",
  numeroPartidaFactura: "",
  monedaId: "",

  modoFactura: "Sin factura por el momento",
  facturaId: "",

  numeroFactura: "",
  uuidFiscal: "",
  fechaFactura: "",
  razonSocialReceptoraId: "",

  proveedorEmisorId: "",
  razonSocialEmisor: "",
  rfcEmisor: "",

  subtotalFactura: "",
  impuestosFactura: "",
  montoTotalFactura: "",
  observacionesFactura: "",

  facturaPdf: null,
  facturaXml: null,
};

export const tipoEquipoOptions = [
  "Laptop",
  "PC de Escritorio",
];

export const estadoFuncionamientoOptions = [
  "Excelente",
  "Bueno",
  "Regular",
  "Malo",
  "Disfuncional",
];

export const condicionFisicaOptions = [
  "Excelente",
  "Bueno",
  "Regular",
  "Malo",
  "Disfuncional",
];

export const MAX_FACTURA_PDF_BYTES = 15 * 1024 * 1024;
export const MAX_FACTURA_XML_BYTES = 5 * 1024 * 1024;
