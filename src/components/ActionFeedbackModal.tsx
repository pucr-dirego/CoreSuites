import "../styles/actionFeedbackModal.css";

type FeedbackType = "success" | "error" | "warning" | "info";

interface ActionFeedbackModalProps {
  open: boolean;
  type?: FeedbackType;
  title: string;
  message: string;
  buttonText?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm?: () => void;
}

export default function ActionFeedbackModal({
  open,
  type = "success",
  title,
  message,
  buttonText = "Entendido",
  confirmText,
  cancelText = "Cancelar",
  isLoading = false,
  onClose,
  onConfirm,
}: ActionFeedbackModalProps) {
  if (!open) return null;

  const iconByType: Record<FeedbackType, string> = {
    success: "✓",
    error: "!",
    warning: "!",
    info: "i",
  };

  const esModalConfirmacion = Boolean(onConfirm);

  return (
    <div className="feedback-backdrop" role="dialog" aria-modal="true">
      <div className={`feedback-modal feedback-${type}`}>
        <div className="feedback-icon">{iconByType[type]}</div>

        <h2>{title}</h2>

        <p>{message}</p>

        {esModalConfirmacion ? (
          <div className="feedback-actions">
            <button
              type="button"
              className="feedback-button feedback-button-secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelText}
            </button>

            <button
              type="button"
              className="feedback-button"
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? "Procesando..." : confirmText ?? "Confirmar"}
            </button>
          </div>
        ) : (
          <button className="feedback-button" onClick={onClose}>
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
}