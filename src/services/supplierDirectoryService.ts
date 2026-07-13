import type {
  SupplierAlert,
  SupplierAssignmentPayload,
  SupplierContactPayload,
  SupplierDetail,
  SupplierDirectoryFilters,
  SupplierGeneralUpdatePayload,
  SupplierListItem,
} from "../interfaces/supplierDirectory";

const now = () => new Date().toISOString();

const createId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

let mockSuppliers: SupplierDetail[] = [
  {
    id: "prov-001",
    name: "Telmex Empresarial",
    businessName: "Teléfonos de México S.A.B. de C.V.",
    rfc: "TME840315KT6",
    phone: "800 123 2222",
    email: "soporte.empresarial@telmex.com",
    website: "https://telmex.com",
    status: "activo",
    category: "Telecomunicaciones",
    notes: "Proveedor principal para servicios de internet empresarial.",
    createdOn: "2026-07-01T10:30:00.000Z",
    modifiedOn: "2026-07-04T14:20:00.000Z",
    contacts: [
      {
        id: "cont-001",
        supplierId: "prov-001",
        name: "Laura Méndez",
        role: "Ejecutiva de cuenta",
        email: "laura.mendez@telmex.com",
        phone: "833 000 0001",
        contactType: "Comercial",
        isMain: true,
        active: true,
      },
    ],
    assignments: [
      {
        id: "asig-001",
        supplierId: "prov-001",
        serviceId: "Internet",
        serviceName: "Internet empresarial",
        branchId: "Tampico",
        branchName: "Tampico",
        internalLocationId: "Dragon",
        internalLocationName: "Dragón",
        contactId: "cont-001",
        contactName: "Laura Méndez",
        status: "activo",
        notes: "Servicio principal de conectividad.",
      },
    ],
    alerts: [],
  },
  {
    id: "prov-002",
    name: "Soporte CCTV Norte",
    businessName: "Soluciones de Videovigilancia del Norte",
    rfc: "",
    phone: "",
    email: "contacto@cctvnorte.com",
    status: "observacion",
    category: "CCTV / Seguridad",
    notes: "Pendiente validar información fiscal y teléfono.",
    createdOn: "2026-07-03T11:40:00.000Z",
    modifiedOn: "2026-07-05T09:10:00.000Z",
    contacts: [],
    assignments: [
      {
        id: "asig-002",
        supplierId: "prov-002",
        serviceId: "CCTV",
        serviceName: "CCTV",
        branchId: "Saltillo",
        branchName: "Saltillo",
        internalLocationId: "Fabrica",
        internalLocationName: "Fábrica",
        status: "revision",
      },
    ],
    alerts: [],
  },
  {
    id: "prov-003",
    name: "Impresoras MX",
    businessName: "Servicios Administrados de Impresión MX",
    rfc: "IMX220101AB1",
    phone: "55 0000 0000",
    email: "",
    status: "activo",
    category: "Impresión",
    notes: "",
    createdOn: "2026-07-06T08:15:00.000Z",
    modifiedOn: "2026-07-06T08:15:00.000Z",
    contacts: [
      {
        id: "cont-003",
        supplierId: "prov-003",
        name: "Carlos Rivera",
        role: "Soporte técnico",
        email: "",
        phone: "55 1111 2222",
        contactType: "Soporte",
        isMain: true,
        active: true,
      },
    ],
    assignments: [],
    alerts: [],
  },
];

function evaluateSupplierAlerts(supplier: SupplierDetail): SupplierAlert[] {
  const alerts: SupplierAlert[] = [];
  const mainContact = supplier.contacts.find((contact) => contact.isMain && contact.active);

  if (!mainContact) {
    alerts.push({
      id: `${supplier.id}-sin-contacto`,
      severity: "critical",
      title: "Sin contacto principal",
      description: "El proveedor no tiene un contacto principal activo registrado.",
    });
  }

  if (mainContact && !mainContact.email) {
    alerts.push({
      id: `${supplier.id}-contacto-sin-correo`,
      severity: "warning",
      title: "Contacto sin correo",
      description: "El contacto principal no tiene correo registrado.",
    });
  }

  if (mainContact && !mainContact.phone) {
    alerts.push({
      id: `${supplier.id}-contacto-sin-telefono`,
      severity: "warning",
      title: "Contacto sin teléfono",
      description: "El contacto principal no tiene teléfono registrado.",
    });
  }

  if (supplier.assignments.length === 0) {
    alerts.push({
      id: `${supplier.id}-sin-servicios`,
      severity: "warning",
      title: "Sin servicios asignados",
      description: "El proveedor no tiene servicios o sucursales asociadas.",
    });
  }

  if (!supplier.rfc || !supplier.phone || !supplier.email) {
    alerts.push({
      id: `${supplier.id}-datos-incompletos`,
      severity: "info",
      title: "Datos generales incompletos",
      description: "Hay datos generales pendientes como RFC, teléfono o correo.",
    });
  }

  return alerts;
}

function withAlerts(supplier: SupplierDetail): SupplierDetail {
  return {
    ...supplier,
    alerts: evaluateSupplierAlerts(supplier),
  };
}

function toListItem(supplier: SupplierDetail): SupplierListItem {
  const supplierWithAlerts = withAlerts(supplier);
  const mainContact = supplier.contacts.find((contact) => contact.isMain && contact.active);
  const branchIds = new Set(supplier.assignments.map((assignment) => assignment.branchId));
  const serviceIds = new Set(supplier.assignments.map((assignment) => assignment.serviceId));

  return {
    id: supplier.id,
    name: supplier.name,
    businessName: supplier.businessName,
    rfc: supplier.rfc,
    status: supplier.status,
    mainContactName: mainContact?.name,
    mainContactEmail: mainContact?.email,
    mainContactPhone: mainContact?.phone,
    servicesCount: serviceIds.size,
    branchesCount: branchIds.size,
    alertsCount: supplierWithAlerts.alerts.length,
    createdOn: supplier.createdOn,
    modifiedOn: supplier.modifiedOn,
  };
}

function hasActiveFilters(filters: SupplierDirectoryFilters) {
  return (
    filters.search.trim() !== "" ||
    filters.status !== "todos" ||
    filters.serviceId !== "todos" ||
    filters.branchId !== "todos" ||
    filters.alertType !== "todos"
  );
}

function matchesSearch(supplier: SupplierDetail, search: string) {
  const term = search.trim().toLowerCase();

  if (!term) return true;

  const values = [
    supplier.name,
    supplier.businessName,
    supplier.rfc,
    supplier.category,
    supplier.email,
    supplier.phone,
    ...supplier.contacts.flatMap((contact) => [
      contact.name,
      contact.email,
      contact.phone,
      contact.role,
      contact.contactType,
    ]),
    ...supplier.assignments.flatMap((assignment) => [
      assignment.serviceName,
      assignment.branchName,
      assignment.internalLocationName,
    ]),
  ];

  return values.some((value) => value?.toLowerCase().includes(term));
}

function matchesAlertFilter(supplier: SupplierDetail, alertType: SupplierDirectoryFilters["alertType"]) {
  if (alertType === "todos") return true;

  const mainContact = supplier.contacts.find((contact) => contact.isMain && contact.active);

  if (alertType === "sin_contacto") return !mainContact;
  if (alertType === "sin_servicios") return supplier.assignments.length === 0;
  if (alertType === "datos_incompletos") return !supplier.rfc || !supplier.phone || !supplier.email;

  return true;
}

function applyFilters(filters: SupplierDirectoryFilters) {
  return mockSuppliers
    .map(withAlerts)
    .filter((supplier) => matchesSearch(supplier, filters.search))
    .filter((supplier) => filters.status === "todos" || supplier.status === filters.status)
    .filter(
      (supplier) =>
        filters.serviceId === "todos" ||
        supplier.assignments.some((assignment) =>
          `${assignment.serviceId} ${assignment.serviceName}`.toLowerCase().includes(filters.serviceId.toLowerCase())
        )
    )
    .filter(
      (supplier) =>
        filters.branchId === "todos" ||
        supplier.assignments.some((assignment) =>
          `${assignment.branchId} ${assignment.branchName}`.toLowerCase().includes(filters.branchId.toLowerCase())
        )
    )
    .filter((supplier) => matchesAlertFilter(supplier, filters.alertType));
}

export const supplierDirectoryService = {
  async getSuppliers(filters: SupplierDirectoryFilters): Promise<SupplierListItem[]> {
    const filtered = hasActiveFilters(filters);

    const data = applyFilters(filters).sort((a, b) => {
      const dateA = new Date(a.createdOn || 0).getTime();
      const dateB = new Date(b.createdOn || 0).getTime();
      return dateB - dateA;
    });

    return (filtered ? data : data.slice(0, 20)).map(toListItem);
  },

  async getSupplierDetail(supplierId: string): Promise<SupplierDetail | null> {
    const supplier = mockSuppliers.find((item) => item.id === supplierId);
    return supplier ? withAlerts(supplier) : null;
  },

  async updateSupplierGeneralInfo(payload: SupplierGeneralUpdatePayload): Promise<void> {
    const supplier = mockSuppliers.find((item) => item.id === payload.supplierId);
    if (!supplier) throw new Error("Proveedor no encontrado.");

    supplier.name = payload.name;
    supplier.businessName = payload.businessName;
    supplier.rfc = payload.rfc;
    supplier.phone = payload.phone;
    supplier.email = payload.email;
    supplier.website = payload.website;
    supplier.status = payload.status;
    supplier.category = payload.category;
    supplier.notes = payload.notes;
    supplier.modifiedOn = now();
  },

  async upsertSupplierContact(payload: SupplierContactPayload): Promise<void> {
    const supplier = mockSuppliers.find((item) => item.id === payload.supplierId);
    if (!supplier) throw new Error("Proveedor no encontrado.");

    if (payload.isMain) {
      supplier.contacts = supplier.contacts.map((contact) => ({
        ...contact,
        isMain: false,
      }));
    }

    if (payload.id) {
      supplier.contacts = supplier.contacts.map((contact) =>
        contact.id === payload.id
          ? {
              ...contact,
              name: payload.name,
              role: payload.role,
              email: payload.email,
              phone: payload.phone,
              contactType: payload.contactType,
              isMain: payload.isMain,
              active: payload.active,
            }
          : contact
      );
    } else {
      supplier.contacts.push({
        id: createId("cont"),
        supplierId: payload.supplierId,
        name: payload.name,
        role: payload.role,
        email: payload.email,
        phone: payload.phone,
        contactType: payload.contactType,
        isMain: payload.isMain,
        active: payload.active,
      });
    }

    supplier.modifiedOn = now();
  },

  async upsertSupplierAssignment(payload: SupplierAssignmentPayload): Promise<void> {
    const supplier = mockSuppliers.find((item) => item.id === payload.supplierId);
    if (!supplier) throw new Error("Proveedor no encontrado.");

    const contact = supplier.contacts.find((item) => item.id === payload.contactId);

    const nextAssignment = {
      supplierId: payload.supplierId,
      serviceId: payload.serviceId,
      serviceName: payload.serviceId,
      branchId: payload.branchId,
      branchName: payload.branchId,
      internalLocationId: payload.internalLocationId,
      internalLocationName: payload.internalLocationId,
      contactId: payload.contactId,
      contactName: contact?.name,
      status: payload.status,
      notes: payload.notes,
    };

    if (payload.id) {
      supplier.assignments = supplier.assignments.map((assignment) =>
        assignment.id === payload.id
          ? {
              ...assignment,
              ...nextAssignment,
            }
          : assignment
      );
    } else {
      supplier.assignments.push({
        id: createId("asig"),
        ...nextAssignment,
      });
    }

    supplier.modifiedOn = now();
  },

  async setSupplierStatus(supplierId: string, status: "activo" | "inactivo"): Promise<void> {
    const supplier = mockSuppliers.find((item) => item.id === supplierId);
    if (!supplier) throw new Error("Proveedor no encontrado.");

    supplier.status = status;
    supplier.modifiedOn = now();
  },
};