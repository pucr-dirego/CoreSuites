import { useCallback, useEffect, useMemo, useState } from "react";
import { Cr22e_proveedoresesService } from "../generated/services/Cr22e_proveedoresesService";
import { Cr22e_serviciosproveedorsucursalsService } from "../generated/services/Cr22e_serviciosproveedorsucursalsService";
import { Cr22e_contactosproveedorsService } from "../generated/services/Cr22e_contactosproveedorsService";
import {
  Cr22e_serviciosproveedorsucursalscr22e_estadoservicio as ESTADO_SERVICIO_LABELS,
  Cr22e_serviciosproveedorsucursalscr22e_tiposervicio as TIPO_SERVICIO_LABELS,
} from "../generated/models/Cr22e_serviciosproveedorsucursalsModel";
import {
  Cr22e_contactosproveedorscr22e_tipocontacto as TIPO_CONTACTO_LABELS,
} from "../generated/models/Cr22e_contactosproveedorsModel";
import type { Cr22e_proveedoreses } from "../generated/models/Cr22e_proveedoresesModel";
import type { Cr22e_serviciosproveedorsucursals } from "../generated/models/Cr22e_serviciosproveedorsucursalsModel";
import type { Cr22e_contactosproveedors } from "../generated/models/Cr22e_contactosproveedorsModel";
import type {
  ContactoProveedorVista,
  CoreSuppliersResumen,
  EstadoServicioProveedor,
  ServicioProveedorVista,
  TipoServicioProveedor,
} from "../interfaces/coreSuppliers";

type OperationResult<T> = {
  success?: boolean;
  data?: T;
  error?: {
    message?: string;
  };
};

function obtenerMensajeError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "No se pudieron cargar los datos de CoreSuppliers.";
}

function validarResultado<T>(
  result: OperationResult<T>,
  mensajeFallback: string
): T {
  if (result.success === false) {
    throw new Error(result.error?.message || mensajeFallback);
  }

  if (!result.data) {
    return [] as T;
  }

  return result.data;
}

function limpiarTexto(valor?: string) {
  const texto = valor?.trim();
  return texto || undefined;
}

function estaActivo(activo?: boolean, statecode?: number) {
  return activo !== false && statecode !== 1;
}

function obtenerTipoServicio(
  servicio: Cr22e_serviciosproveedorsucursals
): TipoServicioProveedor {
  if (servicio.cr22e_tiposervicioname) {
    return servicio.cr22e_tiposervicioname as TipoServicioProveedor;
  }

  if (servicio.cr22e_tiposervicio !== undefined) {
    return (
      TIPO_SERVICIO_LABELS[servicio.cr22e_tiposervicio] || "Sin clasificar"
    ) as TipoServicioProveedor;
  }

  return "Sin clasificar";
}

function obtenerEstadoServicio(
  servicio: Cr22e_serviciosproveedorsucursals
): EstadoServicioProveedor {
  if (servicio.cr22e_estadoservicioname) {
    return servicio.cr22e_estadoservicioname as EstadoServicioProveedor;
  }

  if (servicio.cr22e_estadoservicio !== undefined) {
    return (
      ESTADO_SERVICIO_LABELS[servicio.cr22e_estadoservicio] || "Sin estado"
    ) as EstadoServicioProveedor;
  }

  return "Sin estado";
}

function obtenerTipoContacto(contacto: Cr22e_contactosproveedors) {
  if (contacto.cr22e_tipocontactoname) {
    return contacto.cr22e_tipocontactoname;
  }

  if (contacto.cr22e_tipocontacto !== undefined) {
    return TIPO_CONTACTO_LABELS[contacto.cr22e_tipocontacto] || "Sin clasificar";
  }

  return "Sin clasificar";
}

function mapearContactoProveedor(
  contacto: Cr22e_contactosproveedors
): ContactoProveedorVista {
  return {
    id: contacto.cr22e_contactosproveedorid,
    proveedorId: contacto._cr22e_proveedor_value,
    nombre: contacto.cr22e_name,
    puesto: limpiarTexto(contacto.cr22e_puesto),
    telefono: limpiarTexto(contacto.cr22e_telefono),
    correo: limpiarTexto(contacto.cr22e_correo),
    tipoContacto: obtenerTipoContacto(contacto),
    observaciones: limpiarTexto(contacto.cr22e_observaciones),
    activo: estaActivo(contacto.cr22e_activo, contacto.statecode),
  };
}

function obtenerPrioridadContacto(contacto: ContactoProveedorVista) {
  const tipo = contacto.tipoContacto.toLowerCase();

  if (tipo.includes("soporte")) return 1;
  if (tipo.includes("emergencia")) return 2;
  if (tipo.includes("tecnico") || tipo.includes("técnico")) return 3;
  if (tipo.includes("ventas")) return 4;
  if (tipo.includes("administrativo")) return 5;

  return 10;
}

function agruparContactosPorProveedor(contactos: ContactoProveedorVista[]) {
  const mapa = new Map<string, ContactoProveedorVista[]>();

  contactos.forEach((contacto) => {
    if (!contacto.proveedorId || !contacto.activo) {
      return;
    }

    const contactosActuales = mapa.get(contacto.proveedorId) || [];
    contactosActuales.push(contacto);
    mapa.set(contacto.proveedorId, contactosActuales);
  });

  mapa.forEach((contactosProveedor, proveedorId) => {
    contactosProveedor.sort(
      (a, b) => obtenerPrioridadContacto(a) - obtenerPrioridadContacto(b)
    );

    mapa.set(proveedorId, contactosProveedor);
  });

  return mapa;
}

function mapearServicioProveedor(
  servicio: Cr22e_serviciosproveedorsucursals,
  proveedoresPorId: Map<string, string>,
  contactosPorProveedor: Map<string, ContactoProveedorVista[]>
): ServicioProveedorVista {
  const proveedorId = servicio._cr22e_proveedor_value;

  const proveedor =
    limpiarTexto(servicio.cr22e_proveedorname) ||
    (proveedorId ? proveedoresPorId.get(proveedorId) : undefined) ||
    "Proveedor sin nombre";

  const contactoPrincipal = proveedorId
    ? contactosPorProveedor.get(proveedorId)?.[0]
    : undefined;

  return {
    id: servicio.cr22e_serviciosproveedorsucursalid,
    nombreServicio: servicio.cr22e_name,

    proveedorId,
    proveedor,

    sucursalId: servicio._cr22e_sucursal_value,
    sucursal: limpiarTexto(servicio.cr22e_sucursalname) || "Sucursal sin nombre",

    ubicacionId: servicio._cr22e_ubicaciondentrosucursal_value,
    ubicacion: limpiarTexto(servicio.cr22e_ubicaciondentrosucursalname),

    tipoServicio: obtenerTipoServicio(servicio),
    estadoServicio: obtenerEstadoServicio(servicio),

    telefonoSoporte: limpiarTexto(servicio.cr22e_telefonosoporte),
    correoSoporte: limpiarTexto(servicio.cr22e_correosoporte),
    horarioAtencion: limpiarTexto(servicio.cr22e_horarioatencion),
    observaciones: limpiarTexto(servicio.cr22e_observaciones),
    fechaUltimaActualizacion: servicio.cr22e_fechaultimaactualizacion,

    contactoPrincipal,

    activo: estaActivo(servicio.cr22e_activo, servicio.statecode),
  };
}

export function useCoreSuppliers() {
  const [proveedores, setProveedores] = useState<Cr22e_proveedoreses[]>([]);
  const [contactos, setContactos] = useState<ContactoProveedorVista[]>([]);
  const [servicios, setServicios] = useState<ServicioProveedorVista[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarCoreSuppliers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [proveedoresResult, serviciosResult, contactosResult] =
        await Promise.all([
          Cr22e_proveedoresesService.getAll(),
          Cr22e_serviciosproveedorsucursalsService.getAll(),
          Cr22e_contactosproveedorsService.getAll(),
        ]);

      const proveedoresData = validarResultado<Cr22e_proveedoreses[]>(
        proveedoresResult,
        "No se pudieron cargar los proveedores."
      );

      const serviciosData = validarResultado<Cr22e_serviciosproveedorsucursals[]>(
        serviciosResult,
        "No se pudieron cargar los servicios por sucursal."
      );

      const contactosData = validarResultado<Cr22e_contactosproveedors[]>(
        contactosResult,
        "No se pudieron cargar los contactos de proveedores."
      );

      const proveedoresActivos = proveedoresData.filter((proveedor) =>
        estaActivo(proveedor.cr22e_activo, proveedor.statecode)
      );

      const contactosMapeados = contactosData
        .map(mapearContactoProveedor)
        .filter((contacto) => contacto.activo);

      const proveedoresPorId = new Map(
        proveedoresActivos.map((proveedor) => [
          proveedor.cr22e_proveedoresid,
          proveedor.cr22e_name,
        ])
      );

      const contactosPorProveedor =
        agruparContactosPorProveedor(contactosMapeados);

      const serviciosMapeados = serviciosData
        .map((servicio) =>
          mapearServicioProveedor(
            servicio,
            proveedoresPorId,
            contactosPorProveedor
          )
        )
        .filter((servicio) => servicio.activo)
        .sort((a, b) => a.sucursal.localeCompare(b.sucursal));

      setProveedores(proveedoresActivos);
      setContactos(contactosMapeados);
      setServicios(serviciosMapeados);
    } catch (err) {
      setError(obtenerMensajeError(err));
      setProveedores([]);
      setContactos([]);
      setServicios([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargarCoreSuppliers();
  }, [cargarCoreSuppliers]);

  const resumen = useMemo<CoreSuppliersResumen>(() => {
    const serviciosActivos = servicios.filter(
      (servicio) => servicio.estadoServicio === "Activo"
    ).length;

    const sucursalesCubiertas = new Set(
      servicios
        .map((servicio) => servicio.sucursalId || servicio.sucursal)
        .filter(Boolean)
    ).size;

    const serviciosSinContacto = servicios.filter((servicio) => {
      const tieneSoporte =
        Boolean(servicio.telefonoSoporte) || Boolean(servicio.correoSoporte);

      const tieneContactoProveedor =
        Boolean(servicio.contactoPrincipal?.telefono) ||
        Boolean(servicio.contactoPrincipal?.correo);

      return !tieneSoporte && !tieneContactoProveedor;
    }).length;

    return {
      totalProveedores: proveedores.length,
      serviciosActivos,
      sucursalesCubiertas,
      serviciosSinContacto,
    };
  }, [proveedores.length, servicios]);

  return {
    proveedores,
    contactos,
    servicios,
    isLoading,
    error,

    totalProveedores: resumen.totalProveedores,
    serviciosActivos: resumen.serviciosActivos,
    sucursalesCubiertas: resumen.sucursalesCubiertas,
    serviciosSinContacto: resumen.serviciosSinContacto,

    recargarCoreSuppliers: cargarCoreSuppliers,
  };
}