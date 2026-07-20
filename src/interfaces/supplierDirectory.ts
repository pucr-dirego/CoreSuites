export type SupplierStatus =
  | "activo"
  | "inactivo"
  | "observacion"
  | "pendiente";

export type SupplierPersistedStatus = "activo" | "inactivo";

export type SupplierAssignmentStatus = "activo" | "inactivo";

export type SupplierAlertSeverity = "info" | "warning" | "critical";

export type SupplierAlertTarget =
  | "general"
  | "contacts"
  | "assignments";

export interface SupplierDirectoryFilters {
  search: string;
  status: "todos" | SupplierStatus;
  serviceId: string;
  branchId: string;
  alertType:
    | "todos"
    | "sin_contacto"
    | "sin_servicios"
    | "datos_incompletos";
}

export interface SupplierListItem {
  id: string;
  name: string;
  businessName?: string;
  rfc?: string;
  status: SupplierStatus;
  mainContactName?: string;
  mainContactEmail?: string;
  mainContactPhone?: string;
  servicesCount: number;
  branchesCount: number;
  alertsCount: number;
  createdOn?: string;
  modifiedOn?: string;
}

export interface SupplierContact {
  id: string;
  supplierId: string;
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  contactType?: string;

  /*
   * Valor calculado para la vista.
   * Dataverse no tiene actualmente una columna "Contacto principal".
   */
  isMain: boolean;

  active: boolean;
}

export interface SupplierAssignment {
  id: string;
  supplierId: string;
  serviceId: string;
  serviceName: string;
  branchId: string;
  branchName: string;
  status: SupplierAssignmentStatus;
  notes?: string;
}

export interface SupplierAlert {
  id: string;
  severity: SupplierAlertSeverity;
  title: string;
  description: string;

  /*
   * Se utilizarán en el siguiente paso para dirigir al usuario
   * a datos generales, contactos o asignaciones.
   */
  target?: SupplierAlertTarget;
  targetId?: string;
}

export interface SupplierDetail {
  id: string;
  name: string;
  businessName?: string;
  rfc?: string;
  phone?: string;
  email?: string;
  website?: string;
  status: SupplierStatus;

  /*
   * Se conserva temporalmente para no romper componentes antiguos.
   * La tabla Proveedores de Dataverse no tiene esta columna.
   */
  category?: string;

  notes?: string;
  createdOn?: string;
  modifiedOn?: string;
  contacts: SupplierContact[];
  assignments: SupplierAssignment[];
  alerts: SupplierAlert[];
}

export interface SupplierGeneralUpdatePayload {
  supplierId: string;
  name: string;
  businessName?: string;
  rfc?: string;
  phone?: string;
  email?: string;
  website?: string;
  status: SupplierPersistedStatus;
  notes?: string;
}

export interface SupplierContactPayload {
  id?: string;
  supplierId: string;
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  contactType?: string;

  /*
   * Se conserva temporalmente por compatibilidad con el modal.
   * El servicio real no intenta persistirlo en Dataverse.
   */
  isMain: boolean;

  active: boolean;
}

export interface SupplierAssignmentPayload {
  id?: string;
  supplierId: string;
  serviceId: string;
  branchId: string;
  status: SupplierAssignmentStatus;
  notes?: string;
}
