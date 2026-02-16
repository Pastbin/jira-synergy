"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { Plus, X } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

const BoardContainer = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem 0;
  overflow-x: auto;
  min-height: calc(100vh - 200px);
`;

const ColumnContainer = styled.div`
  background-color: #f4f5f7;
  border-radius: 8px;
  width: 300px;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  max-height: 100%;
`;

const ColumnHeader = styled.div`
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #5e6c84;
  text-transform: uppercase;
  font-size: 0.75rem;
`;

const TaskList = styled.div`
  padding: 8px;
  flex: 1;
  overflow-y: auto;
`;

const TaskCardWrapper = styled.div`
  background: white;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  border: 1px solid transparent;

  &:hover {
    background-color: #f4f5f7;
    border-color: #dfe1e6;
  }
`;

const AddTaskButton = styled.button`
  background: transparent;
  border: none;
  color: #42526e;
  padding: 8px 12px;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 4px;
  margin: 4px 8px 8px 8px;

  &:hover {
    background-color: rgba(9, 30, 66, 0.08);
    color: #172b4d;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  width: 400px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  margin: 8px 0 16px 0;
  border: 1px solid #dfe1e6;
  border-radius: 4px;
  &:focus {
    outline: none;
    border-color: #4c9aff;
  }
`;

const SubmitButton = styled.button`
  background-color: #0052cc;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background-color: #0747a6;
  }
`;

interface Task {
  id: string;
  title: string;
  status: string;
}

interface KanbanBoardProps {
  projectId: string;
  tasks: Task[];
  onTaskAdded: () => void;
}

const COLUMNS = [
  { id: "TODO", title: "К выполнению" },
  { id: "IN_PROGRESS", title: "В работе" },
  { id: "REVIEW", title: "Ревью" },
  { id: "TESTING", title: "Тестирование" },
  { id: "DONE", title: "Готово" },
];

export default function KanbanBoard({ projectId, tasks, onTaskAdded }: KanbanBoardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [activeStatus, setActiveStatus] = useState("TODO");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);

  // Синхронизация локального состояния при изменении пропсов
  React.useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const tasksByStatus = (status: string) => localTasks.filter((t) => t.status === status);

  const handleOpenModal = (status: string) => {
    setActiveStatus(status);
    setIsModalOpen(true);
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    // Ничего не меняем, если позиция не изменилась
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    // 1. Оптимистичное обновление локального состояния
    const movingTask = localTasks.find((t) => t.id === draggableId);
    if (!movingTask) return;

    // Создаем новый список задач с обновленным статусом
    const updatedLocalTasks = localTasks.map((t) => {
      if (t.id === draggableId) {
        return { ...t, status: destination.droppableId };
      }
      return t;
    });

    setLocalTasks(updatedLocalTasks);

    // 2. Вызов API в фоновом режиме
    try {
      const res = await fetch(`/api/tasks/${draggableId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: destination.droppableId }),
      });

      if (res.ok) {
        onTaskAdded();
      } else {
        // Если ошибка - возвращаем как было
        setLocalTasks(tasks);
      }
    } catch (err) {
      console.error("Ошибка при перемещении задачи:", err);
      setLocalTasks(tasks);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTaskTitle,
          status: activeStatus,
          projectId,
        }),
      });

      if (res.ok) {
        setNewTaskTitle("");
        setIsModalOpen(false);
        onTaskAdded();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <BoardContainer>
          {COLUMNS.map((column) => (
            <ColumnContainer key={column.id}>
              <ColumnHeader>
                {column.title} <span>{tasksByStatus(column.id).length}</span>
              </ColumnHeader>
              <Droppable droppableId={column.id}>
                {(provided) => (
                  <TaskList {...provided.droppableProps} ref={provided.innerRef}>
                    {tasksByStatus(column.id).map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided) => (
                          <TaskCardWrapper
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <div style={{ fontSize: "0.9rem", color: "#172b4d" }}>{task.title}</div>
                          </TaskCardWrapper>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </TaskList>
                )}
              </Droppable>
              <AddTaskButton onClick={() => handleOpenModal(column.id)}>
                <Plus size={16} /> Добавить задачу
              </AddTaskButton>
            </ColumnContainer>
          ))}
        </BoardContainer>
      </DragDropContext>

      {isModalOpen && (
        <ModalOverlay onClick={() => setIsModalOpen(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0 }}>Новая задача</h3>
              <X size={20} style={{ cursor: "pointer" }} onClick={() => setIsModalOpen(false)} />
            </div>
            <form onSubmit={handleCreateTask}>
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
                  onClick={() => setIsModalOpen(false)}
                  style={{ background: "none", border: "none", color: "#42526e", cursor: "pointer" }}
                >
                  Отмена
                </button>
                <SubmitButton type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "..." : "Создать"}
                </SubmitButton>
              </div>
            </form>
          </Modal>
        </ModalOverlay>
      )}
    </>
  );
}
