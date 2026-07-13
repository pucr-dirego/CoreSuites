import {
  Cr22e_excepcionescalidaddatosesService,
} from "../generated/services/Cr22e_excepcionescalidaddatosesService";

import type {
  Cr22e_excepcionescalidaddatoses,
  Cr22e_excepcionescalidaddatosesBase,
} from "../generated/models/Cr22e_excepcionescalidaddatosesModel";

export type DataQualityExceptionScope = "global" | "sucursal";

export type DataQualityExceptionProblemType =
  | "duplicado"
  | "dato_faltante"
  | "valor_sospechoso"
  | "inconsistencia";

export type DataQualityExceptionField =
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

export interface DataQualityException {
  id: string;
  name: string;
  alertKey: string;
  active: boolean;
  scope: DataQualityExceptionScope;
  branchId?: string;
  branchName?: string;
  problemType?: DataQualityExceptionProblemType;
  field?: DataQualityExceptionField;
  detectedValue?: string;
  affectedEquipment?: string;
  reason?: string;
  ignoredAt?: string;
  reactivatedAt?: string;
  createdOn?: string;
  modifiedOn?: string;
}

export interface IgnoreDataQualityIssuePayload {
  name: string;
  alertKey: string;
  scope: DataQualityExceptionScope;
  branchId?: string;
  problemType: DataQualityExceptionProblemType;
  field: DataQualityExceptionField;
  detectedValue?: string;
  affectedEquipment?: string;
  reason?: string;
}

const AMBITO = {
  global: 100000001,
  sucursal: 100000002,
} as const;

const TIPO_PROBLEMA = {
  duplicado: 100000001,
  dato_faltante: 100000002,
  valor_sospechoso: 100000003,
  inconsistencia: 100000004,
} as const;

const CAMPO_EVALUADO = {
  direccion_ip: 100000001,
  hostname: 100000002,
  numero_serie: 100000003,
  clave_anydesk: 100000004,
  sucursal: 100000005,
  departamento: 100000006,
  ubicacion: 100000007,
  responsable: 100000008,
  estado: 100000009,
  otro: 100000010,
} as const;

function mapAmbito(value?: number | string): DataQualityExceptionScope {
  if (Number(value) === AMBITO.sucursal) {
    return "sucursal";
  }

  return "global";
}

function mapTipoProblema(
  value?: number | string
): DataQualityExceptionProblemType | undefined {
  const numericValue = Number(value);

  if (numericValue === TIPO_PROBLEMA.duplicado) return "duplicado";
  if (numericValue === TIPO_PROBLEMA.dato_faltante) return "dato_faltante";
  if (numericValue === TIPO_PROBLEMA.valor_sospechoso) return "valor_sospechoso";
  if (numericValue === TIPO_PROBLEMA.inconsistencia) return "inconsistencia";

  return undefined;
}

function mapCampoEvaluado(
  value?: number | string
): DataQualityExceptionField | undefined {
  const numericValue = Number(value);

  if (numericValue === CAMPO_EVALUADO.direccion_ip) return "direccion_ip";
  if (numericValue === CAMPO_EVALUADO.hostname) return "hostname";
  if (numericValue === CAMPO_EVALUADO.numero_serie) return "numero_serie";
  if (numericValue === CAMPO_EVALUADO.clave_anydesk) return "clave_anydesk";
  if (numericValue === CAMPO_EVALUADO.sucursal) return "sucursal";
  if (numericValue === CAMPO_EVALUADO.departamento) return "departamento";
  if (numericValue === CAMPO_EVALUADO.ubicacion) return "ubicacion";
  if (numericValue === CAMPO_EVALUADO.responsable) return "responsable";
  if (numericValue === CAMPO_EVALUADO.estado) return "estado";
  if (numericValue === CAMPO_EVALUADO.otro) return "otro";

  return undefined;
}

function mapExceptionRecord(
  record: Cr22e_excepcionescalidaddatoses
): DataQualityException {
  return {
    id: record.cr22e_excepcionescalidaddatosid,
    name: record.cr22e_name,
    alertKey: record.cr22e_clavealerta ?? "",
    active: record.cr22e_activa ?? false,
    scope: mapAmbito(record.cr22e_ambito),
    branchId: record._cr22e_sucursales_value,
    branchName: record.cr22e_sucursalesname,
    problemType: mapTipoProblema(record.cr22e_tipoproblema),
    field: mapCampoEvaluado(record.cr22e_campoevaluado),
    detectedValue: record.cr22e_valordetectado,
    affectedEquipment: record.cr22e_equiposafectados,
    reason: record.cr22e_motivo,
    ignoredAt: record.cr22e_fechaignorado,
    reactivatedAt: record.cr22e_fechareactivacion,
    createdOn: record.createdon,
    modifiedOn: record.modifiedon,
  };
}

function buildSucursalBind(branchId?: string) {
  if (!branchId) {
    return undefined;
  }

  return `/cr22e_sucursaleses(${branchId})`;
}

async function getAllExceptionRecords() {
  const result = await Cr22e_excepcionescalidaddatosesService.getAll();

  if (!result.success) {
    throw new Error("No se pudieron cargar las excepciones de calidad de datos.");
  }

  return result.data ?? [];
}

export const dataQualityExceptionsService = {
  async getAllExceptions(): Promise<DataQualityException[]> {
    const records = await getAllExceptionRecords();

    return records.map(mapExceptionRecord);
  },

  async getActiveExceptions(): Promise<DataQualityException[]> {
    const records = await getAllExceptionRecords();

    return records
      .filter((record) => record.cr22e_activa === true)
      .map(mapExceptionRecord);
  },

  async getIgnoredAlertKeys(): Promise<Set<string>> {
    const activeExceptions = await this.getActiveExceptions();

    return new Set(
      activeExceptions
        .map((exception) => exception.alertKey)
        .filter(Boolean)
    );
  },

  async ignoreIssue(
    payload: IgnoreDataQualityIssuePayload
  ): Promise<DataQualityException> {
    const existingRecords = await getAllExceptionRecords();

    const existingRecord = existingRecords.find(
      (record) => record.cr22e_clavealerta === payload.alertKey
    );

    if (existingRecord) {
      const updatePayload = {
        cr22e_name: payload.name,
        cr22e_activa: true,
        cr22e_ambito: AMBITO[payload.scope],
        cr22e_tipoproblema: TIPO_PROBLEMA[payload.problemType],
        cr22e_campoevaluado: CAMPO_EVALUADO[payload.field],
        cr22e_valordetectado: payload.detectedValue,
        cr22e_equiposafectados: payload.affectedEquipment,
        cr22e_motivo: payload.reason,
        cr22e_fechaignorado: new Date().toISOString(),
        cr22e_fechareactivacion: undefined,
        "cr22e_Sucursales@odata.bind":
          payload.scope === "sucursal"
            ? buildSucursalBind(payload.branchId)
            : undefined,
      } as Partial<
        Omit<
          Cr22e_excepcionescalidaddatosesBase,
          "cr22e_excepcionescalidaddatosid"
        >
      >;

      const result = await Cr22e_excepcionescalidaddatosesService.update(
        existingRecord.cr22e_excepcionescalidaddatosid,
        updatePayload
      );

      if (!result.success || !result.data) {
        throw new Error("No se pudo reactivar la excepción de calidad de datos.");
      }

      return mapExceptionRecord(result.data);
    }

    const createPayload = {
      cr22e_name: payload.name,
      cr22e_clavealerta: payload.alertKey,
      cr22e_activa: true,
      cr22e_ambito: AMBITO[payload.scope],
      cr22e_tipoproblema: TIPO_PROBLEMA[payload.problemType],
      cr22e_campoevaluado: CAMPO_EVALUADO[payload.field],
      cr22e_valordetectado: payload.detectedValue,
      cr22e_equiposafectados: payload.affectedEquipment,
      cr22e_motivo: payload.reason,
      cr22e_fechaignorado: new Date().toISOString(),
      "cr22e_Sucursales@odata.bind":
        payload.scope === "sucursal"
          ? buildSucursalBind(payload.branchId)
          : undefined,
    } as Omit<
      Cr22e_excepcionescalidaddatosesBase,
      "cr22e_excepcionescalidaddatosid"
    >;

    const result = await Cr22e_excepcionescalidaddatosesService.create(
      createPayload
    );

    if (!result.success || !result.data) {
      throw new Error("No se pudo guardar la excepción de calidad de datos.");
    }

    return mapExceptionRecord(result.data);
  },

  async reactivateIssue(exceptionId: string): Promise<DataQualityException> {
    const result = await Cr22e_excepcionescalidaddatosesService.update(
      exceptionId,
      {
        cr22e_activa: false,
        cr22e_fechareactivacion: new Date().toISOString(),
      } as Partial<
        Omit<
          Cr22e_excepcionescalidaddatosesBase,
          "cr22e_excepcionescalidaddatosid"
        >
      >
    );

    if (!result.success || !result.data) {
      throw new Error("No se pudo reactivar la alerta de calidad de datos.");
    }

    return mapExceptionRecord(result.data);
  },
};

