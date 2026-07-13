export type CoreFormsView = "home" | "alta-proveedor" | "alta-equipo";

export type CoreFormCard = {
  id: CoreFormsView;
  title: string;
  description: string;
  area: string;
  status: "available" | "pending";
};
