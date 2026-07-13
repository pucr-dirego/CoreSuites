export type SucursalOption = {
  id: string;
  nombre: string;
};

export type DepartamentoOption = {
  id: string;
  nombre: string;
};


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
};

export const tipoEquipoOptions = ["Laptop", "PC de Escritorio"];

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