export type EstadoFuncionamiento =
  | "Excelente"
  | "Bueno"
  | "Regular"
  | "Malo"
  | "Disfuncional"
  | "Sin estado";

export interface EquipoDashboard {
  id: string;
  idequipo: string;
  hostname: string;
  tipoEquipo: string;
  marca: string;
  modelo: string;
  numeroSerie: string;
  sucursalId: string;
  departamentoId: string;
  ubicacionExacta: string;
  ubicacionSucursalId: string;
  sistemaOperativo: string;
  direccionIP: string;
  responsable: string;
  claveAnyDesk: string;
  sucursal: string;
  departamento: string;
  observaciones: string;
  ubicacion: string;
  estadoFuncionamiento: EstadoFuncionamiento;
  condicionFisica: string;
  activo: boolean;
  createdon?: string;
  modifiedon?: string;
}

export interface CatalogoOpcion {
  id: string;
  nombre: string;
  sucursalId?: string;
}

export interface ActualizarEquipoInput {
  id: string;

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
  ubicacionExacta: string;
  ubicacionSucursalId: string;

  estadoFuncionamiento: string;
  condicionFisica: string;
  activo: boolean;

  observaciones: string;
}
