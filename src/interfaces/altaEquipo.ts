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

export type FacturaCompraOption = {
  id: string;
  referencia: string;
  numeroFactura?: string;
  fechaFactura?: string;
  razonSocialReceptoraId?: string;
  razonSocialReceptoraNombre?: string;
  montoTotal?: number;
  tienePdf: boolean;
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
   * Control visual principal. Cuando está activo se habilita la captura
   * o asociación de factura correspondiente a una compra nueva.
   */
  esAdquisicionNueva: boolean;

  tipoAdquisicion: TipoAdquisicion | "";
  numeroPartidaFactura: string;

  modoFactura: ModoFactura;
  facturaId: string;

  numeroFactura: string;
  fechaFactura: string;
  razonSocialReceptoraId: string;

  montoTotalFactura: string;
  observacionesFactura: string;

  facturaPdf: File | null;
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
  estadoFuncionamiento: "",
  condicionFisica: "",
  observaciones: "",

  esAdquisicionNueva: false,
  tipoAdquisicion: "Equipo existente",
  numeroPartidaFactura: "",

  modoFactura: "Sin factura por el momento",
  facturaId: "",

  numeroFactura: "",
  fechaFactura: "",
  razonSocialReceptoraId: "",

  montoTotalFactura: "",
  observacionesFactura: "",

  facturaPdf: null,
};

export const tipoEquipoOptions = [
  "Laptop",
  "PC de Escritorio",
  "Tablet",
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
