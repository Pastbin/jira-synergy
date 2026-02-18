"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { useSession } from "next-auth/react";
import { getSocket } from "@/lib/socket";
import {
  BoardContainer,
  PresenceBar,
  UserAvatar,
  Toast,
  OnlineBadge,
  SearchInputWrapper,
  SearchInput,
  SearchIconWrapper,
  SettingsButton,
  ModalOverlay,
  Modal,
} from "./kanban/BoardStyles";
import { KanbanColumn } from "./kanban/KanbanColumn";
import { TaskModal } from "./kanban/TaskModal";
import { ConfirmModal } from "./ui/ConfirmModal";
import { AlertCircle, CheckCircle2, Search, Settings, Shield, UserX, X } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  order: number;
  assignees: { id: string; name: string | null; email: string }[];
}

interface KanbanBoardProps {
  projectId: string;
  tasks: Task[];
  onTaskAdded: () => void;
  userRole: string;
}

const COLUMNS = [
  { id: "TODO", title: "К выполнению", color: "#EAE6FF" },
  { id: "IN_PROGRESS", title: "В работе", color: "#DEEBFF" },
  { id: "REVIEW", title: "Ревью", color: "#FFF0B3" },
  { id: "TESTING", title: "Тестирование", color: "#E3FCEF" },
  { id: "DONE", title: "Готово", color: "#D4F1E1" },
];

export default function KanbanBoard({ projectId, tasks, onTaskAdded, userRole }: KanbanBoardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState("MEDIUM");
  const [editAssigneeIds, setEditAssigneeIds] = useState<string[]>([]);
  const [activeStatus, setActiveStatus] = useState("TODO");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | "warning" } | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { data: session } = useSession();
  const socket = getSocket();

  // Локальное состояние задач для оптимистичного обновления
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);

  // Фильтрация задач по поиску
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return localTasks;
    const query = searchQuery.toLowerCase();
    return localTasks.filter(
      (t) => t.title.toLowerCase().includes(query) || (t.description?.toLowerCase() || "").includes(query),
    );
  }, [localTasks, searchQuery]);

  // Загрузка участников проекта
  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/members`);
      if (res.ok) {
        const data = await res.json();
        setProjectMembers(data);
      }
    } catch (err) {
      console.error("Ошибка при загрузке участников:", err);
    }
  }, [projectId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Настройка Socket.io
  useEffect(() => {
    if (session?.user) {
      socket.emit("join_project", {
        projectId,
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
        },
      });
    }

    socket.on("task_updated", () => {
      onTaskAdded();
    });

    socket.on("users_updated", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      // Отписываемся от событий, но не разрываем соединение полностью
      socket.off("task_updated");
      socket.off("users_updated");
    };
  }, [projectId, onTaskAdded, session, socket]);

  // Синхронизация при изменении внешних данных
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  // Группировка и сортировка задач с мемоизацией
  const tasksByStatusMap = useMemo(() => {
    const map: Record<string, Task[]> = {};
    COLUMNS.forEach((col) => {
      map[col.id] = filteredTasks.filter((t) => t.status === col.id).sort((a, b) => a.order - b.order);
    });
    return map;
  }, [filteredTasks]);

  const showToast = (message: string, type: "success" | "error" | "warning" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleOpenCreateModal = useCallback(
    (status: string) => {
      if (userRole === "VIEWER") {
        showToast("У вас нет прав для создания задач", "warning");
        return;
      }
      setActiveStatus(status);
      setNewTaskTitle("");
      setEditDescription("");
      setEditPriority("MEDIUM");
      setEditAssigneeIds([]);
      setSelectedTask(null);
      setIsModalOpen(true);
    },
    [userRole],
  );

  const handleOpenDetailModal = useCallback((task: Task) => {
    setSelectedTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditPriority(task.priority || "MEDIUM");
    setEditAssigneeIds(task.assignees?.map((a) => a.id) || []);
    setIsModalOpen(true);
  }, []);

  const handleUpdateMemberRole = async (userId: string, role: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });
      if (res.ok) {
        showToast("Роль участника обновлена");
        fetchMembers();
      } else {
        const data = await res.json();
        showToast(data.error || "Ошибка", "error");
      }
    } catch (err) {
      showToast("Ошибка сети", "error");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm("Вы уверены, что хотите удалить участника из проекта?")) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "REMOVE" }),
      });
      if (res.ok) {
        showToast("Участник удален");
        fetchMembers();
      } else {
        const data = await res.json();
        showToast(data.error || "Ошибка", "error");
      }
    } catch (err) {
      showToast("Ошибка сети", "error");
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    // Проверка прав на перемещение
    if (userRole === "VIEWER") {
      showToast("У вас нет прав для перемещения задач", "warning");
      return;
    }

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
        const data = await res.json();
        showToast(data.error || "Ошибка при сохранении", "error");
      } else {
        socket?.emit("task_moved", { projectId, taskId: draggableId });
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
          description: editDescription,
          status: activeStatus,
          priority: editPriority,
          projectId,
          assigneeIds: editAssigneeIds,
        }),
      });

      if (res.ok) {
        socket?.emit("task_moved", { projectId });
        setIsModalOpen(false);
        onTaskAdded();
        showToast("Задача создана");
      } else {
        const data = await res.json();
        showToast(data.error || "Ошибка при создании", "error");
      }
    } catch (err) {
      console.error("Ошибка при создании задачи:", err);
      showToast("Ошибка сети", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !editTitle.trim()) return;

    if (userRole === "VIEWER") {
      showToast("У вас нет прав для изменения задач", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          priority: editPriority,
          assigneeIds: editAssigneeIds,
        }),
      });

      if (res.ok) {
        socket?.emit("task_moved", { projectId });
        setIsModalOpen(false);
        onTaskAdded();
        showToast("Задача успешно обновлена");
      } else {
        const data = await res.json();
        showToast(data.error || "Ошибка при обновлении", "error");
      }
    } catch (err) {
      console.error("Ошибка при обновлении задачи:", err);
      showToast("Ошибка сети", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    if (userRole === "VIEWER") {
      showToast("У вас нет прав для удаления задач", "warning");
      return;
    }
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedTask) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        socket?.emit("task_moved", { projectId });
        setIsDeleteConfirmOpen(false);
        setIsModalOpen(false);
        onTaskAdded();
        showToast("Задача удалена");
      } else {
        const data = await res.json();
        showToast(data.error || "Ошибка при удалении", "error");
      }
    } catch (err) {
      console.error("Ошибка при удалении задачи:", err);
      showToast("Ошибка сети", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onlineUserIds = useMemo(() => new Set(onlineUsers.map((u) => u.id)), [onlineUsers]);

  return (
    <>
      <PresenceBar>
        <span style={{ fontSize: "0.8rem", color: "#5e6c84", marginRight: "8px" }}>Команда:</span>
        {projectMembers.map((member, idx) => {
          const isUserOnline = onlineUserIds.has(member.id);
          return (
            <div key={member.id} style={{ position: "relative" }}>
              <UserAvatar
                $color={["#0052cc", "#00875a", "#de350b", "#ff991f", "#5243aa"][idx % 5]}
                title={`${member.name || member.email} (${isUserOnline ? "В сети" : "Не в сети"})`}
                style={{ opacity: isUserOnline ? 1 : 0.6, filter: isUserOnline ? "none" : "grayscale(0.5)" }}
              >
                {(member.name || member.email || "?")[0].toUpperCase()}
              </UserAvatar>
              <OnlineBadge $isOnline={isUserOnline} />
            </div>
          );
        })}

        <SearchInputWrapper>
          <SearchIconWrapper>
            <Search size={18} />
          </SearchIconWrapper>
          <SearchInput
            placeholder="Поиск по задачам..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchInputWrapper>

        {(userRole === "ADMIN" || session?.user?.id === projectMembers.find((m) => m.role === "ADMIN")?.id) && (
          <SettingsButton title="Настройки команды" onClick={() => setIsSettingsOpen(true)}>
            <Settings size={20} />
          </SettingsButton>
        )}

        <span style={{ fontSize: "0.8rem", color: "#5e6c84", marginLeft: "12px" }}>
          Ваша роль: <strong>{userRole}</strong>
        </span>
      </PresenceBar>

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
        projectId={projectId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedTask={selectedTask}
        newTaskTitle={newTaskTitle}
        setNewTaskTitle={setNewTaskTitle}
        editTitle={editTitle}
        setEditTitle={setEditTitle}
        editDescription={editDescription}
        setEditDescription={setEditDescription}
        editPriority={editPriority}
        setEditPriority={setEditPriority}
        editAssigneeIds={editAssigneeIds}
        setEditAssigneeIds={setEditAssigneeIds}
        projectMembers={projectMembers}
        isSubmitting={isSubmitting}
        onCreate={handleCreateTask}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
      />

      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Удалить задачу?"
        message={`Вы уверены, что хотите безвозвратно удалить задачу "${selectedTask?.title}"? Это действие нельзя будет отменить.`}
        isSubmitting={isSubmitting}
      />

      {notification && (
        <Toast $type={notification.type}>
          {notification.type === "success" && <CheckCircle2 size={18} />}
          {notification.type !== "success" && <AlertCircle size={18} />}
          {notification.message}
        </Toast>
      )}

      {isSettingsOpen && (
        <ModalOverlay onClick={() => setIsSettingsOpen(false)}>
          <Modal onClick={(e) => e.stopPropagation()} style={{ width: "600px" }}>
            <div
              style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem", alignItems: "center" }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "1.25rem",
                  color: "#172b4d",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Shield size={24} color="#0052cc" /> Управление командой
              </h3>
              <button
                onClick={() => setIsSettingsOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#6b778c" }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
              {projectMembers.map((member) => (
                <div
                  key={member.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px",
                    borderBottom: "1px solid #ebecf0",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <UserAvatar $color="#0052cc" style={{ width: 40, height: 40, fontSize: 16 }}>
                      {(member.name || member.email)[0].toUpperCase()}
                    </UserAvatar>
                    <div>
                      <div style={{ fontWeight: 600, color: "#172b4d" }}>{member.name || "Без имени"}</div>
                      <div style={{ fontSize: "12px", color: "#6b778c" }}>{member.email}</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {member.role === "ADMIN" ? (
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#0052cc",
                          background: "#deebff",
                          padding: "4px 8px",
                          borderRadius: "4px",
                        }}
                      >
                        ВЛАДЕЛЕЦ
                      </span>
                    ) : (
                      <>
                        <select
                          value={member.role}
                          onChange={(e) => handleUpdateMemberRole(member.id, e.target.value)}
                          style={{ padding: "6px", borderRadius: "4px", border: "1px solid #dfe1e6", fontSize: "13px" }}
                        >
                          <option value="EDITOR">Редактор</option>
                          <option value="VIEWER">Наблюдатель</option>
                          <option value="ADMIN">Администратор</option>
                        </select>
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#de350b",
                            cursor: "pointer",
                            display: "flex",
                          }}
                          title="Удалить из проекта"
                        >
                          <UserX size={20} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setIsSettingsOpen(false)}
                style={{
                  background: "#0052cc",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                Готово
              </button>
            </div>
          </Modal>
        </ModalOverlay>
      )}
    </>
  );
}
