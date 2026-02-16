import React from "react";
import { X, Trash2, Save } from "lucide-react";
import { ModalOverlay, Modal, Input, TextArea, DeleteButton, SubmitButton } from "./BoardStyles";

interface Task {
  id: string;
  title: string;
  description?: string;
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
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h3 style={{ margin: 0 }}>{selectedTask ? "Редактирование задачи" : "Новая задача"}</h3>
          <X size={20} style={{ cursor: "pointer" }} onClick={onClose} />
        </div>

        {selectedTask ? (
          <form onSubmit={onUpdate}>
            <label style={{ fontSize: "0.85rem", color: "#5e6c84", fontWeight: 600 }}>Название</label>
            <Input autoFocus value={editTitle} onChange={(e) => setEditTitle(e.target.value)} disabled={isSubmitting} />

            <label style={{ fontSize: "0.85rem", color: "#5e6c84", fontWeight: 600 }}>Описание</label>
            <TextArea
              placeholder="Добавьте описание задачи..."
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              disabled={isSubmitting}
            />

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
              <DeleteButton type="button" onClick={onDelete} disabled={isSubmitting}>
                <Trash2 size={16} /> Удалить
              </DeleteButton>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{ background: "none", border: "none", color: "#42526e", cursor: "pointer" }}
                >
                  Отмена
                </button>
                <SubmitButton type="submit" disabled={isSubmitting}>
                  <Save size={16} /> {isSubmitting ? "Сохранение..." : "Сохранить"}
                </SubmitButton>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={onCreate}>
            <label style={{ fontSize: "0.85rem", color: "#5e6c84" }}>Что нужно сделать?</label>
            <Input
              autoFocus
              placeholder="Название задачи..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              disabled={isSubmitting}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button
                type="button"
                onClick={onClose}
                style={{ background: "none", border: "none", color: "#42526e", cursor: "pointer" }}
              >
                Отмена
              </button>
              <SubmitButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? "..." : "Создать"}
              </SubmitButton>
            </div>
          </form>
        )}
      </Modal>
    </ModalOverlay>
  );
};
