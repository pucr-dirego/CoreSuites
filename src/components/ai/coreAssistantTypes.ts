export type AssistantEquipo = {
  id?: string;
  hostname?: string;
  tipoEquipo?: string;
  marca?: string;
  modelo?: string;
  numeroSerie?: string;
  responsable?: string;
  sucursal?: string;
  departamento?: string;
  ubicacion?: string;
  estadoFuncionamiento?: string;
  condicionFisica?: string;
  observaciones?: string;
  activo?: boolean;
};

export type AssistantMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  createdAt: Date;
};

export type AssistantQuickQuestion = {
  id: string;
  label: string;
  question: string;
};

