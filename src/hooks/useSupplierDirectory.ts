import { useCallback, useEffect, useMemo, useState } from "react";
import { supplierDirectoryService } from "../services/supplierDirectoryService";
import type {
  SupplierAssignmentPayload,
  SupplierContactPayload,
  SupplierDetail,
  SupplierDirectoryFilters,
  SupplierGeneralUpdatePayload,
  SupplierListItem,
} from "../interfaces/supplierDirectory";

const defaultFilters: SupplierDirectoryFilters = {
  search: "",
  status: "todos",
  serviceId: "todos",
  branchId: "todos",
  alertType: "todos",
};

export function useSupplierDirectory() {
  const [filters, setFilters] = useState<SupplierDirectoryFilters>(defaultFilters);
  const [suppliers, setSuppliers] = useState<SupplierListItem[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [selectedSupplierDetail, setSelectedSupplierDetail] = useState<SupplierDetail | null>(null);

  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.search.trim() !== "" ||
      filters.status !== "todos" ||
      filters.serviceId !== "todos" ||
      filters.branchId !== "todos" ||
      filters.alertType !== "todos"
    );
  }, [filters]);

  const loadSuppliers = useCallback(async () => {
    try {
      setIsLoadingList(true);
      setErrorMessage(null);

      const data = await supplierDirectoryService.getSuppliers(filters);
      setSuppliers(data);
    } catch (error) {
      console.error(error);
      setErrorMessage("No se pudieron cargar los proveedores.");
    } finally {
      setIsLoadingList(false);
    }
  }, [filters]);

  const loadSupplierDetail = useCallback(async (supplierId: string) => {
    try {
      setIsLoadingDetail(true);
      setErrorMessage(null);
      setSelectedSupplierId(supplierId);

      const detail = await supplierDirectoryService.getSupplierDetail(supplierId);
      setSelectedSupplierDetail(detail);
    } catch (error) {
      console.error(error);
      setErrorMessage("No se pudo cargar el detalle del proveedor.");
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  const closeSupplierDetail = useCallback(() => {
    setSelectedSupplierId(null);
    setSelectedSupplierDetail(null);
    setIsLoadingDetail(false);
  }, []);



  const refreshSelectedSupplier = useCallback(async () => {
    if (!selectedSupplierId) return;

    const detail = await supplierDirectoryService.getSupplierDetail(selectedSupplierId);
    setSelectedSupplierDetail(detail);
  }, [selectedSupplierId]);

  const updateGeneralInfo = useCallback(
    async (payload: SupplierGeneralUpdatePayload) => {
      try {
        setIsSaving(true);
        setErrorMessage(null);

        await supplierDirectoryService.updateSupplierGeneralInfo(payload);
        await loadSuppliers();
        await refreshSelectedSupplier();
      } catch (error) {
        console.error(error);
        setErrorMessage("No se pudieron guardar los datos generales.");
      } finally {
        setIsSaving(false);
      }
    },
    [loadSuppliers, refreshSelectedSupplier]
  );

  const saveContact = useCallback(
    async (payload: SupplierContactPayload) => {
      try {
        setIsSaving(true);
        setErrorMessage(null);

        await supplierDirectoryService.upsertSupplierContact(payload);
        await loadSuppliers();
        await refreshSelectedSupplier();
      } catch (error) {
        console.error(error);
        setErrorMessage("No se pudo guardar el contacto.");
      } finally {
        setIsSaving(false);
      }
    },
    [loadSuppliers, refreshSelectedSupplier]
  );

  const saveAssignment = useCallback(
    async (payload: SupplierAssignmentPayload) => {
      try {
        setIsSaving(true);
        setErrorMessage(null);

        await supplierDirectoryService.upsertSupplierAssignment(payload);
        await loadSuppliers();
        await refreshSelectedSupplier();
      } catch (error) {
        console.error(error);
        setErrorMessage("No se pudo guardar la asignación.");
      } finally {
        setIsSaving(false);
      }
    },
    [loadSuppliers, refreshSelectedSupplier]
  );

  const setSupplierStatus = useCallback(
    async (supplierId: string, status: "activo" | "inactivo") => {
      try {
        setIsSaving(true);
        setErrorMessage(null);

        await supplierDirectoryService.setSupplierStatus(supplierId, status);
        await loadSuppliers();
        await refreshSelectedSupplier();
      } catch (error) {
        console.error(error);
        setErrorMessage("No se pudo actualizar el estado del proveedor.");
      } finally {
        setIsSaving(false);
      }
    },
    [loadSuppliers, refreshSelectedSupplier]
  );

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  return {
    filters,
    setFilters,
    clearFilters,
    hasActiveFilters,

    suppliers,
    selectedSupplierId,
    selectedSupplierDetail,

    isLoadingList,
    isLoadingDetail,
    isSaving,
    errorMessage,

    loadSupplierDetail,
    closeSupplierDetail,
    updateGeneralInfo,
    saveContact,
    saveAssignment,
    setSupplierStatus,
  };
}