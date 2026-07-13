export type SupplierStatus = "activo" | "inactivo" | "observacion" | "pendiente";

export type SupplierAlertSeverity = "info" | "warning" | "critical";

export interface SupplierDirectoryFilters {
  search: string;
  status: "todos" | SupplierStatus;
  serviceId: string;
  branchId: string;
  alertType: "todos" | "sin_contacto" | "sin_servicios" | "datos_incompletos";
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
  internalLocationId?: string;
  internalLocationName?: string;
  contactId?: string;
  contactName?: string;
  status: "activo" | "inactivo" | "revision" | "implementacion";
  notes?: string;
}

export interface SupplierAlert {
  id: string;
  severity: SupplierAlertSeverity;
  title: string;
  description: string;
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
  status: SupplierStatus;
  category?: string;
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
  isMain: boolean;
  active: boolean;
}

export interface SupplierAssignmentPayload {
  id?: string;
  supplierId: string;
  serviceId: string;
  branchId: string;
  internalLocationId?: string;
  contactId?: string;
  status: "activo" | "inactivo" | "revision" | "implementacion";
  notes?: string;
}