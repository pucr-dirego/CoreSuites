import { Cr22e_contactosproveedorsService } from "../generated/services/Cr22e_contactosproveedorsService";
import { Cr22e_proveedoresesService } from "../generated/services/Cr22e_proveedoresesService";
import { Cr22e_serviciosproveedorsucursalsService } from "../generated/services/Cr22e_serviciosproveedorsucursalsService";

import {
  Cr22e_contactosproveedorscr22e_tipocontacto as TIPO_CONTACTO_LABELS,
} from "../generated/models/Cr22e_contactosproveedorsModel";
import type {
  Cr22e_contactosproveedors,
  Cr22e_contactosproveedorscr22e_tipocontacto,
} from "../generated/models/Cr22e_contactosproveedorsModel";

import type { Cr22e_proveedoreses } from "../generated/models/Cr22e_proveedoresesModel";

import {
  Cr22e_serviciosproveedorsucursalscr22e_estadoservicio as ESTADO_SERVICIO_LABELS,
  Cr22e_serviciosproveedorsucursalscr22e_tiposervicio as TIPO_SERVICIO_LABELS,
} from "../generated/models/Cr22e_serviciosproveedorsucursalsModel";
import type {
  Cr22e_serviciosproveedorsucursals,
  Cr22e_serviciosproveedorsucursalscr22e_estadoservicio,
  Cr22e_serviciosproveedorsucursalscr22e_tiposervicio,
} from "../generated/models/Cr22e_serviciosproveedorsucursalsModel";

import type {
  SupplierAlert,
  SupplierAssignment,
  SupplierAssignmentPayload,
  SupplierContact,
  SupplierContactPayload,
  SupplierDetail,
  SupplierDirectoryFilters,
  SupplierGeneralUpdatePayload,
  SupplierListItem,
  SupplierStatus,
} from "../interfaces/supplierDirectory";

type OperationEnvelope<T> = {
  success?: boolean;
  data?: T;
  value?: T;
  result?: T;
  record?: T;
  error?: {
    message?: string;
  };
};

function ensureOperationSucceeded(
  response: unknown,
  fallbackMessage: string
) {
  const envelope = response as OperationEnvelope<unknown>;

  if (envelope?.success === false) {
    throw new Error(envelope.error?.message || fallbackMessage);
  }
}

function unwrapCollection<T>(
  response: unknown,
  fallbackMessage: string
): T[] {
  ensureOperationSucceeded(response, fallbackMessage);

  if (Array.isArray(response)) {
    return response as T[];
  }

  const envelope = response as OperationEnvelope<T[]>;

  if (Array.isArray(envelope.data)) return envelope.data;
  if (Array.isArray(envelope.value)) return envelope.value;
  if (Array.isArray(envelope.result)) return envelope.result;
  if (Array.isArray(envelope.record)) return envelope.record;

  return [];
}

function unwrapRecord<T>(
  response: unknown,
  fallbackMessage: string
): T | undefined {
  ensureOperationSucceeded(response, fallbackMessage);

  if (!response || typeof response !== "object" || Array.isArray(response)) {
    return undefined;
  }

  const envelope = response as OperationEnvelope<T>;

  const wrappedRecord =
    envelope.data ||
    envelope.value ||
    envelope.result ||
    envelope.record;

  if (
    wrappedRecord &&
    typeof wrappedRecord === "object" &&
    !Array.isArray(wrappedRecord)
  ) {
    return wrappedRecord;
  }

  const responseObject = response as Record<string, unknown>;
  const envelopeKeys = [
    "success",
    "data",
    "value",
    "result",
    "record",
    "error",
  ];

  const isEnvelope = envelopeKeys.some((key) => key in responseObject);

  return isEnvelope ? undefined : (response as T);
}

function cleanText(value?: string) {
  const cleaned = value?.trim();
  return cleaned || undefined;
}

function nullableText(value?: string) {
  return cleanText(value) ?? null;
}

function requiredText(value: string, fieldName: string) {
  const cleaned = value.trim();

  if (!cleaned) {
    throw new Error(`${fieldName} es obligatorio.`);
  }

  return cleaned;
}

function cleanGuid(value: string) {
  return value.replace(/[{}]/g, "").trim();
}

function normalizeText(value?: string) {
  return value
    ?.trim()
    .toLocaleLowerCase("es-MX")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function isActiveRecord(record: {
  cr22e_activo?: boolean;
  statecode?: number;
}) {
  return record.cr22e_activo !== false && record.statecode !== 1;
}

function getContactTypeName(contact: Cr22e_contactosproveedors) {
  if (contact.cr22e_tipocontactoname) {
    return contact.cr22e_tipocontactoname;
  }

  if (contact.cr22e_tipocontacto !== undefined) {
    return TIPO_CONTACTO_LABELS[contact.cr22e_tipocontacto];
  }

  return undefined;
}

function mapContactTypeValue(
  value?: string
): Cr22e_contactosproveedorscr22e_tipocontacto | undefined {
  switch (normalizeText(value)) {
    case "ventas":
    case "comercial":
      return 100000001;

    case "soporte":
      return 100000002;

    case "tecnico":
      return 100000003;

    case "administrativo":
    case "facturacion":
      return 100000004;

    case "emergencia":
      return 100000005;

    default:
      return undefined;
  }
}

function getServiceTypeName(
  assignment: Cr22e_serviciosproveedorsucursals
) {
  if (assignment.cr22e_tiposervicioname) {
    return assignment.cr22e_tiposervicioname;
  }

  if (assignment.cr22e_tiposervicio !== undefined) {
    return (
      TIPO_SERVICIO_LABELS[assignment.cr22e_tiposervicio] ||
      "Sin clasificar"
    );
  }

  return "Sin clasificar";
}

function mapServiceTypeValue(
  value: string
): Cr22e_serviciosproveedorsucursalscr22e_tiposervicio {
  switch (normalizeText(value)) {
    case "internet":
      return 100000000;

    case "cctv":
      return 100000001;

    case "computadoras":
      return 100000002;

    default:
      throw new Error("El tipo de servicio seleccionado no es válido.");
  }
}

function getAssignmentStatus(
  assignment: Cr22e_serviciosproveedorsucursals
): "activo" | "inactivo" {
  const statusName =
    assignment.cr22e_estadoservicioname ||
    (assignment.cr22e_estadoservicio !== undefined
      ? ESTADO_SERVICIO_LABELS[assignment.cr22e_estadoservicio]
      : undefined);

  return statusName === "Activo" ? "activo" : "inactivo";
}

function mapAssignmentStatusValue(
  value: "activo" | "inactivo"
): Cr22e_serviciosproveedorsucursalscr22e_estadoservicio {
  return value === "activo" ? 100000001 : 100000002;
}

function getContactPriority(contact: SupplierContact) {
  const type = normalizeText(contact.contactType);

  if (type?.includes("soporte")) return 1;
  if (type?.includes("emergencia")) return 2;
  if (type?.includes("tecnico")) return 3;
  if (type?.includes("ventas") || type?.includes("comercial")) return 4;
  if (type?.includes("administrativo")) return 5;

  return 10;
}

function mapContact(
  contact: Cr22e_contactosproveedors
): SupplierContact {
  return {
    id: contact.cr22e_contactosproveedorid,
    supplierId: contact._cr22e_proveedor_value || "",
    name: contact.cr22e_name,
    role: cleanText(contact.cr22e_puesto),
    email: cleanText(contact.cr22e_correo),
    phone: cleanText(contact.cr22e_telefono),
    contactType: cleanText(getContactTypeName(contact)),
    isMain: false,
    active: isActiveRecord(contact),
  };
}

function groupContactsBySupplier(
  contacts: Cr22e_contactosproveedors[]
) {
  const grouped = new Map<string, SupplierContact[]>();

  contacts.map(mapContact).forEach((contact) => {
    if (!contact.supplierId) {
      return;
    }

    const supplierContacts = grouped.get(contact.supplierId) || [];
    supplierContacts.push(contact);
    grouped.set(contact.supplierId, supplierContacts);
  });

  grouped.forEach((supplierContacts, supplierId) => {
    const sorted = [...supplierContacts].sort((a, b) => {
      if (a.active !== b.active) {
        return a.active ? -1 : 1;
      }

      const priorityDifference =
        getContactPriority(a) - getContactPriority(b);

      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      return a.name.localeCompare(b.name);
    });

    const firstActiveIndex = sorted.findIndex((contact) => contact.active);

    grouped.set(
      supplierId,
      sorted.map((contact, index) => ({
        ...contact,
        isMain: index === firstActiveIndex && firstActiveIndex >= 0,
      }))
    );
  });

  return grouped;
}

function mapAssignment(
  assignment: Cr22e_serviciosproveedorsucursals
): SupplierAssignment {
  const serviceName = getServiceTypeName(assignment);

  return {
    id: assignment.cr22e_serviciosproveedorsucursalid,
    supplierId: assignment._cr22e_proveedor_value || "",
    serviceId: serviceName,
    serviceName,
    branchId: assignment._cr22e_sucursal_value || "",
    branchName:
      cleanText(assignment.cr22e_sucursalname) ||
      "Sucursal sin nombre",
    status: getAssignmentStatus(assignment),
    notes: cleanText(assignment.cr22e_observaciones),
  };
}

function groupAssignmentsBySupplier(
  assignments: Cr22e_serviciosproveedorsucursals[]
) {
  const grouped = new Map<string, SupplierAssignment[]>();

  assignments
    .filter(isActiveRecord)
    .map(mapAssignment)
    .forEach((assignment) => {
      if (!assignment.supplierId) {
        return;
      }

      const supplierAssignments =
        grouped.get(assignment.supplierId) || [];

      supplierAssignments.push(assignment);
      grouped.set(assignment.supplierId, supplierAssignments);
    });

  grouped.forEach((supplierAssignments, supplierId) => {
    grouped.set(
      supplierId,
      [...supplierAssignments].sort((a, b) => {
        const branchDifference = a.branchName.localeCompare(b.branchName);

        if (branchDifference !== 0) {
          return branchDifference;
        }

        return a.serviceName.localeCompare(b.serviceName);
      })
    );
  });

  return grouped;
}

function evaluateSupplierAlerts(
  supplier: SupplierDetail
): SupplierAlert[] {
  const alerts: SupplierAlert[] = [];

  const mainContact = supplier.contacts.find(
    (contact) => contact.isMain && contact.active
  );

  if (!mainContact) {
    alerts.push({
      id: `${supplier.id}-sin-contacto`,
      severity: "critical",
      title: "Sin contacto principal",
      description:
        "El proveedor no tiene un contacto activo disponible.",
      target: "contacts",
    });
  }

  if (mainContact && !mainContact.email) {
    alerts.push({
      id: `${supplier.id}-contacto-sin-correo`,
      severity: "warning",
      title: "Contacto sin correo",
      description:
        "El contacto operativo prioritario no tiene correo registrado.",
      target: "contacts",
      targetId: mainContact.id,
    });
  }

  if (mainContact && !mainContact.phone) {
    alerts.push({
      id: `${supplier.id}-contacto-sin-telefono`,
      severity: "warning",
      title: "Contacto sin teléfono",
      description:
        "El contacto operativo prioritario no tiene teléfono registrado.",
      target: "contacts",
      targetId: mainContact.id,
    });
  }

  if (supplier.assignments.length === 0) {
    alerts.push({
      id: `${supplier.id}-sin-servicios`,
      severity: "warning",
      title: "Sin servicios asignados",
      description:
        "El proveedor no tiene servicios o sucursales asociadas.",
      target: "assignments",
    });
  }

  if (!supplier.rfc || !supplier.phone || !supplier.email) {
    alerts.push({
      id: `${supplier.id}-datos-incompletos`,
      severity: "info",
      title: "Datos generales incompletos",
      description:
        "Hay datos generales pendientes como RFC, teléfono o correo.",
      target: "general",
    });
  }

  return alerts;
}

function getCalculatedSupplierStatus(
  isActive: boolean,
  alerts: SupplierAlert[]
): SupplierStatus {
  if (!isActive) {
    return "inactivo";
  }

  if (alerts.some((alert) => alert.severity === "critical")) {
    return "pendiente";
  }

  if (alerts.length > 0) {
    return "observacion";
  }

  return "activo";
}

function buildSupplierDetails(
  suppliers: Cr22e_proveedoreses[],
  contacts: Cr22e_contactosproveedors[],
  assignments: Cr22e_serviciosproveedorsucursals[]
): SupplierDetail[] {
  const contactsBySupplier = groupContactsBySupplier(contacts);
  const assignmentsBySupplier =
    groupAssignmentsBySupplier(assignments);

  return suppliers.map((supplierRecord) => {
    const supplierId = supplierRecord.cr22e_proveedoresid;
    const isActive = isActiveRecord(supplierRecord);

    const baseSupplier: SupplierDetail = {
      id: supplierId,
      name: supplierRecord.cr22e_name,
      businessName: cleanText(supplierRecord.cr22e_razonsocial),
      rfc: cleanText(supplierRecord.cr22e_rfc),
      phone: cleanText(supplierRecord.cr22e_telefonogeneral),
      email: cleanText(supplierRecord.cr22e_correogeneral),
      website: cleanText(supplierRecord.cr22e_sitioweb),
      status: isActive ? "activo" : "inactivo",
      category: undefined,
      notes: cleanText(supplierRecord.cr22e_observaciones),
      createdOn: supplierRecord.createdon,
      modifiedOn: supplierRecord.modifiedon,
      contacts: contactsBySupplier.get(supplierId) || [],
      assignments: assignmentsBySupplier.get(supplierId) || [],
      alerts: [],
    };

    const alerts = evaluateSupplierAlerts(baseSupplier);

    return {
      ...baseSupplier,
      status: getCalculatedSupplierStatus(isActive, alerts),
      alerts,
    };
  });
}

function toListItem(supplier: SupplierDetail): SupplierListItem {
  const mainContact = supplier.contacts.find(
    (contact) => contact.isMain && contact.active
  );

  const branchIds = new Set(
    supplier.assignments
      .map((assignment) => assignment.branchId)
      .filter(Boolean)
  );

  const serviceIds = new Set(
    supplier.assignments
      .map((assignment) => assignment.serviceId)
      .filter(Boolean)
  );

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
    alertsCount: supplier.alerts.length,
    createdOn: supplier.createdOn,
    modifiedOn: supplier.modifiedOn,
  };
}

function matchesSearch(
  supplier: SupplierDetail,
  search: string
) {
  const term = search.trim().toLocaleLowerCase("es-MX");

  if (!term) {
    return true;
  }

  const values = [
    supplier.name,
    supplier.businessName,
    supplier.rfc,
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
    ]),
  ];

  return values.some((value) =>
    value?.toLocaleLowerCase("es-MX").includes(term)
  );
}

function matchesAlertFilter(
  supplier: SupplierDetail,
  alertType: SupplierDirectoryFilters["alertType"]
) {
  if (alertType === "todos") {
    return true;
  }

  const mainContact = supplier.contacts.find(
    (contact) => contact.isMain && contact.active
  );

  if (alertType === "sin_contacto") {
    return !mainContact;
  }

  if (alertType === "sin_servicios") {
    return supplier.assignments.length === 0;
  }

  if (alertType === "datos_incompletos") {
    return !supplier.rfc || !supplier.phone || !supplier.email;
  }

  return true;
}

function applyFilters(
  suppliers: SupplierDetail[],
  filters: SupplierDirectoryFilters
) {
  return suppliers
    .filter((supplier) => matchesSearch(supplier, filters.search))
    .filter(
      (supplier) =>
        filters.status === "todos" ||
        supplier.status === filters.status
    )
    .filter(
      (supplier) =>
        filters.serviceId === "todos" ||
        supplier.assignments.some((assignment) =>
          `${assignment.serviceId} ${assignment.serviceName}`
            .toLocaleLowerCase("es-MX")
            .includes(
              filters.serviceId.toLocaleLowerCase("es-MX")
            )
        )
    )
    .filter(
      (supplier) =>
        filters.branchId === "todos" ||
        supplier.assignments.some((assignment) =>
          `${assignment.branchId} ${assignment.branchName}`
            .toLocaleLowerCase("es-MX")
            .includes(
              filters.branchId.toLocaleLowerCase("es-MX")
            )
        )
    )
    .filter((supplier) =>
      matchesAlertFilter(supplier, filters.alertType)
    );
}

async function loadDirectoryData() {
  const [suppliersResult, contactsResult, assignmentsResult] =
    await Promise.all([
      Cr22e_proveedoresesService.getAll(),
      Cr22e_contactosproveedorsService.getAll(),
      Cr22e_serviciosproveedorsucursalsService.getAll(),
    ]);

  const suppliers = unwrapCollection<Cr22e_proveedoreses>(
    suppliersResult,
    "No se pudieron cargar los proveedores."
  );

  const contacts = unwrapCollection<Cr22e_contactosproveedors>(
    contactsResult,
    "No se pudieron cargar los contactos de proveedores."
  );

  const assignments =
    unwrapCollection<Cr22e_serviciosproveedorsucursals>(
      assignmentsResult,
      "No se pudieron cargar los servicios por sucursal."
    );

  return buildSupplierDetails(
    suppliers,
    contacts,
    assignments
  );
}

async function getSupplierRecord(supplierId: string) {
  const response = await Cr22e_proveedoresesService.get(
    cleanGuid(supplierId)
  );

  const supplier = unwrapRecord<Cr22e_proveedoreses>(
    response,
    "No se pudo consultar el proveedor."
  );

  if (!supplier) {
    throw new Error("Proveedor no encontrado.");
  }

  return supplier;
}

export const supplierDirectoryService = {
  async getSuppliers(
    filters: SupplierDirectoryFilters
  ): Promise<SupplierListItem[]> {
    const suppliers = await loadDirectoryData();

    const filtered = applyFilters(suppliers, filters).sort((a, b) => {
      const dateA = new Date(
        a.modifiedOn || a.createdOn || 0
      ).getTime();

      const dateB = new Date(
        b.modifiedOn || b.createdOn || 0
      ).getTime();

      return dateB - dateA;
    });

    const hasActiveFilters =
      filters.search.trim() !== "" ||
      filters.status !== "todos" ||
      filters.serviceId !== "todos" ||
      filters.branchId !== "todos" ||
      filters.alertType !== "todos";

    return (
      hasActiveFilters ? filtered : filtered.slice(0, 20)
    ).map(toListItem);
  },

  async getSupplierDetail(
    supplierId: string
  ): Promise<SupplierDetail | null> {
    const suppliers = await loadDirectoryData();

    return (
      suppliers.find(
        (supplier) => supplier.id === cleanGuid(supplierId)
      ) || null
    );
  },

  async updateSupplierGeneralInfo(
    payload: SupplierGeneralUpdatePayload
  ): Promise<void> {
    const isActive = payload.status === "activo";

    const response = await Cr22e_proveedoresesService.update(
      cleanGuid(payload.supplierId),
      {
        cr22e_name: requiredText(
          payload.name,
          "El nombre comercial"
        ),
        cr22e_razonsocial: nullableText(payload.businessName),
        cr22e_rfc: nullableText(payload.rfc),
        cr22e_telefonogeneral: nullableText(payload.phone),
        cr22e_correogeneral: nullableText(payload.email),
        cr22e_sitioweb: nullableText(payload.website),
        cr22e_observaciones: nullableText(payload.notes),
        cr22e_activo: isActive,
        statecode: isActive ? 0 : 1,
        statuscode: isActive ? 1 : 2,
      } as never
    );

    ensureOperationSucceeded(
      response,
      "No se pudieron guardar los datos generales."
    );
  },

  async upsertSupplierContact(
    payload: SupplierContactPayload
  ): Promise<void> {
    const isActive = payload.active !== false;

    const commonFields = {
      cr22e_name: requiredText(
        payload.name,
        "El nombre del contacto"
      ),
      cr22e_puesto: nullableText(payload.role),
      cr22e_correo: nullableText(payload.email),
      cr22e_telefono: nullableText(payload.phone),
      cr22e_tipocontacto:
        mapContactTypeValue(payload.contactType) ?? null,
      cr22e_activo: isActive,
      statecode: isActive ? 0 : 1,
      statuscode: isActive ? 1 : 2,
    };

    if (payload.id) {
      const response =
        await Cr22e_contactosproveedorsService.update(
          cleanGuid(payload.id),
          commonFields as never
        );

      ensureOperationSucceeded(
        response,
        "No se pudo actualizar el contacto."
      );

      return;
    }

    const response =
      await Cr22e_contactosproveedorsService.create({
        ...commonFields,
        "cr22e_Proveedor@odata.bind":
          `/cr22e_proveedoreses(${cleanGuid(
            payload.supplierId
          )})`,
      } as never);

    ensureOperationSucceeded(
      response,
      "No se pudo crear el contacto."
    );
  },

  async upsertSupplierAssignment(
    payload: SupplierAssignmentPayload
  ): Promise<void> {
    const supplier = await getSupplierRecord(payload.supplierId);
    const serviceType = mapServiceTypeValue(payload.serviceId);
    const serviceStatus = mapAssignmentStatusValue(payload.status);
    const serviceName = TIPO_SERVICIO_LABELS[serviceType];

    const commonFields = {
      cr22e_name: `${supplier.cr22e_name} - ${serviceName}`,
      cr22e_tiposervicio: serviceType,
      cr22e_estadoservicio: serviceStatus,
      cr22e_observaciones: nullableText(payload.notes),
      cr22e_fechaultimaactualizacion: new Date().toISOString(),
      cr22e_activo: true,
      statecode: 0,
      statuscode: 1,
      "cr22e_Proveedor@odata.bind":
        `/cr22e_proveedoreses(${cleanGuid(
          payload.supplierId
        )})`,
      "cr22e_Sucursal@odata.bind":
        `/cr22e_sucursaleses(${cleanGuid(payload.branchId)})`,
    };

    if (payload.id) {
      const response =
        await Cr22e_serviciosproveedorsucursalsService.update(
          cleanGuid(payload.id),
          commonFields as never
        );

      ensureOperationSucceeded(
        response,
        "No se pudo actualizar la asignación."
      );

      return;
    }

    const response =
      await Cr22e_serviciosproveedorsucursalsService.create(
        commonFields as never
      );

    ensureOperationSucceeded(
      response,
      "No se pudo crear la asignación."
    );
  },

  async setSupplierStatus(
    supplierId: string,
    status: "activo" | "inactivo"
  ): Promise<void> {
    const isActive = status === "activo";

    const response = await Cr22e_proveedoresesService.update(
      cleanGuid(supplierId),
      {
        cr22e_activo: isActive,
        statecode: isActive ? 0 : 1,
        statuscode: isActive ? 1 : 2,
      } as never
    );

    ensureOperationSucceeded(
      response,
      "No se pudo actualizar el estado del proveedor."
    );
  },
};
