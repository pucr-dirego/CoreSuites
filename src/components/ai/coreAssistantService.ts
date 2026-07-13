import type { AssistantEquipo } from "./coreAssistantTypes";

type CountGroup = {
  name: string;
  total: number;
};

type ScopeInfo = {
  equipos: AssistantEquipo[];
  label: string;
};

const READ_ONLY_MESSAGE =
  "No puedo modificar información desde el asistente. Trabajo en modo solo lectura. Para realizar cambios, usa la pantalla correspondiente de CoreInventory. Puedo ayudarte a revisar la información antes de que hagas el cambio.";

const SENSITIVE_MESSAGE =
  "No puedo mostrar información sensible desde el asistente. Puedo ayudarte con análisis del inventario, estados, sucursales, departamentos y datos generales, pero no con claves o accesos.";

const MODIFY_PATTERNS = [
  "modifica",
  "modificar",
  "actualiza",
  "actualizar",
  "cambia",
  "cambiar",
  "edita",
  "editar",
  "elimina",
  "eliminar",
  "borra",
  "borrar",
  "da de baja",
  "dar de baja",
  "dar baja",
  "baja este",
  "restaura",
  "restaurar",
  "crea",
  "crear",
  "agrega",
  "agregar",
  "guarda",
  "guardar",
  "asigna",
  "asignar",
  "corrige",
  "corregir",
];

const SENSITIVE_PATTERNS = [
  "anydesk",
  "clave",
  "claves",
  "password",
  "contrasena",
  "contraseña",
  "token",
  "acceso",
  "credencial",
  "credenciales",
];

const TERMS = {
  count: ["cuanto", "cuantos", "cuanta", "cuantas", "total", "cantidad", "numero", "conteo", "hay"],
  active: ["activo", "activos", "operativo", "operativos", "funcionando", "disponible", "disponibles", "en uso"],
  inactive: ["inactivo", "inactivos", "baja", "bajas", "desactivado", "desactivados", "dado de baja", "dados de baja"],
  critical: [
    "critico",
    "criticos",
    "malo",
    "malos",
    "disfuncional",
    "disfuncionales",
    "fallando",
    "danado",
    "dañado",
    "descompuesto",
    "descompuestos",
    "grave",
    "graves",
    "urgente",
    "urgentes",
  ],
  good: ["bueno", "buenos", "excelente", "excelentes", "bien", "sanos", "saludables"],
  regular: ["regular", "regulares", "preventivo", "preventivos"],
  branch: ["sucursal", "sucursales", "plaza", "plazas", "ubicacion", "ubicaciones", "sede", "sedes"],
  department: ["departamento", "departamentos", "area", "areas"],
  top: ["mas", "mayor", "top", "ranking", "principal", "predomina", "predominan"],
  summary: ["resumen", "general", "panorama", "diagnostico", "diagnóstico", "estatus", "estado general", "situacion", "situación"],
  incomplete: [
    "incompleto",
    "incompletos",
    "faltante",
    "faltantes",
    "faltan",
    "sin dato",
    "sin datos",
    "vacio",
    "vacios",
    "vacío",
    "vacíos",
  ],
  priority: ["prioridad", "prioridades", "riesgo", "riesgos", "revisar", "revision", "revisión", "atencion", "atención", "urgencia"],
  type: ["tipo", "tipos", "laptop", "laptops", "pc", "pcs", "escritorio"],
  brand: ["marca", "marcas", "fabricante", "fabricantes"],
  help: ["ayuda", "ayudame", "ayúdame", "que puedes hacer", "qué puedes hacer", "opciones", "comandos"],
};

export const quickQuestions = [
  {
    id: "resumen",
    label: "Resumen general",
    question: "Dame un resumen general del inventario.",
  },
  {
    id: "activos",
    label: "Equipos activos",
    question: "¿Cuántos equipos activos hay?",
  },
  {
    id: "inactivos",
    label: "Equipos inactivos",
    question: "¿Cuántos equipos inactivos hay?",
  },
  {
    id: "criticos",
    label: "Equipos críticos",
    question: "¿Cuántos equipos malos o disfuncionales hay?",
  },
  {
    id: "prioridad",
    label: "Prioridad de revisión",
    question: "¿Qué equipos requieren revisión prioritaria?",
  },
  {
    id: "sucursal-mas",
    label: "Sucursal con más equipos",
    question: "¿Cuál es la sucursal con más equipos?",
  },
  {
    id: "departamento-mas",
    label: "Departamento con más equipos",
    question: "¿Cuál es el departamento con más equipos?",
  },
  {
    id: "incompletos",
    label: "Datos incompletos",
    question: "¿Qué equipos tienen información incompleta?",
  },
];

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[¿?¡!.,;:()[\]{}"'`´]/g, " ")
    .replace(/[-_/\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getTokens(value: string): string[] {
  return normalizeText(value)
    .split(" ")
    .map((token) => token.trim())
    .filter(Boolean);
}

function containsTerm(text: string, terms: string[]): boolean {
  const normalized = normalizeText(text);
  const tokens = getTokens(normalized);

  return terms.some((term) => {
    const normalizedTerm = normalizeText(term);

    if (!normalizedTerm) return false;

    if (normalizedTerm.includes(" ")) {
      return normalized.includes(normalizedTerm);
    }

    return tokens.includes(normalizedTerm);
  });
}

function safeText(value?: string): string {
  return value?.trim() || "Sin dato";
}

function isPlaceholder(value?: string): boolean {
  const normalized = normalizeText(value || "");

  return (
    !normalized ||
    normalized === "sin dato" ||
    normalized === "sin datos" ||
    normalized.startsWith("sin ")
  );
}

function isActive(equipo: AssistantEquipo): boolean {
  return equipo.activo === true;
}

function isInactive(equipo: AssistantEquipo): boolean {
  return equipo.activo === false;
}

function getEstado(equipo: AssistantEquipo): string {
  return normalizeText(equipo.estadoFuncionamiento || "");
}

function isBad(equipo: AssistantEquipo): boolean {
  return getEstado(equipo) === "malo";
}

function isDisfunctional(equipo: AssistantEquipo): boolean {
  return getEstado(equipo) === "disfuncional";
}

function isCritical(equipo: AssistantEquipo): boolean {
  return isBad(equipo) || isDisfunctional(equipo);
}

function isGood(equipo: AssistantEquipo): boolean {
  const estado = getEstado(equipo);
  return estado === "excelente" || estado === "bueno";
}

function isRegular(equipo: AssistantEquipo): boolean {
  return getEstado(equipo) === "regular";
}

function isExcellent(equipo: AssistantEquipo): boolean {
  return getEstado(equipo) === "excelente";
}

function groupCountBy(
  equipos: AssistantEquipo[],
  getKey: (equipo: AssistantEquipo) => string | undefined
): CountGroup[] {
  const map = new Map<string, number>();

  equipos.forEach((equipo) => {
    const rawKey = getKey(equipo);
    const key = isPlaceholder(rawKey) ? "Sin dato" : safeText(rawKey);
    map.set(key, (map.get(key) || 0) + 1);
  });

  return Array.from(map.entries())
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
}

function formatTopList(items: CountGroup[], limit = 5): string {
  if (items.length === 0) return "Sin datos suficientes.";

  return items
    .slice(0, limit)
    .map((item, index) => `${index + 1}. ${item.name}: ${item.total}`)
    .join("\n");
}

function getUniqueValues(
  equipos: AssistantEquipo[],
  getValue: (equipo: AssistantEquipo) => string | undefined
): string[] {
  return Array.from(
    new Set(
      equipos
        .map(getValue)
        .filter((value): value is string => Boolean(value && !isPlaceholder(value)))
    )
  ).sort((a, b) => b.length - a.length);
}

function findMentionedValue(question: string, values: string[]): string | null {
  const q = normalizeText(question);
  const qTokens = getTokens(q);

  let bestMatch: string | null = null;
  let bestScore = 0;

  values.forEach((value) => {
    const normalizedValue = normalizeText(value);
    const valueTokens = getTokens(value).filter((token) => token.length >= 3);

    if (!normalizedValue || valueTokens.length === 0) return;

    let score = 0;

    if (q.includes(normalizedValue)) {
      score = normalizedValue.length + 30;
    } else {
      const matchedTokens = valueTokens.filter((token) => qTokens.includes(token));

      if (matchedTokens.length === valueTokens.length) {
        score = matchedTokens.join("").length + 20;
      } else if (matchedTokens.length > 0 && valueTokens.length === 1) {
        score = matchedTokens[0].length + 10;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = value;
    }
  });

  return bestMatch;
}

function getScope(question: string, equipos: AssistantEquipo[]): ScopeInfo {
  const sucursales = getUniqueValues(equipos, (equipo) => equipo.sucursal);
  const departamentos = getUniqueValues(equipos, (equipo) => equipo.departamento);
  const marcas = getUniqueValues(equipos, (equipo) => equipo.marca);

  const mentionedSucursal = findMentionedValue(question, sucursales);
  const mentionedDepartamento = findMentionedValue(question, departamentos);
  const mentionedMarca = findMentionedValue(question, marcas);

  let scopedEquipos = [...equipos];
  const labels: string[] = [];

  if (mentionedSucursal) {
    scopedEquipos = scopedEquipos.filter(
      (equipo) => normalizeText(equipo.sucursal || "") === normalizeText(mentionedSucursal)
    );
    labels.push(`sucursal ${mentionedSucursal}`);
  }

  if (mentionedDepartamento) {
    scopedEquipos = scopedEquipos.filter(
      (equipo) =>
        normalizeText(equipo.departamento || "") === normalizeText(mentionedDepartamento)
    );
    labels.push(`departamento ${mentionedDepartamento}`);
  }

  if (mentionedMarca) {
    scopedEquipos = scopedEquipos.filter(
      (equipo) => normalizeText(equipo.marca || "") === normalizeText(mentionedMarca)
    );
    labels.push(`marca ${mentionedMarca}`);
  }

  if (containsTerm(question, ["laptop", "laptops"])) {
    scopedEquipos = scopedEquipos.filter((equipo) =>
      normalizeText(equipo.tipoEquipo || "").includes("laptop")
    );
    labels.push("tipo Laptop");
  }

  if (containsTerm(question, ["pc", "pcs", "escritorio"])) {
    scopedEquipos = scopedEquipos.filter((equipo) =>
      normalizeText(equipo.tipoEquipo || "").includes("escritorio")
    );
    labels.push("tipo PC de Escritorio");
  }

  return {
    equipos: scopedEquipos,
    label: labels.length > 0 ? ` para ${labels.join(", ")}` : "",
  };
}

function getIncompleteFields(equipo: AssistantEquipo): string[] {
  const missing: string[] = [];

  if (isPlaceholder(equipo.hostname)) missing.push("hostname");
  if (isPlaceholder(equipo.numeroSerie)) missing.push("número de serie");
  if (isPlaceholder(equipo.responsable)) missing.push("responsable");
  if (isPlaceholder(equipo.sucursal)) missing.push("sucursal");
  if (isPlaceholder(equipo.departamento)) missing.push("departamento");
  if (isPlaceholder(equipo.estadoFuncionamiento)) missing.push("estado de funcionamiento");
  if (isPlaceholder(equipo.marca)) missing.push("marca");
  if (isPlaceholder(equipo.modelo)) missing.push("modelo");

  return missing;
}

function buildCountAnswer(
  title: string,
  total: number,
  scopeLabel: string,
  criterion: string
): string {
  return `${title}${scopeLabel}: ${total}.\n\nCriterio usado: ${criterion}.`;
}

function buildStatusDistribution(equipos: AssistantEquipo[], scopeLabel = ""): string {
  const excelente = equipos.filter((equipo) => isActive(equipo) && isExcellent(equipo)).length;
  const bueno = equipos.filter(
    (equipo) => isActive(equipo) && getEstado(equipo) === "bueno"
  ).length;
  const regular = equipos.filter((equipo) => isActive(equipo) && isRegular(equipo)).length;
  const malo = equipos.filter((equipo) => isActive(equipo) && isBad(equipo)).length;
  const disfuncional = equipos.filter(
    (equipo) => isActive(equipo) && isDisfunctional(equipo)
  ).length;

  return [
    `Distribución por estado${scopeLabel}:`,
    "",
    `- Excelente: ${excelente}`,
    `- Bueno: ${bueno}`,
    `- Regular: ${regular}`,
    `- Malo: ${malo}`,
    `- Disfuncional: ${disfuncional}`,
    "",
    malo + disfuncional > 0
      ? `Punto de atención: hay ${malo + disfuncional} equipos activos críticos.`
      : "Punto de atención: no encontré equipos activos críticos en este alcance.",
  ].join("\n");
}

function buildCriticalList(equipos: AssistantEquipo[], scopeLabel = ""): string {
  const critical = equipos.filter((equipo) => isActive(equipo) && isCritical(equipo));

  if (critical.length === 0) {
    return `No encontré equipos activos críticos${scopeLabel}.`;
  }

  const list = critical
    .slice(0, 8)
    .map((equipo, index) => {
      return `${index + 1}. ${safeText(equipo.hostname)} — ${safeText(
        equipo.sucursal
      )} / ${safeText(equipo.departamento)} — Estado: ${safeText(
        equipo.estadoFuncionamiento
      )}`;
    })
    .join("\n");

  const extra =
    critical.length > 8
      ? `\n\nMostré los primeros 8 de ${critical.length} equipos críticos encontrados.`
      : "";

  return `Encontré ${critical.length} equipos activos críticos${scopeLabel}.\n\n${list}${extra}`;
}

function buildPriorityList(equipos: AssistantEquipo[], scopeLabel = ""): string {
  const prioritized = equipos
    .filter((equipo) => isActive(equipo))
    .map((equipo) => {
      let score = 0;
      const reasons: string[] = [];

      if (isDisfunctional(equipo)) {
        score += 100;
        reasons.push("estado Disfuncional");
      }

      if (isBad(equipo)) {
        score += 80;
        reasons.push("estado Malo");
      }

      if (isRegular(equipo)) {
        score += 30;
        reasons.push("estado Regular");
      }

      if (!isPlaceholder(equipo.observaciones) && normalizeText(equipo.observaciones || "") !== "sin observaciones") {
        score += 15;
        reasons.push("tiene observaciones");
      }

      const missing = getIncompleteFields(equipo);

      if (missing.length > 0) {
        score += Math.min(missing.length * 4, 20);
        reasons.push("datos incompletos");
      }

      return {
        equipo,
        score,
        reasons,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (prioritized.length === 0) {
    return `No encontré equipos que requieran revisión prioritaria${scopeLabel}.`;
  }

  const list = prioritized
    .slice(0, 8)
    .map((item, index) => {
      return `${index + 1}. ${safeText(item.equipo.hostname)} — ${safeText(
        item.equipo.sucursal
      )} / ${safeText(item.equipo.departamento)} — ${item.reasons.join(", ")}`;
    })
    .join("\n");

  return [
    `Prioridad de revisión${scopeLabel}:`,
    "",
    list,
    "",
    "Criterio usado: primero equipos activos Disfuncionales, luego Malos, después Regulares, observaciones y datos incompletos.",
  ].join("\n");
}

function buildGeneralSummary(equipos: AssistantEquipo[], scopeLabel = ""): string {
  const total = equipos.length;
  const active = equipos.filter(isActive).length;
  const inactive = equipos.filter(isInactive).length;
  const critical = equipos.filter((e) => isActive(e) && isCritical(e)).length;
  const good = equipos.filter((e) => isActive(e) && isGood(e)).length;
  const regular = equipos.filter((e) => isActive(e) && isRegular(e)).length;
  const incomplete = equipos.filter((equipo) => getIncompleteFields(equipo).length > 0).length;

  const topBranch = groupCountBy(equipos, (e) => e.sucursal)[0];
  const topDepartment = groupCountBy(equipos, (e) => e.departamento)[0];

  return [
    `Resumen general del inventario${scopeLabel}:`,
    "",
    `- Total de equipos registrados: ${total}`,
    `- Equipos activos: ${active}`,
    `- Equipos inactivos: ${inactive}`,
    `- Equipos activos en buen estado: ${good}`,
    `- Equipos activos en estado regular: ${regular}`,
    `- Equipos activos críticos: ${critical}`,
    `- Registros con datos incompletos: ${incomplete}`,
    topBranch
      ? `- Sucursal con más equipos: ${topBranch.name} (${topBranch.total})`
      : "- Sucursal con más equipos: sin datos suficientes",
    topDepartment
      ? `- Departamento con más equipos: ${topDepartment.name} (${topDepartment.total})`
      : "- Departamento con más equipos: sin datos suficientes",
    "",
    critical > 0
      ? "Lectura rápida: hay equipos críticos activos que conviene revisar primero."
      : "Lectura rápida: no encontré equipos críticos activos en este momento.",
  ].join("\n");
}

function buildIncompleteDataSummary(equipos: AssistantEquipo[], scopeLabel = ""): string {
  const incomplete = equipos
    .map((equipo) => ({
      equipo,
      missing: getIncompleteFields(equipo),
    }))
    .filter((item) => item.missing.length > 0);

  if (incomplete.length === 0) {
    return `No encontré registros con datos importantes incompletos${scopeLabel}.`;
  }

  const list = incomplete
    .slice(0, 8)
    .map((item, index) => {
      return `${index + 1}. ${safeText(item.equipo.hostname)} — faltan: ${item.missing.join(
        ", "
      )}`;
    })
    .join("\n");

  const extra =
    incomplete.length > 8
      ? `\n\nMostré los primeros 8 de ${incomplete.length} registros incompletos encontrados.`
      : "";

  return `Encontré ${incomplete.length} equipos con datos importantes incompletos${scopeLabel}.\n\n${list}${extra}`;
}

function buildBranchRanking(equipos: AssistantEquipo[]): string {
  const grouped = groupCountBy(equipos, (e) => e.sucursal);
  const top = grouped[0];

  if (!top) {
    return "No encontré información suficiente para determinar la sucursal con más equipos.";
  }

  return [
    `La sucursal con más equipos es ${top.name}, con ${top.total} equipos registrados.`,
    "",
    "Top de sucursales:",
    formatTopList(grouped, 8),
  ].join("\n");
}

function buildDepartmentRanking(equipos: AssistantEquipo[]): string {
  const grouped = groupCountBy(equipos, (e) => e.departamento);
  const top = grouped[0];

  if (!top) {
    return "No encontré información suficiente para determinar el departamento con más equipos.";
  }

  return [
    `El departamento con más equipos es ${top.name}, con ${top.total} equipos registrados.`,
    "",
    "Top de departamentos:",
    formatTopList(grouped, 8),
  ].join("\n");
}

function buildBrandRanking(equipos: AssistantEquipo[], scopeLabel = ""): string {
  const grouped = groupCountBy(equipos, (e) => e.marca);

  return [`Marcas predominantes${scopeLabel}:`, "", formatTopList(grouped, 8)].join("\n");
}

function buildTypeSummary(equipos: AssistantEquipo[], scopeLabel = ""): string {
  const grouped = groupCountBy(equipos, (e) => e.tipoEquipo);

  return [`Equipos por tipo${scopeLabel}:`, "", formatTopList(grouped, 8)].join("\n");
}

function buildHelp(): string {
  return [
    "Puedo ayudarte a consultar el inventario en modo solo lectura.",
    "",
    "Entiendo preguntas simples y también frases más naturales, por ejemplo:",
    "- activos",
    "- cuantos inactivos hay",
    "- malos en Tampico",
    "- resumen de Sistemas",
    "- sucursal con más equipos",
    "- marcas predominantes",
    "- equipos sin responsable",
    "- prioridad de revisión",
    "",
    "No puedo modificar, dar de baja, restaurar ni actualizar registros.",
  ].join("\n");
}

function detectSpecificStatus(question: string, equipos: AssistantEquipo[], scopeLabel: string): string | null {
  const q = normalizeText(question);

  if (containsTerm(q, ["excelente", "excelentes"])) {
    const total = equipos.filter((equipo) => isActive(equipo) && isExcellent(equipo)).length;
    return buildCountAnswer(
      "Equipos activos en estado Excelente",
      total,
      scopeLabel,
      "EstadoFuncionamiento = Excelente y activo = true"
    );
  }

  if (containsTerm(q, ["bueno", "buenos"])) {
    const total = equipos.filter((equipo) => isActive(equipo) && getEstado(equipo) === "bueno").length;
    return buildCountAnswer(
      "Equipos activos en estado Bueno",
      total,
      scopeLabel,
      "EstadoFuncionamiento = Bueno y activo = true"
    );
  }

  if (containsTerm(q, ["regular", "regulares"])) {
    const total = equipos.filter((equipo) => isActive(equipo) && isRegular(equipo)).length;
    return buildCountAnswer(
      "Equipos activos en estado Regular",
      total,
      scopeLabel,
      "EstadoFuncionamiento = Regular y activo = true"
    );
  }

  if (containsTerm(q, ["malo", "malos"])) {
    const total = equipos.filter((equipo) => isActive(equipo) && isBad(equipo)).length;
    return buildCountAnswer(
      "Equipos activos en estado Malo",
      total,
      scopeLabel,
      "EstadoFuncionamiento = Malo y activo = true"
    );
  }

  if (containsTerm(q, ["disfuncional", "disfuncionales"])) {
    const total = equipos.filter((equipo) => isActive(equipo) && isDisfunctional(equipo)).length;
    return buildCountAnswer(
      "Equipos activos en estado Disfuncional",
      total,
      scopeLabel,
      "EstadoFuncionamiento = Disfuncional y activo = true"
    );
  }

  return null;
}

function findMentionedEquipment(question: string, equipos: AssistantEquipo[]): AssistantEquipo | null {
  const q = normalizeText(question);

  return (
    equipos.find((equipo) => {
      const hostname = normalizeText(equipo.hostname || "");
      const serie = normalizeText(equipo.numeroSerie || "");

      return (
        (hostname.length >= 4 && q.includes(hostname)) ||
        (serie.length >= 4 && q.includes(serie))
      );
    }) || null
  );
}

function buildEquipmentDetail(equipo: AssistantEquipo): string {
  return [
    `Encontré este equipo: ${safeText(equipo.hostname)}`,
    "",
    `- Tipo: ${safeText(equipo.tipoEquipo)}`,
    `- Marca/Modelo: ${safeText(equipo.marca)} ${safeText(equipo.modelo)}`,
    `- Serie: ${safeText(equipo.numeroSerie)}`,
    `- Responsable: ${safeText(equipo.responsable)}`,
    `- Sucursal: ${safeText(equipo.sucursal)}`,
    `- Departamento: ${safeText(equipo.departamento)}`,
    `- Ubicación: ${safeText(equipo.ubicacion)}`,
    `- Estado: ${safeText(equipo.estadoFuncionamiento)}`,
    `- Condición física: ${safeText(equipo.condicionFisica)}`,
    `- Activo: ${equipo.activo ? "Sí" : "No"}`,
    "",
    isCritical(equipo) && isActive(equipo)
      ? "Lectura rápida: este equipo está activo y aparece como crítico."
      : "Lectura rápida: no aparece como crítico activo.",
  ].join("\n");
}

export function getAssistantResponse(question: string, equipos: AssistantEquipo[]): string {
  const q = normalizeText(question);

  if (!equipos || equipos.length === 0) {
    return "Aún no tengo datos del inventario disponibles para responder. Revisa que la información de Dataverse haya cargado correctamente.";
  }

  if (!q) {
    return "Escríbeme una consulta sobre el inventario. Por ejemplo: “activos”, “críticos en Tampico” o “resumen general”.";
  }

  if (MODIFY_PATTERNS.some((pattern) => q.includes(normalizeText(pattern)))) {
    return READ_ONLY_MESSAGE;
  }

  if (SENSITIVE_PATTERNS.some((pattern) => q.includes(normalizeText(pattern)))) {
    return SENSITIVE_MESSAGE;
  }

  if (containsTerm(q, TERMS.help) || q === "hola" || q === "buenas") {
    return buildHelp();
  }

  const mentionedEquipment = findMentionedEquipment(question, equipos);

  if (mentionedEquipment && !containsTerm(q, TERMS.count)) {
    return buildEquipmentDetail(mentionedEquipment);
  }

  const scope = getScope(question, equipos);
  const scopedEquipos = scope.equipos;
  const scopeLabel = scope.label;

  if (scopedEquipos.length === 0) {
    return "Entendí la consulta, pero no encontré equipos que coincidan con ese alcance. Revisa si la sucursal, departamento, marca o tipo están escritos como aparecen en CoreInventory.";
  }

  if (containsTerm(q, TERMS.summary)) {
    return buildGeneralSummary(scopedEquipos, scopeLabel);
  }

  if (containsTerm(q, TERMS.incomplete)) {
    return buildIncompleteDataSummary(scopedEquipos, scopeLabel);
  }

  if (containsTerm(q, TERMS.priority)) {
    return buildPriorityList(scopedEquipos, scopeLabel);
  }

  if (q.includes("por estado") || q.includes("distribucion") || q.includes("distribución")) {
    return buildStatusDistribution(scopedEquipos, scopeLabel);
  }

  const statusAnswer = detectSpecificStatus(q, scopedEquipos, scopeLabel);

  if (statusAnswer) {
    return statusAnswer;
  }

  if (containsTerm(q, TERMS.inactive)) {
    const total = scopedEquipos.filter(isInactive).length;
    return buildCountAnswer(
      "Equipos inactivos",
      total,
      scopeLabel,
      "activo = false"
    );
  }

  if (containsTerm(q, TERMS.active)) {
    const total = scopedEquipos.filter(isActive).length;
    return buildCountAnswer(
      "Equipos activos",
      total,
      scopeLabel,
      "activo = true"
    );
  }

  if (containsTerm(q, TERMS.critical)) {
    return buildCriticalList(scopedEquipos, scopeLabel);
  }

  if (
    containsTerm(q, TERMS.branch) &&
    containsTerm(q, TERMS.top)
  ) {
    return buildBranchRanking(equipos);
  }

  if (
    containsTerm(q, TERMS.department) &&
    containsTerm(q, TERMS.top)
  ) {
    return buildDepartmentRanking(equipos);
  }

  if (q.includes("por sucursal") || (containsTerm(q, TERMS.branch) && containsTerm(q, ["lista", "listar", "distribucion", "distribución"]))) {
    const grouped = groupCountBy(scopedEquipos, (e) => e.sucursal);
    return `Equipos por sucursal${scopeLabel}:\n\n${formatTopList(grouped, 10)}`;
  }

  if (q.includes("por departamento") || (containsTerm(q, TERMS.department) && containsTerm(q, ["lista", "listar", "distribucion", "distribución"]))) {
    const grouped = groupCountBy(scopedEquipos, (e) => e.departamento);
    return `Equipos por departamento${scopeLabel}:\n\n${formatTopList(grouped, 10)}`;
  }

  if (containsTerm(q, TERMS.brand)) {
    return buildBrandRanking(scopedEquipos, scopeLabel);
  }

  if (containsTerm(q, TERMS.type)) {
    return buildTypeSummary(scopedEquipos, scopeLabel);
  }

  if (containsTerm(q, TERMS.count) || q.includes("equipos")) {
    return buildGeneralSummary(scopedEquipos, scopeLabel);
  }

  return [
    "Puedo ayudarte con esa consulta, pero necesito un poco más de contexto.",
    "",
    "Prueba con algo como:",
    "- activos",
    "- inactivos",
    "- críticos en Tampico",
    "- resumen de Sistemas",
    "- sucursal con más equipos",
    "- equipos sin datos",
    "- prioridad de revisión",
  ].join("\n");
}