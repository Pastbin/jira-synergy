import React from "react";
import { AlertTriangle } from "lucide-react";
import { ConfirmOverlay, ConfirmBox, DangerIcon, DeleteButton, SubmitButton } from "../kanban/BoardStyles";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  isSubmitting?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Удалить",
  isSubmitting = false,
}) => {
  if (!isOpen) return null;

  return (
    <ConfirmOverlay onClick={onClose}>
      <ConfirmBox onClick={(e) => e.stopPropagation()}>
        <DangerIcon>
          <AlertTriangle size={48} />
        </DangerIcon>
        <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "#172b4d" }}>{title}</h3>
        <p style={{ color: "#5e6c84", marginBottom: "2rem", lineHeight: "1.5" }}>{message}</p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              borderRadius: "4px",
              border: "none",
              background: "#ebecf0",
              color: "#42526e",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Отмена
          </button>
          <DeleteButton onClick={onConfirm} disabled={isSubmitting} style={{ padding: "10px 24px" }}>
            {isSubmitting ? "..." : confirmText}
          </DeleteButton>
        </div>
      </ConfirmBox>
    </ConfirmOverlay>
  );
};
