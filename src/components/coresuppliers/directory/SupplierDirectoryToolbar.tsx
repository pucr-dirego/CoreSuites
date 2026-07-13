import type { Dispatch, SetStateAction } from "react";
import type { SupplierDirectoryFilters } from "../../../interfaces/supplierDirectory";

interface SupplierDirectoryToolbarProps {
  filters: SupplierDirectoryFilters;
  onChangeFilters: Dispatch<SetStateAction<SupplierDirectoryFilters>>;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function SupplierDirectoryToolbar({
  filters,
  onChangeFilters,
  onClearFilters,
  hasActiveFilters,
}: SupplierDirectoryToolbarProps) {
  return (
    <section className="supplier-directory-toolbar">
      <div className="supplier-directory-search">
        <label htmlFor="supplier-search">Buscar proveedor</label>
        <input
          id="supplier-search"
          type="search"
          placeholder="Nombre, razón social, RFC, contacto, servicio o sucursal..."
          value={filters.search}
          onChange={(event) =>
            onChangeFilters((current) => ({
              ...current,
              search: event.target.value,
            }))
          }
        />
      </div>

      <div className="supplier-directory-filters">
        <div className="supplier-filter-field">
          <label htmlFor="supplier-status-filter">Estado</label>
          <select
            id="supplier-status-filter"
            value={filters.status}
            onChange={(event) =>
              onChangeFilters((current) => ({
                ...current,
                status: event.target.value as SupplierDirectoryFilters["status"],
              }))
            }
          >
            <option value="todos">Todos</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
            <option value="observacion">En observación</option>
            <option value="pendiente">Pendientes</option>
          </select>
        </div>

        <div className="supplier-filter-field">
          <label htmlFor="supplier-service-filter">Servicio</label>
          <input
            id="supplier-service-filter"
            type="text"
            placeholder="Internet, CCTV, impresión..."
            value={filters.serviceId === "todos" ? "" : filters.serviceId}
            onChange={(event) =>
              onChangeFilters((current) => ({
                ...current,
                serviceId: event.target.value.trim() || "todos",
              }))
            }
          />
        </div>

        <div className="supplier-filter-field">
          <label htmlFor="supplier-branch-filter">Sucursal</label>
          <input
            id="supplier-branch-filter"
            type="text"
            placeholder="Tampico, Saltillo, CEDIS..."
            value={filters.branchId === "todos" ? "" : filters.branchId}
            onChange={(event) =>
              onChangeFilters((current) => ({
                ...current,
                branchId: event.target.value.trim() || "todos",
              }))
            }
          />
        </div>

        <div className="supplier-filter-field">
          <label htmlFor="supplier-alert-filter">Alertas</label>
          <select
            id="supplier-alert-filter"
            value={filters.alertType}
            onChange={(event) =>
              onChangeFilters((current) => ({
                ...current,
                alertType: event.target.value as SupplierDirectoryFilters["alertType"],
              }))
            }
          >
            <option value="todos">Todas</option>
            <option value="sin_contacto">Sin contacto</option>
            <option value="sin_servicios">Sin servicios</option>
            <option value="datos_incompletos">Datos incompletos</option>
          </select>
        </div>

        <button
          type="button"
          className="supplier-clear-filters-button"
          onClick={onClearFilters}
          disabled={!hasActiveFilters}
        >
          Limpiar filtros
        </button>
      </div>
    </section>
  );
}