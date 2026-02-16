"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { BoardContainer } from "./kanban/BoardStyles";
import { KanbanColumn } from "./kanban/KanbanColumn";
import { TaskModal } from "./kanban/TaskModal";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  order: number;
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
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [activeStatus, setActiveStatus] = useState("TODO");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Локальное состояние задач для оптимистичного обновления
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);

  // Синхронизация при изменении внешних данных
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  // Группировка и сортировка задач с мемоизацией
  const tasksByStatusMap = useMemo(() => {
    const map: Record<string, Task[]> = {};
    COLUMNS.forEach((col) => {
      map[col.id] = localTasks.filter((t) => t.status === col.id).sort((a, b) => a.order - b.order);
    });
    return map;
  }, [localTasks]);

  const handleOpenCreateModal = useCallback((status: string) => {
    setActiveStatus(status);
    setNewTaskTitle("");
    setSelectedTask(null);
    setIsModalOpen(true);
  }, []);

  const handleOpenDetailModal = useCallback((task: Task) => {
    setSelectedTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setIsModalOpen(true);
  }, []);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    // Если ничего не изменилось
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const taskToMove = localTasks.find((t) => t.id === draggableId);
    if (!taskToMove) return;

    // Рассчитываем новый порядок
    const destTasks = tasksByStatusMap[destination.droppableId] || [];
    // Исключаем перемещаемую задачу из списка целевой колонки (если она там уже была)
    const filteredDestTasks = destTasks.filter((t) => t.id !== draggableId);

    let calculatedOrder: number;
    const prevTask = filteredDestTasks[destination.index - 1];
    const nextTask = filteredDestTasks[destination.index];

    if (!prevTask && !nextTask) {
      calculatedOrder = 1000;
    } else if (!prevTask) {
      calculatedOrder = nextTask.order / 2;
    } else if (!nextTask) {
      calculatedOrder = prevTask.order + 1000;
    } else {
      calculatedOrder = (prevTask.order + nextTask.order) / 2;
    }

    // Оптимистичное обновление
    const updatedTask = { ...taskToMove, status: destination.droppableId, order: calculatedOrder };
    setLocalTasks((prev) => prev.map((t) => (t.id === draggableId ? updatedTask : t)));

    try {
      const res = await fetch(`/api/tasks/${draggableId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: destination.droppableId,
          order: calculatedOrder,
        }),
      });

      if (!res.ok) {
        // Откат при ошибке
        setLocalTasks(tasks);
      } else {
        // Уведомляем родителя, но не сбрасываем локальный стейт,
        // чтобы избежать мерцания (useEffect подхватит новые данные позже)
        onTaskAdded();
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
        setIsModalOpen(false);
        onTaskAdded();
      }
    } catch (err) {
      console.error("Ошибка при создании задачи:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !editTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        onTaskAdded();
      }
    } catch (err) {
      console.error("Ошибка при обновлении задачи:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    if (!confirm("Вы уверены, что хотите удалить эту задачу?")) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setIsModalOpen(false);
        onTaskAdded();
      }
    } catch (err) {
      console.error("Ошибка при удалении задачи:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <BoardContainer>
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              tasks={tasksByStatusMap[col.id] || []}
              onAddTask={handleOpenCreateModal}
              onTaskClick={handleOpenDetailModal}
            />
          ))}
        </BoardContainer>
      </DragDropContext>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedTask={selectedTask}
        newTaskTitle={newTaskTitle}
        setNewTaskTitle={setNewTaskTitle}
        editTitle={editTitle}
        setEditTitle={setEditTitle}
        editDescription={editDescription}
        setEditDescription={setEditDescription}
        isSubmitting={isSubmitting}
        onCreate={handleCreateTask}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
      />
    </>
  );
}
