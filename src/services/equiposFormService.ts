import {
  Cr22e_departamentosesService,
  Cr22e_equipostisService,
  Cr22e_sucursalesesService,
} from "../generated";

import { Cr22e_facturasdecompratisService } from "../generated/services/Cr22e_facturasdecompratisService";
import { Cr22e_razonsocialsService } from "../generated/services/Cr22e_razonsocialsService";
import { TransactioncurrenciesService } from "../generated/services/TransactioncurrenciesService";

import type {
  AltaEquipoForm,
  DepartamentoOption,
  FacturaCompraOption,
  RazonSocialOption,
  SucursalOption,
  TipoAdquisicion,
} from "../interfaces/altaEquipo";

import type { Cr22e_departamentoses } from "../generated/models/Cr22e_departamentosesModel";
import type { Cr22e_facturasdecompratis } from "../generated/models/Cr22e_facturasdecompratisModel";
import type { Cr22e_razonsocials } from "../generated/models/Cr22e_razonsocialsModel";
import type { Cr22e_sucursaleses } from "../generated/models/Cr22e_sucursalesesModel";
import type { Transactioncurrencies } from "../generated/models/TransactioncurrenciesModel";

import type {
  Cr22e_equipostiscr22e_condicionfisica,
  Cr22e_equipostiscr22e_estadodeequipo,
  Cr22e_equipostiscr22e_tipodeadquisicion,
  Cr22e_equipostiscr22e_tipoequipo,
} from "../generated/models/Cr22e_equipostisModel";

type OperationResultLike<T> = {
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
  const result = response as OperationResultLike<unknown>;

  if (result?.success === false) {
    throw new Error(result.error?.message || fallbackMessage);
  }
}

function unwrapData<T>(
  response: unknown,
  fallbackMessage: string
): T {
  ensureOperationSucceeded(response, fallbackMessage);

  const result = response as OperationResultLike<T>;

  if (result.data !== undefined) return result.data;
  if (result.value !== undefined) return result.value;
  if (result.result !== undefined) return result.result;
  if (result.record !== undefined) return result.record;

  return response as T;
}

function unwrapRecord<T>(
  response: unknown,
  fallbackMessage: string
): T {
  const record = unwrapData<T | undefined>(
    response,
    fallbackMessage
  );

  if (!record || typeof record !== "object") {
    throw new Error(fallbackMessage);
  }

  return record;
}

function sortByNombre<T extends { nombre: string }>(
  items: T[]
): T[] {
  return [...items].sort((a, b) =>
    a.nombre.localeCompare(b.nombre)
  );
}

function clean(value: string) {
  return value.trim();
}

function cleanGuid(value: string) {
  return value.replace(/[{}]/g, "").trim();
}

function optionalText(value: string) {
  const cleaned = clean(value);
  return cleaned || undefined;
}

function createTabletTechnicalHostname() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomSuffix = Math.random()
    .toString(36)
    .slice(2, 7)
    .toUpperCase();

  return `TABLET-${timestamp}-${randomSuffix}`;
}

function parseOptionalMoney(
  value: string,
  fieldLabel: string
): number | undefined {
  const normalized = value.replace(/,/g, "").trim();

  if (!normalized) {
    return undefined;
  }

  const parsed = Number(normalized);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(
      `${fieldLabel} debe ser un importe válido mayor o igual a cero.`
    );
  }

  return parsed;
}

function mapTipoEquipo(
  value: string
): Cr22e_equipostiscr22e_tipoequipo | undefined {
  const map: Record<
    string,
    Cr22e_equipostiscr22e_tipoequipo
  > = {
    Laptop: 100000000,
    "PC de Escritorio": 100000001,
    Tablet: 100000002,
  };

  return map[value];
}

function mapEstadoEquipo(
  value: string
): Cr22e_equipostiscr22e_estadodeequipo | undefined {
  const map: Record<
    string,
    Cr22e_equipostiscr22e_estadodeequipo
  > = {
    Excelente: 100000000,
    Bueno: 100000001,
    Regular: 100000002,
    Malo: 100000003,
    Disfuncional: 100000004,
  };

  return map[value];
}

function mapCondicionFisica(
  value: string
): Cr22e_equipostiscr22e_condicionfisica | undefined {
  const map: Record<
    string,
    Cr22e_equipostiscr22e_condicionfisica
  > = {
    Excelente: 100000000,
    Bueno: 100000001,
    Regular: 100000002,
    Malo: 100000003,
    Disfuncional: 100000004,
  };

  return map[value];
}

function mapTipoAdquisicion(
  value: TipoAdquisicion | ""
): Cr22e_equipostiscr22e_tipodeadquisicion | undefined {
  const map: Record<
    TipoAdquisicion,
    Cr22e_equipostiscr22e_tipodeadquisicion
  > = {
    "Compra nueva": 100000001,
    "Equipo existente": 100000002,
    Transferencia: 100000003,
    Arrendamiento: 100000004,
    Donación: 100000005,
    Otro: 100000006,
  };

  return value ? map[value] : undefined;
}

function validateInvoicePdf(
  file: File | null,
  maxBytes: number
) {
  if (!file) {
    return;
  }

  const fileName = file.name.toLocaleLowerCase("es-MX");

  if (!fileName.endsWith(".pdf")) {
    throw new Error(
      `El archivo ${file.name} debe tener extensión .pdf.`
    );
  }

  if (file.size > maxBytes) {
    const maxMegabytes = Math.round(maxBytes / (1024 * 1024));

    throw new Error(
      `El archivo ${file.name} supera el límite de ${maxMegabytes} MB.`
    );
  }
}

function hasNewInvoiceData(form: AltaEquipoForm) {
  return Boolean(
    form.numeroFactura.trim() ||
      form.fechaFactura ||
      form.razonSocialReceptoraId ||
      form.montoTotalFactura.trim() ||
      form.observacionesFactura.trim() ||
      form.facturaPdf
  );
}

async function getMonedaMxnId(): Promise<string | undefined> {
  const response = await TransactioncurrenciesService.getAll();

  const rows = unwrapData<Transactioncurrencies[]>(
    response,
    "No se pudo consultar la moneda predeterminada."
  );

  return rows.find(
    (row) =>
      row.statecode === 0 &&
      row.isocurrencycode?.toUpperCase() === "MXN"
  )?.transactioncurrencyid;
}

export async function getSucursalesEquipo(): Promise<
  SucursalOption[]
> {
  const response = await Cr22e_sucursalesesService.getAll();

  const rows = unwrapData<Cr22e_sucursaleses[]>(
    response,
    "No se pudieron cargar las sucursales."
  );

  const sucursales = rows
    .filter((row) => row.statecode === 0)
    .filter((row) => row.cr22e_activo !== false)
    .map((row) => ({
      id: row.cr22e_sucursalesid,
      nombre:
        row.cr22e_nombresucursal ||
        row.cr22e_name ||
        "Sin nombre",
    }))
    .filter((row) => Boolean(row.id && row.nombre));

  return sortByNombre(sucursales);
}

export async function getDepartamentosEquipo(): Promise<
  DepartamentoOption[]
> {
  const response =
    await Cr22e_departamentosesService.getAll();

  const rows = unwrapData<Cr22e_departamentoses[]>(
    response,
    "No se pudieron cargar los departamentos."
  );

  const departamentos = rows
    .filter((row) => row.statecode === 0)
    .filter((row) => row.cr22e_activo !== false)
    .map((row) => ({
      id: row.cr22e_departamentosid,
      nombre:
        row.cr22e_nombredepartamento ||
        row.cr22e_name ||
        "Sin nombre",
    }))
    .filter((row) => Boolean(row.id && row.nombre));

  return sortByNombre(departamentos);
}

export async function getRazonesSocialesEquipo(): Promise<
  RazonSocialOption[]
> {
  const response = await Cr22e_razonsocialsService.getAll();

  const rows = unwrapData<Cr22e_razonsocials[]>(
    response,
    "No se pudieron cargar las razones sociales."
  );

  return sortByNombre(
    rows
      .filter((row) => row.statecode === 0)
      .map((row) => ({
        id: row.cr22e_razonsocialid,
        nombre: row.cr22e_name,
        nombreCorto: optionalText(row.cr22e_nombrecorto || ""),
        rfc: optionalText(row.cr22e_rfc || ""),
      }))
      .filter((row) => Boolean(row.id && row.nombre))
  );
}

export async function getFacturasEquipo(): Promise<
  FacturaCompraOption[]
> {
  const response = await Cr22e_facturasdecompratisService.getAll();

  const rows = unwrapData<Cr22e_facturasdecompratis[]>(
    response,
    "No se pudieron cargar las facturas."
  );

  return rows
    .filter((row) => row.statecode === 0)
    .map((row) => ({
      id: row.cr22e_facturasdecompratiid,
      referencia: row.cr22e_name,
      numeroFactura: optionalText(
        row.cr22e_numerodefactura || ""
      ),
      fechaFactura: optionalText(
        row.cr22e_fechadefactura || ""
      ),
      razonSocialReceptoraId:
        row._cr22e_razonsocialreceptora_value,
      razonSocialReceptoraNombre: optionalText(
        row.cr22e_razonsocialreceptoraname || ""
      ),
      montoTotal: row.cr22e_montototal,
      tienePdf: Boolean(row.cr22e_facturapdf_name),
    }))
    .filter((row) => Boolean(row.id && row.referencia))
    .sort((a, b) => {
      const dateA = new Date(a.fechaFactura || 0).getTime();
      const dateB = new Date(b.fechaFactura || 0).getTime();

      return dateB - dateA;
    });
}

async function getFacturaRecord(
  facturaId: string
): Promise<Cr22e_facturasdecompratis> {
  const response = await Cr22e_facturasdecompratisService.get(
    cleanGuid(facturaId)
  );

  return unwrapRecord<Cr22e_facturasdecompratis>(
    response,
    "No se pudo consultar la factura seleccionada."
  );
}

async function crearFacturaNueva(
  form: AltaEquipoForm,
  nombreEquipo: string
): Promise<string> {
  const montoTotal = parseOptionalMoney(
    form.montoTotalFactura,
    "El monto total"
  );

  validateInvoicePdf(
    form.facturaPdf,
    15 * 1024 * 1024
  );

  /*
   * Monto total sigue siendo una columna de tipo moneda en Dataverse.
   * La moneda ya no se solicita al usuario, pero se asigna automáticamente
   * a MXN para mantener válido el registro de factura.
   */
  const monedaMxnId = await getMonedaMxnId();

  const referenciaFactura =
    clean(form.numeroFactura) ||
    `Factura pendiente — ${nombreEquipo}`;

  const record = {
    cr22e_name: referenciaFactura,

    ...(optionalText(form.numeroFactura)
      ? { cr22e_numerodefactura: optionalText(form.numeroFactura) }
      : {}),

    ...(form.fechaFactura
      ? { cr22e_fechadefactura: form.fechaFactura }
      : {}),

    ...(montoTotal !== undefined
      ? { cr22e_montototal: montoTotal }
      : {}),

    ...(optionalText(form.observacionesFactura)
      ? {
          cr22e_observaciones: optionalText(
            form.observacionesFactura
          ),
        }
      : {}),

    ...(form.razonSocialReceptoraId
      ? {
          "cr22e_Razonsocialreceptora@odata.bind":
            `/cr22e_razonsocials(${cleanGuid(
              form.razonSocialReceptoraId
            )})`,
        }
      : {}),

    ...(monedaMxnId
      ? {
          "transactioncurrencyid@odata.bind":
            `/transactioncurrencies(${cleanGuid(
              monedaMxnId
            )})`,
        }
      : {}),
  };

  const response = await Cr22e_facturasdecompratisService.create(
    record as never
  );

  const facturaCreada = unwrapRecord<Cr22e_facturasdecompratis>(
    response,
    "La factura se creó, pero no fue posible obtener su identificador."
  );

  const facturaId = facturaCreada.cr22e_facturasdecompratiid;

  if (!facturaId) {
    throw new Error(
      "La factura se creó, pero no fue posible obtener su identificador."
    );
  }

  if (form.facturaPdf) {
    const uploadResponse =
      await Cr22e_facturasdecompratisService.upload(
        facturaId,
        "cr22e_facturapdf",
        form.facturaPdf
      );

    ensureOperationSucceeded(
      uploadResponse,
      "La factura fue creada, pero no se pudo cargar el PDF."
    );
  }

  return facturaId;
}

export async function crearEquipo(form: AltaEquipoForm) {
  const esTablet = form.tipoEquipo === "Tablet";
  const marca = clean(form.marca);
  const modelo = clean(form.modelo);
  const hostnameCapturado = clean(form.hostname);

  /*
   * Dataverse mantiene Hostname como campo obligatorio.
   * Para Tablet no se solicita al usuario: se genera un identificador
   * técnico interno y único para evitar falsos duplicados.
   */
  const hostnameGuardado = esTablet
    ? createTabletTechnicalHostname()
    : hostnameCapturado;

  const nombreVisible = esTablet
    ? [marca, modelo].filter(Boolean).join(" ") ||
      "Tablet sin identificar"
    : hostnameCapturado ||
      clean(form.numeroSerie) ||
      modelo ||
      "Equipo TI sin hostname";

  const tipoAdquisicion: TipoAdquisicion = form.esAdquisicionNueva
    ? "Compra nueva"
    : form.tipoAdquisicion || "Equipo existente";

  let facturaId: string | undefined;

  if (
    form.esAdquisicionNueva &&
    form.modoFactura === "Seleccionar factura existente" &&
    form.facturaId
  ) {
    const factura = await getFacturaRecord(form.facturaId);

    facturaId = factura.cr22e_facturasdecompratiid;
  }

  if (
    form.esAdquisicionNueva &&
    form.modoFactura === "Registrar factura nueva" &&
    hasNewInvoiceData(form)
  ) {
    facturaId = await crearFacturaNueva(form, nombreVisible);
  }

  const record = {
    cr22e_name: nombreVisible,
    cr22e_hostname: hostnameGuardado || nombreVisible,

    cr22e_tipoequipo: mapTipoEquipo(form.tipoEquipo),
    cr22e_marca: marca,
    cr22e_modelo: modelo,

    /*
     * Los campos técnicos no forman parte de la captura simplificada
     * de Tablet, incluso si el formulario recibiera valores residuales.
     */
    ...(esTablet
      ? {}
      : {
          cr22e_numerodeserie: clean(form.numeroSerie),
          cr22e_direccionip: clean(form.direccionIP),
          cr22e_sistemaoperativo: clean(form.sistemaOperativo),
          cr22e_claveanydesk: clean(form.claveAnyDesk),
        }),

    cr22e_responsable: clean(form.responsable),
    cr22e_ubicacionexacta: clean(form.ubicacionExacta),
    cr22e_observaciones: clean(form.observaciones),

    cr22e_estadodeequipo: mapEstadoEquipo(
      form.estadoFuncionamiento
    ),
    cr22e_condicionfisica: mapCondicionFisica(
      form.condicionFisica
    ),

    cr22e_tipodeadquisicion: mapTipoAdquisicion(
      tipoAdquisicion
    ),
    cr22e_numerodepartidadefactura:
      form.esAdquisicionNueva
        ? optionalText(form.numeroPartidaFactura)
        : undefined,

    cr22e_activo: true,

    ...(form.sucursalId
      ? {
          "cr22e_sucursal@odata.bind":
            `/cr22e_sucursaleses(${cleanGuid(form.sucursalId)})`,
        }
      : {}),

    ...(form.departamentoId
      ? {
          "cr22e_departamento@odata.bind":
            `/cr22e_departamentoses(${cleanGuid(
              form.departamentoId
            )})`,
        }
      : {}),

    ...(facturaId
      ? {
          "cr22e_Facturadecompra@odata.bind":
            `/cr22e_facturasdecompratis(${cleanGuid(
              facturaId
            )})`,
        }
      : {}),
  };

  return Cr22e_equipostisService.create(record as never);
}
