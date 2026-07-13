export type DataQualitySeverity = "critical" | "high" | "medium" | "low";

export type DataQualityCategory = "duplicate" | "missing" | "suspicious";

export type DataQualityScope = "global" | "sucursal";

export type DataQualityProblemType =
  | "duplicado"
  | "dato_faltante"
  | "valor_sospechoso"
  | "inconsistencia";

export type DataQualityField =
  | "direccion_ip"
  | "hostname"
  | "numero_serie"
  | "clave_anydesk"
  | "sucursal"
  | "departamento"
  | "ubicacion"
  | "responsable"
  | "estado"
  | "otro";

export type QualityEquipo = {
  id: string;
  hostname?: string;
  tipoEquipo?: string;
  marca?: string;
  modelo?: string;
  numeroSerie?: string;
  direccionIP?: string;
  claveAnyDesk?: string;
  responsable?: string;
  sucursalId?: string;
  sucursal?: string;
  departamento?: string;
  ubicacion?: string;
  ubicacionExacta?: string;
  estadoFuncionamiento?: string;
  condicionFisica?: string;
  observaciones?: string;
  activo?: boolean;
};

export type DataQualityAlert = {
  id: string;
  equipoId: string;
  hostname: string;
  sucursal: string;
  departamento: string;
  category: DataQualityCategory;
  severity: DataQualitySeverity;
  title: string;
  description: string;
  recommendation: string;
  points: number;

  /**
   * Clave estable para conectar con ExcepcionesCalidadDatos.
   * Esta clave será la que permita ignorar / no ignorar alertas.
   */
  alertKey: string;
  scope: DataQualityScope;
  problemType: DataQualityProblemType;
  field: DataQualityField;
  detectedValue?: string;
  affectedEquipmentIds?: string[];
  affectedEquipmentHostnames?: string[];
  sucursalId?: string;
  sucursalKey?: string;
};

export type BranchQualitySummary = {
  sucursal: string;
  score: number;
  statusLabel: string;
  totalEquipos: number;
  totalAlertas: number;
  duplicados: number;
  datosFaltantes: number;
  datosSospechosos: number;
  alertasCriticas: number;
  alertasAltas: number;
  alertasDetalle: DataQualityAlert[];

  /*
    Alias temporales para que DataQualityPage.tsx no truene mientras
    actualizamos archivo por archivo.
    En el siguiente paso actualizamos la página y ya dejamos de usarlos.
  */
  valoresSospechosos: number;
  inconsistencias: number;
  equiposCriticos: number;
};

export type DepartmentQualitySummary = {
  departamento: string;
  score: number;
  totalEquipos: number;
  totalAlertas: number;
};

export type DataQualityReport = {
  overallScore: number;
  statusLabel: string;
  totalEquipos: number;
  totalAlertas: number;
  resumen: {
    duplicados: number;
    datosFaltantes: number;
    datosSospechosos: number;
    alertasCriticas: number;
    alertasAltas: number;

    /*
      Alias temporales para compatibilidad con la página actual.
      En el siguiente archivo los quitamos visualmente.
    */
    valoresSospechosos: number;
    inconsistencias: number;
  };
  sucursales: BranchQualitySummary[];
  departamentos: DepartmentQualitySummary[];
  alertas: DataQualityAlert[];
  diagnostico: string;
};

const GENERIC_VALUES = new Set(
  [
    "n/a",
    "na",
    "no aplica",
    "pendiente",
    "pendiente de asignar",
    "por definir",
    "sin dato",
    "sin datos",
    "desconocido",
    "test",
    "prueba",
    "xxx",
    ".",
    "-",
    "--",
    "???",
    "s/n",
    "sin numero",
    "sin número",
    "sin serie",
    "no tiene",
  ].map(normalizeText)
);

const SEVERITY_WEIGHT: Record<DataQualitySeverity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

function normalizeText(value?: string): string {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[¿?¡!.,;:()[\]{}"'`´]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeForDuplicate(value?: string): string {
  return normalizeText(value).replace(/\s+/g, "");
}

function normalizeForAlertKey(value?: string): string {
  return normalizeForDuplicate(value) || "sin-valor";
}

function safeText(value?: string, fallback = "Sin dato"): string {
  return value?.trim() || fallback;
}

function getGroupName(value?: string, fallback = "Sin sucursal"): string {
  const cleanValue = value?.trim();
  return cleanValue || fallback;
}

function getSucursalName(equipo: QualityEquipo): string {
  return getGroupName(equipo.sucursal);
}

function getSucursalKey(equipo: QualityEquipo): string {
  const id = equipo.sucursalId?.trim();

  if (id) {
    return id;
  }

  return normalizeForDuplicate(equipo.sucursal) || "sin-sucursal";
}

function hasValidSucursal(equipo: QualityEquipo): boolean {
  const sucursal = normalizeText(equipo.sucursal);

  return Boolean(
    equipo.sucursalId?.trim() ||
      (sucursal &&
        sucursal !== "sin sucursal" &&
        sucursal !== "sin datos" &&
        sucursal !== "sin dato")
  );
}

function isActive(equipo: QualityEquipo): boolean {
  return equipo.activo === true;
}

function isGenericValue(value?: string): boolean {
  const normalized = normalizeText(value);
  return GENERIC_VALUES.has(normalized);
}

function isMissingValue(value?: string): boolean {
  return !value || !value.trim();
}

function isValidIPv4(value?: string): boolean {
  const cleanValue = value?.trim();

  if (!cleanValue) return false;

  const parts = cleanValue.split(".");

  if (parts.length !== 4) return false;

  return parts.every((part) => {
    if (!/^\d+$/.test(part)) return false;

    const number = Number(part);

    return number >= 0 && number <= 255;
  });
}

function isSuspiciousIPv4(value?: string): boolean {
  const cleanValue = value?.trim();

  return (
    cleanValue === "0.0.0.0" ||
    cleanValue === "127.0.0.1" ||
    cleanValue === "255.255.255.255"
  );
}

function getStatusLabel(score: number): string {
  if (score >= 90) return "Excelente";
  if (score >= 75) return "Buena";
  if (score >= 60) return "Requiere revisión";
  return "Crítica";
}

function average(values: number[]): number {
  if (values.length === 0) return 100;

  const total = values.reduce((sum, value) => sum + value, 0);

  return Math.round(total / values.length);
}

function createAlert(params: {
  equipo: QualityEquipo;
  category: DataQualityCategory;
  severity: DataQualitySeverity;
  title: string;
  description: string;
  recommendation: string;
  points: number;
  suffix: string;
  alertKey: string;
  scope: DataQualityScope;
  problemType: DataQualityProblemType;
  field: DataQualityField;
  detectedValue?: string;
  affectedEquipmentIds?: string[];
  affectedEquipmentHostnames?: string[];
  sucursalKey?: string;
}): DataQualityAlert {
  return {
    id: `${params.equipo.id}-${params.suffix}`,
    equipoId: params.equipo.id,
    hostname: safeText(params.equipo.hostname),
    sucursal: getGroupName(params.equipo.sucursal),
    departamento: getGroupName(params.equipo.departamento, "Sin departamento"),
    category: params.category,
    severity: params.severity,
    title: params.title,
    description: params.description,
    recommendation: params.recommendation,
    points: params.points,
    alertKey: params.alertKey,
    scope: params.scope,
    problemType: params.problemType,
    field: params.field,
    detectedValue: params.detectedValue,
    affectedEquipmentIds: params.affectedEquipmentIds,
    affectedEquipmentHostnames: params.affectedEquipmentHostnames,
    sucursalId: params.equipo.sucursalId,
    sucursalKey: params.sucursalKey,
  };
}

function getDuplicateAlerts(
  equipos: QualityEquipo[],
  options: {
    fieldName: "hostname" | "numeroSerie" | "direccionIP" | "claveAnyDesk";
    field: DataQualityField;
    alertKeyPrefix: string;
    title: string;
    severity: DataQualitySeverity;
    points: number;
    recommendation: string;
    scope: DataQualityScope;
    onlyActive?: boolean;
  }
): DataQualityAlert[] {
  const map = new Map<
    string,
    {
      displayValue: string;
      duplicatedValue: string;
      sucursalKey?: string;
      sucursalName?: string;
      equipos: QualityEquipo[];
    }
  >();

  equipos.forEach((equipo) => {
    if (options.onlyActive && !isActive(equipo)) {
      return;
    }

    if (options.scope === "sucursal" && !hasValidSucursal(equipo)) {
      return;
    }

    const rawValue = equipo[options.fieldName];
    const normalizedValue = normalizeForDuplicate(rawValue);

    if (!normalizedValue || isGenericValue(rawValue)) {
      return;
    }

    if (options.fieldName === "direccionIP") {
      if (!isValidIPv4(rawValue) || isSuspiciousIPv4(rawValue)) {
        return;
      }
    }

    const sucursalKey =
      options.scope === "sucursal" ? getSucursalKey(equipo) : undefined;

    const mapKey =
      options.scope === "sucursal"
        ? `${sucursalKey}|${normalizedValue}`
        : normalizedValue;

    if (!map.has(mapKey)) {
      map.set(mapKey, {
        displayValue: safeText(rawValue),
        duplicatedValue: normalizedValue,
        sucursalKey,
        sucursalName: getSucursalName(equipo),
        equipos: [],
      });
    }

    map.get(mapKey)?.equipos.push(equipo);
  });

  const alerts: DataQualityAlert[] = [];

  map.forEach((group) => {
    if (group.equipos.length <= 1) return;

    const affectedEquipmentIds = group.equipos.map((equipo) => equipo.id);
    const affectedEquipmentHostnames = group.equipos.map((equipo) =>
      safeText(equipo.hostname)
    );

    const alertKey =
      options.scope === "sucursal"
        ? `${options.alertKeyPrefix}|sucursal:${group.sucursalKey}|${group.duplicatedValue}`
        : `${options.alertKeyPrefix}|global|${group.duplicatedValue}`;

    group.equipos.forEach((equipo) => {
      const description =
        options.scope === "sucursal"
          ? `El valor "${group.displayValue}" aparece en ${group.equipos.length} registros dentro de ${group.sucursalName}.`
          : `El valor "${group.displayValue}" aparece en ${group.equipos.length} registros del inventario.`;

      alerts.push(
        createAlert({
          equipo,
          category: "duplicate",
          severity: options.severity,
          title: options.title,
          description,
          recommendation: options.recommendation,
          points: options.points,
          suffix: `duplicate-${options.fieldName}-${group.duplicatedValue}`,
          alertKey,
          scope: options.scope,
          problemType: "duplicado",
          field: options.field,
          detectedValue: group.displayValue,
          affectedEquipmentIds,
          affectedEquipmentHostnames,
          sucursalKey: group.sucursalKey,
        })
      );
    });
  });

  return alerts;
}

function getMissingValueAlerts(equipos: QualityEquipo[]): DataQualityAlert[] {
  const requiredFields: Array<{
    id: string;
    label: string;
    severity: DataQualitySeverity;
    points: number;
    field: DataQualityField;
    getValue: (equipo: QualityEquipo) => string | undefined;
  }> = [
    {
      id: "tipoEquipo",
      label: "Tipo de equipo",
      severity: "high",
      points: 18,
      field: "otro",
      getValue: (equipo) => equipo.tipoEquipo,
    },
    {
      id: "marca",
      label: "Marca",
      severity: "high",
      points: 18,
      field: "otro",
      getValue: (equipo) => equipo.marca,
    },
    {
      id: "numeroSerie",
      label: "Número de serie",
      severity: "critical",
      points: 30,
      field: "numero_serie",
      getValue: (equipo) => equipo.numeroSerie,
    },
    {
      id: "hostname",
      label: "Hostname",
      severity: "critical",
      points: 30,
      field: "hostname",
      getValue: (equipo) => equipo.hostname,
    },
    {
      id: "direccionIP",
      label: "Dirección IP",
      severity: "high",
      points: 20,
      field: "direccion_ip",
      getValue: (equipo) => equipo.direccionIP,
    },
    {
      id: "sucursal",
      label: "Sucursal",
      severity: "high",
      points: 20,
      field: "sucursal",
      getValue: (equipo) => equipo.sucursal,
    },
    {
      id: "departamento",
      label: "Departamento",
      severity: "high",
      points: 20,
      field: "departamento",
      getValue: (equipo) => equipo.departamento,
    },
    {
      id: "ubicacionExacta",
      label: "Ubicación exacta",
      severity: "high",
      points: 18,
      field: "ubicacion",
      getValue: (equipo) => equipo.ubicacionExacta || equipo.ubicacion,
    },
  ];

  const alerts: DataQualityAlert[] = [];

  equipos.forEach((equipo) => {
    requiredFields.forEach((field) => {
      const value = field.getValue(equipo);

      if (!isMissingValue(value)) {
        return;
      }

      const alertKey = `missing-${field.id}|equipo:${equipo.id}`;

      alerts.push(
        createAlert({
          equipo,
          category: "missing",
          severity: field.severity,
          title: "Dato obligatorio faltante",
          description: `${field.label} no tiene información registrada.`,
          recommendation:
            "Revisar el registro. CoreForms valida este dato al capturar, por lo que podría tratarse de un registro antiguo, editado o importado.",
          points: field.points,
          suffix: `missing-${field.id}`,
          alertKey,
          scope: "global",
          problemType: "dato_faltante",
          field: field.field,
          detectedValue: field.label,
          affectedEquipmentIds: [equipo.id],
          affectedEquipmentHostnames: [safeText(equipo.hostname)],
        })
      );
    });
  });

  return alerts;
}

function getSuspiciousValueAlerts(equipos: QualityEquipo[]): DataQualityAlert[] {
  const genericFields: Array<{
    fieldName: keyof QualityEquipo;
    label: string;
    severity: DataQualitySeverity;
    points: number;
    field: DataQualityField;
  }> = [
    {
      fieldName: "hostname",
      label: "Hostname",
      severity: "high",
      points: 20,
      field: "hostname",
    },
    {
      fieldName: "numeroSerie",
      label: "Número de serie",
      severity: "high",
      points: 20,
      field: "numero_serie",
    },
    {
      fieldName: "marca",
      label: "Marca",
      severity: "medium",
      points: 12,
      field: "otro",
    },
    {
      fieldName: "modelo",
      label: "Modelo",
      severity: "medium",
      points: 12,
      field: "otro",
    },
    {
      fieldName: "direccionIP",
      label: "Dirección IP",
      severity: "high",
      points: 18,
      field: "direccion_ip",
    },
    {
      fieldName: "responsable",
      label: "Responsable",
      severity: "medium",
      points: 10,
      field: "responsable",
    },
    {
      fieldName: "ubicacionExacta",
      label: "Ubicación exacta",
      severity: "medium",
      points: 12,
      field: "ubicacion",
    },
    {
      fieldName: "ubicacion",
      label: "Ubicación",
      severity: "medium",
      points: 12,
      field: "ubicacion",
    },
  ];

  const alerts: DataQualityAlert[] = [];

  equipos.forEach((equipo) => {
    genericFields.forEach((field) => {
      const value = equipo[field.fieldName];

      if (typeof value !== "string" || !isGenericValue(value)) {
        return;
      }

      const alertKey = `suspicious-generic-${String(
        field.fieldName
      )}|equipo:${equipo.id}|${normalizeForAlertKey(value)}`;

      alerts.push(
        createAlert({
          equipo,
          category: "suspicious",
          severity: field.severity,
          title: "Dato sospechoso",
          description: `${field.label} contiene el valor "${value}".`,
          recommendation:
            "Validar si el dato representa información real o fue usado para saltar una validación.",
          points: field.points,
          suffix: `suspicious-generic-${String(field.fieldName)}`,
          alertKey,
          scope: "global",
          problemType: "valor_sospechoso",
          field: field.field,
          detectedValue: value,
          affectedEquipmentIds: [equipo.id],
          affectedEquipmentHostnames: [safeText(equipo.hostname)],
        })
      );
    });

    const hostname = normalizeText(equipo.hostname);
    const numeroSerie = normalizeText(equipo.numeroSerie);

    if (hostname && hostname.length <= 2) {
      alerts.push(
        createAlert({
          equipo,
          category: "suspicious",
          severity: "medium",
          title: "Hostname sospechoso",
          description:
            "El hostname es demasiado corto para considerarse confiable.",
          recommendation:
            "Validar si el hostname corresponde al estándar real de nomenclatura.",
          points: 10,
          suffix: "suspicious-short-hostname",
          alertKey: `suspicious-short-hostname|equipo:${equipo.id}`,
          scope: "global",
          problemType: "valor_sospechoso",
          field: "hostname",
          detectedValue: safeText(equipo.hostname),
          affectedEquipmentIds: [equipo.id],
          affectedEquipmentHostnames: [safeText(equipo.hostname)],
        })
      );
    }

    if (numeroSerie && numeroSerie.length <= 4) {
      alerts.push(
        createAlert({
          equipo,
          category: "suspicious",
          severity: "medium",
          title: "Número de serie sospechoso",
          description:
            "El número de serie es demasiado corto para considerarse confiable.",
          recommendation: "Validar el número de serie físico del equipo.",
          points: 10,
          suffix: "suspicious-short-serial",
          alertKey: `suspicious-short-serial|equipo:${equipo.id}`,
          scope: "global",
          problemType: "valor_sospechoso",
          field: "numero_serie",
          detectedValue: safeText(equipo.numeroSerie),
          affectedEquipmentIds: [equipo.id],
          affectedEquipmentHostnames: [safeText(equipo.hostname)],
        })
      );
    }

    if (
      equipo.direccionIP &&
      !isGenericValue(equipo.direccionIP) &&
      !isValidIPv4(equipo.direccionIP)
    ) {
      alerts.push(
        createAlert({
          equipo,
          category: "suspicious",
          severity: "high",
          title: "Dirección IP con formato sospechoso",
          description:
            "La dirección IP no cumple con el formato IPv4 esperado.",
          recommendation:
            "Validar la IP. CoreForms ya valida IPv4, así que podría ser un registro antiguo, editado o importado.",
          points: 18,
          suffix: "suspicious-invalid-ip",
          alertKey: `suspicious-invalid-ip|equipo:${equipo.id}`,
          scope: "global",
          problemType: "valor_sospechoso",
          field: "direccion_ip",
          detectedValue: safeText(equipo.direccionIP),
          affectedEquipmentIds: [equipo.id],
          affectedEquipmentHostnames: [safeText(equipo.hostname)],
        })
      );
    }

    if (
      equipo.direccionIP &&
      isValidIPv4(equipo.direccionIP) &&
      isSuspiciousIPv4(equipo.direccionIP)
    ) {
      alerts.push(
        createAlert({
          equipo,
          category: "suspicious",
          severity: "medium",
          title: "Dirección IP poco confiable",
          description: `La IP "${equipo.direccionIP}" puede ser un valor de prueba o no operativo.`,
          recommendation:
            "Validar si la IP corresponde realmente al equipo dentro de la red.",
          points: 12,
          suffix: "suspicious-placeholder-ip",
          alertKey: `suspicious-placeholder-ip|equipo:${equipo.id}|${normalizeForAlertKey(
            equipo.direccionIP
          )}`,
          scope: "global",
          problemType: "valor_sospechoso",
          field: "direccion_ip",
          detectedValue: equipo.direccionIP,
          affectedEquipmentIds: [equipo.id],
          affectedEquipmentHostnames: [safeText(equipo.hostname)],
        })
      );
    }
  });

  return alerts;
}

function calculateEquipmentScore(
  equipo: QualityEquipo,
  alertas: DataQualityAlert[]
): number {
  const alertsForEquipo = alertas.filter(
    (alerta) => alerta.equipoId === equipo.id
  );

  const penalty = alertsForEquipo.reduce(
    (sum, alerta) => sum + alerta.points,
    0
  );

  return Math.max(0, 100 - Math.min(penalty, 100));
}

function countByCategory(
  alertas: DataQualityAlert[],
  category: DataQualityCategory
): number {
  return alertas.filter((alerta) => alerta.category === category).length;
}

function countBySeverity(
  alertas: DataQualityAlert[],
  severity: DataQualitySeverity
): number {
  return alertas.filter((alerta) => alerta.severity === severity).length;
}

function sortAlertsByPriority(alertas: DataQualityAlert[]): DataQualityAlert[] {
  return [...alertas].sort((a, b) => {
    return (
      SEVERITY_WEIGHT[b.severity] - SEVERITY_WEIGHT[a.severity] ||
      b.points - a.points ||
      a.hostname.localeCompare(b.hostname)
    );
  });
}

function buildBranchSummaries(
  equipos: QualityEquipo[],
  alertas: DataQualityAlert[]
): BranchQualitySummary[] {
  const sucursales = Array.from(
    new Set(equipos.map((equipo) => getGroupName(equipo.sucursal)))
  );

  return sucursales
    .map((sucursal) => {
      const equiposSucursal = equipos.filter(
        (equipo) => getGroupName(equipo.sucursal) === sucursal
      );

      const alertasSucursal = alertas.filter(
        (alerta) => alerta.sucursal === sucursal
      );

      const scores = equiposSucursal.map((equipo) =>
        calculateEquipmentScore(equipo, alertas)
      );

      const score = average(scores);

      const duplicados = countByCategory(alertasSucursal, "duplicate");
      const datosFaltantes = countByCategory(alertasSucursal, "missing");
      const datosSospechosos = countByCategory(alertasSucursal, "suspicious");
      const alertasCriticas = countBySeverity(alertasSucursal, "critical");
      const alertasAltas = countBySeverity(alertasSucursal, "high");

      return {
        sucursal,
        score,
        statusLabel: getStatusLabel(score),
        totalEquipos: equiposSucursal.length,
        totalAlertas: alertasSucursal.length,
        duplicados,
        datosFaltantes,
        datosSospechosos,
        alertasCriticas,
        alertasAltas,
        alertasDetalle: sortAlertsByPriority(alertasSucursal),

        /*
          Alias temporales para la DataQualityPage actual.
          No representan inconsistencias operativas; solo evitan romper mientras
          actualizamos la UI en el siguiente paso.
        */
        valoresSospechosos: datosSospechosos,
        inconsistencias: 0,
        equiposCriticos: 0,
      };
    })
    .sort((a, b) => b.score - a.score || b.totalEquipos - a.totalEquipos);
}

function buildDepartmentSummaries(
  equipos: QualityEquipo[],
  alertas: DataQualityAlert[]
): DepartmentQualitySummary[] {
  const departamentos = Array.from(
    new Set(
      equipos.map((equipo) =>
        getGroupName(equipo.departamento, "Sin departamento")
      )
    )
  );

  return departamentos
    .map((departamento) => {
      const equiposDepartamento = equipos.filter(
        (equipo) =>
          getGroupName(equipo.departamento, "Sin departamento") === departamento
      );

      const alertasDepartamento = alertas.filter(
        (alerta) => alerta.departamento === departamento
      );

      const scores = equiposDepartamento.map((equipo) =>
        calculateEquipmentScore(equipo, alertas)
      );

      return {
        departamento,
        score: average(scores),
        totalEquipos: equiposDepartamento.length,
        totalAlertas: alertasDepartamento.length,
      };
    })
    .sort((a, b) => b.score - a.score || b.totalEquipos - a.totalEquipos);
}

function buildDiagnostic(report: {
  totalAlertas: number;
  duplicados: number;
  datosFaltantes: number;
  datosSospechosos: number;
}): string {
  if (report.totalAlertas === 0) {
    return "No se detectaron alertas de calidad. El inventario se ve confiable con las reglas actuales.";
  }

  const priorities = [
    { label: "duplicados", total: report.duplicados },
    { label: "datos faltantes", total: report.datosFaltantes },
    { label: "datos sospechosos", total: report.datosSospechosos },
  ].sort((a, b) => b.total - a.total);

  const mainPriority = priorities[0];

  return `Se detectaron ${report.totalAlertas} alertas de calidad. La prioridad principal es revisar ${mainPriority.label}, con ${mainPriority.total} alertas detectadas.`;
}

export function evaluateDataQuality(
  equipos: QualityEquipo[]
): DataQualityReport {
  const duplicateAlerts = [
    ...getDuplicateAlerts(equipos, {
      fieldName: "hostname",
      field: "hostname",
      alertKeyPrefix: "duplicate-hostname",
      title: "Hostname duplicado en la misma sucursal",
      severity: "critical",
      points: 35,
      recommendation:
        "Validar físicamente los equipos y corregir el hostname duplicado dentro de la sucursal.",
      scope: "sucursal",
    }),
    ...getDuplicateAlerts(equipos, {
      fieldName: "numeroSerie",
      field: "numero_serie",
      alertKeyPrefix: "duplicate-serial",
      title: "Número de serie duplicado",
      severity: "critical",
      points: 35,
      recommendation:
        "Confirmar el número de serie físico. Dos equipos no deberían compartir la misma serie.",
      scope: "global",
    }),
    ...getDuplicateAlerts(equipos, {
      fieldName: "direccionIP",
      field: "direccion_ip",
      alertKeyPrefix: "duplicate-ip",
      title: "Dirección IP duplicada en la misma sucursal",
      severity: "high",
      points: 25,
      recommendation:
        "Verificar la asignación de red. Dos equipos activos no deberían compartir la misma IP dentro de la misma sucursal.",
      scope: "sucursal",
      onlyActive: true,
    }),
    ...getDuplicateAlerts(equipos, {
      fieldName: "claveAnyDesk",
      field: "clave_anydesk",
      alertKeyPrefix: "duplicate-anydesk",
      title: "Clave AnyDesk duplicada en la misma sucursal",
      severity: "high",
      points: 25,
      recommendation:
        "Validar la clave AnyDesk. Dos equipos no deberían compartir la misma clave dentro de la misma sucursal.",
      scope: "sucursal",
      onlyActive: true,
    }),
  ];

  const missingValueAlerts = getMissingValueAlerts(equipos);
  const suspiciousValueAlerts = getSuspiciousValueAlerts(equipos);

  const alertas = sortAlertsByPriority([
    ...duplicateAlerts,
    ...missingValueAlerts,
    ...suspiciousValueAlerts,
  ]);

  const scores = equipos.map((equipo) =>
    calculateEquipmentScore(equipo, alertas)
  );

  const overallScore = average(scores);

  const duplicados = countByCategory(alertas, "duplicate");
  const datosFaltantes = countByCategory(alertas, "missing");
  const datosSospechosos = countByCategory(alertas, "suspicious");

  const totalAlertas = alertas.length;

  return {
    overallScore,
    statusLabel: getStatusLabel(overallScore),
    totalEquipos: equipos.length,
    totalAlertas,
    resumen: {
      duplicados,
      datosFaltantes,
      datosSospechosos,
      alertasCriticas: countBySeverity(alertas, "critical"),
      alertasAltas: countBySeverity(alertas, "high"),

      /*
        Alias temporales para que la página actual no truene.
        Visualmente los corregimos en el siguiente paso.
      */
      valoresSospechosos: datosSospechosos,
      inconsistencias: 0,
    },
    sucursales: buildBranchSummaries(equipos, alertas),
    departamentos: buildDepartmentSummaries(equipos, alertas),
    alertas,
    diagnostico: buildDiagnostic({
      totalAlertas,
      duplicados,
      datosFaltantes,
      datosSospechosos,
    }),
  };
}