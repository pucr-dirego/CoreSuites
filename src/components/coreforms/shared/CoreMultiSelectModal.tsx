import { useEffect, useMemo, useState } from "react";

export type CoreMultiSelectOption = {
  id: string;
  label: string;
  description?: string;
};

interface CoreMultiSelectModalProps {
  open: boolean;
  title: string;
  description: string;
  options: CoreMultiSelectOption[];
  selectedIds: string[];
  searchPlaceholder?: string;
  confirmLabel?: string;
  emptyMessage?: string;
  onClose: () => void;
  onConfirm: (selectedIds: string[]) => void;
}

function normalizeText(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("es-MX")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function CoreMultiSelectModal({
  open,
  title,
  description,
  options,
  selectedIds,
  searchPlaceholder = "Buscar...",
  confirmLabel = "Confirmar selección",
  emptyMessage = "No se encontraron opciones.",
  onClose,
  onConfirm,
}: CoreMultiSelectModalProps) {
  const [search, setSearch] = useState("");
  const [draftSelectedIds, setDraftSelectedIds] =
    useState<string[]>(selectedIds);

  useEffect(() => {
    if (!open) {
      return;
    }

    setSearch("");
    setDraftSelectedIds(selectedIds);
  }, [open, selectedIds]);

  const visibleOptions = useMemo(() => {
    const normalizedSearch = normalizeText(search);

    if (!normalizedSearch) {
      return options;
    }

    return options.filter((option) => {
      const searchableText = normalizeText(
        `${option.label} ${option.description || ""}`
      );

      return searchableText.includes(normalizedSearch);
    });
  }, [options, search]);

  if (!open) {
    return null;
  }

  const visibleIds = visibleOptions.map((option) => option.id);

  const allVisibleSelected =
    visibleIds.length > 0 &&
    visibleIds.every((id) => draftSelectedIds.includes(id));

  function toggleOption(optionId: string) {
    setDraftSelectedIds((current) =>
      current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId]
    );
  }

  function toggleAllVisible() {
    setDraftSelectedIds((current) => {
      if (allVisibleSelected) {
        return current.filter((id) => !visibleIds.includes(id));
      }

      return Array.from(new Set([...current, ...visibleIds]));
    });
  }

  function clearSelection() {
    setDraftSelectedIds([]);
  }

  function confirmSelection() {
    onConfirm(draftSelectedIds);
  }

  return (
    <div
      className="coreforms-modal-backdrop coreforms-multiselect-backdrop"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="coreforms-modal coreforms-multiselect-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="coreforms-multiselect-header">
          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>

          <button
            type="button"
            className="coreforms-multiselect-close"
            onClick={onClose}
            aria-label={`Cerrar ${title}`}
            title="Cerrar"
          >
            ×
          </button>
        </header>

        <div className="coreforms-multiselect-toolbar">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={searchPlaceholder}
            autoFocus
          />

          <div className="coreforms-multiselect-toolbar-actions">
            <button
              type="button"
              className="coreforms-secondary-button"
              onClick={toggleAllVisible}
              disabled={visibleOptions.length === 0}
            >
              {allVisibleSelected
                ? "Quitar visibles"
                : "Seleccionar visibles"}
            </button>

            <button
              type="button"
              className="coreforms-secondary-button"
              onClick={clearSelection}
              disabled={draftSelectedIds.length === 0}
            >
              Limpiar selección
            </button>
          </div>
        </div>

        <div className="coreforms-multiselect-summary">
          <strong>{draftSelectedIds.length}</strong>
          <span>
            {draftSelectedIds.length === 1
              ? "opción seleccionada"
              : "opciones seleccionadas"}
          </span>
        </div>

        <div className="coreforms-multiselect-list">
          {visibleOptions.length === 0 ? (
            <div className="coreforms-multiselect-empty">
              {emptyMessage}
            </div>
          ) : (
            visibleOptions.map((option) => {
              const checked = draftSelectedIds.includes(option.id);

              return (
                <label
                  key={option.id}
                  className={`coreforms-multiselect-option ${
                    checked ? "is-selected" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleOption(option.id)}
                  />

                  <span className="coreforms-multiselect-option-copy">
                    <strong>{option.label}</strong>

                    {option.description && (
                      <small>{option.description}</small>
                    )}
                  </span>
                </label>
              );
            })
          )}
        </div>

        <footer className="coreforms-modal-actions coreforms-modal-actions-split">
          <button
            type="button"
            className="coreforms-secondary-button"
            onClick={onClose}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="coreforms-primary-button"
            onClick={confirmSelection}
          >
            {confirmLabel}
          </button>
        </footer>
      </section>
    </div>
  );
}
