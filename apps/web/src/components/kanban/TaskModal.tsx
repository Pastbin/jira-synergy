import React from "react";
import { X, Trash2, Save } from "lucide-react";
import { ModalOverlay, Modal, Input, TextArea, DeleteButton, SubmitButton } from "./BoardStyles";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  order: number;
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTask: Task | null;
  newTaskTitle: string;
  setNewTaskTitle: (val: string) => void;
  editTitle: string;
  setEditTitle: (val: string) => void;
  editDescription: string;
  setEditDescription: (val: string) => void;
  isSubmitting: boolean;
  onCreate: (e: React.FormEvent) => void;
  onUpdate: (e: React.FormEvent) => void;
  onDelete: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  selectedTask,
  newTaskTitle,
  setNewTaskTitle,
  editTitle,
  setEditTitle,
  editDescription,
  setEditDescription,
  isSubmitting,
  onCreate,
  onUpdate,
  onDelete,
}) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: "1.25rem", color: "#172b4d" }}>
            {selectedTask ? "Редактирование задачи" : "Новая задача"}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#6b778c",
              padding: "4px",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#ebecf0")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <X size={20} />
          </button>
        </div>

        {selectedTask ? (
          <form onSubmit={onUpdate}>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ fontSize: "0.85rem", color: "#5e6c84", fontWeight: 700, textTransform: "uppercase" }}>
                Название
              </label>
              <Input
                autoFocus
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ fontSize: "0.85rem", color: "#5e6c84", fontWeight: 700, textTransform: "uppercase" }}>
                Описание
              </label>
              <TextArea
                placeholder="Добавьте описание задачи..."
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "2rem",
                paddingTop: "1.5rem",
                borderTop: "1px solid #ebecf0",
              }}
            >
              <DeleteButton type="button" onClick={onDelete} disabled={isSubmitting}>
                <Trash2 size={16} /> Удалить
              </DeleteButton>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#42526e",
                    cursor: "pointer",
                    padding: "8px 12px",
                    borderRadius: "4px",
                    fontWeight: 500,
                    fontSize: "14px",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#ebecf0")}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  Отмена
                </button>
                <SubmitButton type="submit" disabled={isSubmitting}>
                  <Save size={16} /> {isSubmitting ? "..." : "Сохранить"}
                </SubmitButton>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={onCreate}>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ fontSize: "0.85rem", color: "#5e6c84", fontWeight: 700, textTransform: "uppercase" }}>
                Что нужно сделать?
              </label>
              <Input
                autoFocus
                placeholder="Например: Исправить баг в навигации"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "8px",
                marginTop: "1.5rem",
                paddingTop: "1rem",
                borderTop: "1px solid #ebecf0",
              }}
            >
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: "none",
                  border: "none",
                  color: "#42526e",
                  cursor: "pointer",
                  fontWeight: 500,
                  fontSize: "14px",
                  padding: "8px 12px",
                  borderRadius: "4px",
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#ebecf0")}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                Отмена
              </button>
              <SubmitButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? "..." : "Создать задачу"}
              </SubmitButton>
            </div>
          </form>
        )}
      </Modal>
    </ModalOverlay>
  );
};
