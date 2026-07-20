import {
  Cr22e_departamentosesService,
  Cr22e_equipostisService,
  Cr22e_sucursalesesService,
} from "../generated";

import { Cr22e_facturasdecompratisService } from "../generated/services/Cr22e_facturasdecompratisService";
import { Cr22e_proveedoresesService } from "../generated/services/Cr22e_proveedoresesService";
import { Cr22e_razonsocialsService } from "../generated/services/Cr22e_razonsocialsService";
import { TransactioncurrenciesService } from "../generated/services/TransactioncurrenciesService";

import type {
  AltaEquipoForm,
  DepartamentoOption,
  FacturaCompraOption,
  MonedaOption,
  ProveedorEmisorOption,
  RazonSocialOption,
  SucursalOption,
  TipoAdquisicion,
} from "../interfaces/altaEquipo";

import type { Cr22e_departamentoses } from "../generated/models/Cr22e_departamentosesModel";
import type { Cr22e_facturasdecompratis } from "../generated/models/Cr22e_facturasdecompratisModel";
import type { Cr22e_proveedoreses } from "../generated/models/Cr22e_proveedoresesModel";
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

function validateInvoiceFile(
  file: File | null,
  expectedExtension: ".pdf" | ".xml",
  maxBytes: number
) {
  if (!file) {
    return;
  }

  const fileName = file.name.toLocaleLowerCase("es-MX");

  if (!fileName.endsWith(expectedExtension)) {
    throw new Error(
      `El archivo ${file.name} debe tener extensión ${expectedExtension}.`
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
      form.uuidFiscal.trim() ||
      form.fechaFactura ||
      form.razonSocialReceptoraId ||
      form.proveedorEmisorId ||
      form.razonSocialEmisor.trim() ||
      form.rfcEmisor.trim() ||
      form.subtotalFactura.trim() ||
      form.impuestosFactura.trim() ||
      form.montoTotalFactura.trim() ||
      form.observacionesFactura.trim() ||
      form.facturaPdf ||
      form.facturaXml
  );
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

export async function getMonedasEquipo(): Promise<
  MonedaOption[]
> {
  const response = await TransactioncurrenciesService.getAll();

  const rows = unwrapData<Transactioncurrencies[]>(
    response,
    "No se pudieron cargar las monedas."
  );

  return rows
    .filter((row) => row.statecode === 0)
    .map((row) => ({
      id: row.transactioncurrencyid,
      codigo: row.isocurrencycode,
      nombre: row.currencyname,
      simbolo: row.currencysymbol,
    }))
    .filter((row) => Boolean(row.id && row.codigo))
    .sort((a, b) => a.codigo.localeCompare(b.codigo));
}

export async function getProveedoresEmisoresEquipo(): Promise<
  ProveedorEmisorOption[]
> {
  const response = await Cr22e_proveedoresesService.getAll();

  const rows = unwrapData<Cr22e_proveedoreses[]>(
    response,
    "No se pudieron cargar los proveedores emisores."
  );

  return sortByNombre(
    rows
      .filter((row) => row.statecode === 0)
      .filter((row) => row.cr22e_activo !== false)
      .map((row) => ({
        id: row.cr22e_proveedoresid,
        nombre: row.cr22e_name,
        razonSocial: optionalText(row.cr22e_razonsocial || ""),
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
      uuidFiscal: optionalText(row.cr22e_uuidfiscal || ""),
      fechaFactura: optionalText(
        row.cr22e_fechadefactura || ""
      ),
      razonSocialReceptoraId:
        row._cr22e_razonsocialreceptora_value,
      razonSocialReceptoraNombre: optionalText(
        row.cr22e_razonsocialreceptoraname || ""
      ),
      proveedorEmisorId:
        row._cr22e_proveedoremisor_value,
      proveedorEmisorNombre: optionalText(
        row.cr22e_proveedoremisorname || ""
      ),
      razonSocialEmisor: optionalText(
        row.cr22e_razonsocialdelemisor || ""
      ),
      rfcEmisor: optionalText(row.cr22e_rfcdelemisor || ""),
      subtotal: row.cr22e_subtotal,
      impuestos: row.cr22e_impuestos,
      montoTotal: row.cr22e_montototal,
      monedaId: row._transactioncurrencyid_value,
      monedaNombre: optionalText(
        row.transactioncurrencyidname || ""
      ),
      tienePdf: Boolean(row.cr22e_facturapdf_name),
      tieneXml: Boolean(row.cr22e_facturaxml_name),
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
  const subtotal = parseOptionalMoney(
    form.subtotalFactura,
    "El subtotal"
  );

  const impuestos = parseOptionalMoney(
    form.impuestosFactura,
    "Los impuestos"
  );

  const montoTotal = parseOptionalMoney(
    form.montoTotalFactura,
    "El monto total"
  );

  validateInvoiceFile(
    form.facturaPdf,
    ".pdf",
    15 * 1024 * 1024
  );

  validateInvoiceFile(
    form.facturaXml,
    ".xml",
    5 * 1024 * 1024
  );

  const referenciaFactura =
    clean(form.numeroFactura) ||
    clean(form.razonSocialEmisor) ||
    `Factura pendiente — ${nombreEquipo}`;

  const record = {
    cr22e_name: referenciaFactura,

    ...(optionalText(form.numeroFactura)
      ? { cr22e_numerodefactura: optionalText(form.numeroFactura) }
      : {}),

    ...(optionalText(form.uuidFiscal)
      ? { cr22e_uuidfiscal: optionalText(form.uuidFiscal) }
      : {}),

    ...(form.fechaFactura
      ? { cr22e_fechadefactura: form.fechaFactura }
      : {}),

    ...(optionalText(form.razonSocialEmisor)
      ? {
          cr22e_razonsocialdelemisor: optionalText(
            form.razonSocialEmisor
          ),
        }
      : {}),

    ...(optionalText(form.rfcEmisor)
      ? { cr22e_rfcdelemisor: optionalText(form.rfcEmisor) }
      : {}),

    ...(subtotal !== undefined
      ? { cr22e_subtotal: subtotal }
      : {}),

    ...(impuestos !== undefined
      ? { cr22e_impuestos: impuestos }
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

    ...(form.monedaId
      ? {
          "transactioncurrencyid@odata.bind":
            `/transactioncurrencies(${cleanGuid(
              form.monedaId
            )})`,
        }
      : {}),

    ...(form.proveedorEmisorId
      ? {
          "cr22e_Proveedoremisor@odata.bind":
            `/cr22e_proveedoreses(${cleanGuid(
              form.proveedorEmisorId
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

  if (form.facturaXml) {
    const uploadResponse =
      await Cr22e_facturasdecompratisService.upload(
        facturaId,
        "cr22e_facturaxml",
        form.facturaXml
      );

    ensureOperationSucceeded(
      uploadResponse,
      "La factura fue creada, pero no se pudo cargar el XML."
    );
  }

  return facturaId;
}

export async function crearEquipo(form: AltaEquipoForm) {
  const hostname = clean(form.hostname);

  const nombreVisible =
    hostname ||
    clean(form.numeroSerie) ||
    clean(form.modelo) ||
    "Equipo TI sin hostname";

  const tipoAdquisicion: TipoAdquisicion = form.esAdquisicionNueva
    ? "Compra nueva"
    : form.tipoAdquisicion || "Equipo existente";

  let facturaId: string | undefined;
  let monedaId = form.esAdquisicionNueva ? form.monedaId : "";

  if (
    form.esAdquisicionNueva &&
    form.modoFactura === "Seleccionar factura existente" &&
    form.facturaId
  ) {
    const factura = await getFacturaRecord(form.facturaId);

    facturaId = factura.cr22e_facturasdecompratiid;
    monedaId =
      factura._transactioncurrencyid_value || monedaId;
  }

  if (
    form.esAdquisicionNueva &&
    form.modoFactura === "Registrar factura nueva" &&
    hasNewInvoiceData(form)
  ) {
    facturaId = await crearFacturaNueva(form, nombreVisible);
  }

  const costoIndividual = form.esAdquisicionNueva
    ? parseOptionalMoney(
        form.costoIndividualEquipo,
        "El costo individual del equipo"
      )
    : undefined;

  if (costoIndividual !== undefined && !monedaId) {
    throw new Error(
      "Selecciona una moneda para el costo individual del equipo."
    );
  }

  const record = {
    cr22e_name: nombreVisible,
    cr22e_hostname: nombreVisible,

    cr22e_tipoequipo: mapTipoEquipo(form.tipoEquipo),
    cr22e_marca: clean(form.marca),
    cr22e_modelo: clean(form.modelo),
    cr22e_numerodeserie: clean(form.numeroSerie),
    cr22e_direccionip: clean(form.direccionIP),
    cr22e_sistemaoperativo: clean(form.sistemaOperativo),
    cr22e_claveanydesk: clean(form.claveAnyDesk),

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
    cr22e_fechadeadquisicion: optionalText(
      form.fechaAdquisicion
    ),
    cr22e_costoindividualdelequipo: costoIndividual,
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

    ...(monedaId
      ? {
          "transactioncurrencyid@odata.bind":
            `/transactioncurrencies(${cleanGuid(monedaId)})`,
        }
      : {}),
  };

  return Cr22e_equipostisService.create(record as never);
}
