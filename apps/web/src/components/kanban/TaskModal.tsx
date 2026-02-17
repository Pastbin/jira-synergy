import React, { useState, useEffect } from "react";
import { X, Trash2, Save, MessageSquare, History, Send, Edit3, ArrowRightCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { getSocket } from "@/lib/socket";
import {
  ModalOverlay,
  Modal,
  Input,
  TextArea,
  DeleteButton,
  SubmitButton,
  TabContainer,
  Tab,
  CommentContainer,
  CommentItem,
  AvatarCircle,
  CommentContent,
  CommentHeader,
  CommentTime,
  ActivityItem,
  ActivityText,
  PriorityBadge,
  AssigneeList,
  AssigneeItem,
  OnlineBadge,
} from "./BoardStyles";

// Вспомогательная функция для форматирования даты
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Вспомогательная функция для получения инициалов
const getInitials = (name?: string | null) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  order: number;
  assignees: { id: string; name: string | null; email: string }[];
}

interface TaskComment {
  id: string;
  text: string;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface TaskActivity {
  id: string;
  type: string;
  content: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface TaskModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  selectedTask: Task | null;
  newTaskTitle: string;
  setNewTaskTitle: (val: string) => void;
  editTitle: string;
  setEditTitle: (val: string) => void;
  editDescription: string;
  setEditDescription: (val: string) => void;
  editPriority: string;
  setEditPriority: (val: string) => void;
  editAssigneeIds: string[];
  setEditAssigneeIds: (val: string[] | ((prev: string[]) => string[])) => void;
  projectMembers: { id: string; name: string | null; email: string }[];
  isSubmitting: boolean;
  onCreate: (e: React.FormEvent) => void;
  onUpdate: (e: React.FormEvent) => void;
  onDelete: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  projectId,
  isOpen,
  onClose,
  selectedTask,
  newTaskTitle,
  setNewTaskTitle,
  editTitle,
  setEditTitle,
  editDescription,
  setEditDescription,
  editPriority,
  setEditPriority,
  editAssigneeIds,
  setEditAssigneeIds,
  projectMembers,
  isSubmitting,
  onCreate,
  onUpdate,
  onDelete,
}) => {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"comments" | "activity">("comments");
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [activities, setActivities] = useState<TaskActivity[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    if (isOpen && selectedTask) {
      fetchDetails();

      // Слушаем новые комментарии через сокеты
      const socket = getSocket();
      const handleNewComment = (data: { taskId: string; comment: TaskComment }) => {
        if (data.taskId === selectedTask.id) {
          setComments((prev) => [data.comment, ...prev]);
        }
      };

      socket.on("comment_received", handleNewComment);

      return () => {
        socket.off("comment_received", handleNewComment);
      };
    }
  }, [isOpen, selectedTask]);

  const fetchDetails = async () => {
    if (!selectedTask) return;
    setIsLoadingDetails(true);
    try {
      const [comRes, actRes] = await Promise.all([
        fetch(`/api/tasks/${selectedTask.id}/comments`),
        fetch(`/api/tasks/${selectedTask.id}/activities`),
      ]);

      if (comRes.ok) setComments(await comRes.json());
      if (actRes.ok) setActivities(await actRes.json());
    } catch (err) {
      console.error("Ошибка при загрузке деталей задачи:", err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handlePostComment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newComment.trim() || !selectedTask) return;

    setIsPostingComment(true);
    try {
      const res = await fetch(`/api/tasks/${selectedTask.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newComment }),
      });

      if (res.ok) {
        const addedComment = await res.json();
        setComments((prev) => [addedComment, ...prev]);
        setNewComment("");

        // Уведомляем других через сокет
        const socket = getSocket();
        socket.emit("new_comment", {
          projectId,
          taskId: selectedTask.id,
          comment: addedComment,
        });
      }
    } catch (err) {
      console.error("Ошибка при добавлении комментария:", err);
    } finally {
      setIsPostingComment(false);
    }
  };

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

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ fontSize: "0.85rem", color: "#5e6c84", fontWeight: 700, textTransform: "uppercase" }}>
                Приоритет
              </label>
              <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                {["LOW", "MEDIUM", "HIGH", "URGENT"].map((p) => (
                  <PriorityBadge
                    key={p}
                    $priority={p}
                    style={{
                      cursor: "pointer",
                      opacity: editPriority === p ? 1 : 0.4,
                      border: editPriority === p ? "2px solid #0052cc" : "2px solid transparent",
                      padding: "4px 8px",
                    }}
                    onClick={() => setEditPriority(p)}
                  >
                    {p === "LOW" ? "Низкий" : p === "MEDIUM" ? "Средний" : p === "HIGH" ? "Высокий" : "Критический"}
                  </PriorityBadge>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ fontSize: "0.85rem", color: "#5e6c84", fontWeight: 700, textTransform: "uppercase" }}>
                Исполнители
              </label>
              <AssigneeList>
                {projectMembers.map((member) => {
                  const isSelected = editAssigneeIds.includes(member.id);
                  return (
                    <AssigneeItem
                      key={member.id}
                      $selected={isSelected}
                      onClick={() => {
                        setEditAssigneeIds((prev) =>
                          isSelected ? prev.filter((id) => id !== member.id) : [...prev, member.id],
                        );
                      }}
                    >
                      <AvatarCircle style={{ width: 24, height: 24, fontSize: 10 }}>
                        {getInitials(member.name)}
                      </AvatarCircle>
                      {member.name || member.email}
                    </AssigneeItem>
                  );
                })}
              </AssigneeList>
            </div>

            <TabContainer>
              <Tab type="button" $active={activeTab === "comments"} onClick={() => setActiveTab("comments")}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <MessageSquare size={16} />
                  Комментарии ({comments.length})
                </div>
              </Tab>
              <Tab type="button" $active={activeTab === "activity"} onClick={() => setActiveTab("activity")}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <History size={16} />
                  История
                </div>
              </Tab>
            </TabContainer>

            {activeTab === "comments" ? (
              <div>
                <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
                  <AvatarCircle $color="#4c9aff">{getInitials(session?.user?.name)}</AvatarCircle>
                  <div style={{ flex: 1, position: "relative" }}>
                    <Input
                      placeholder="Напишите комментарий..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      disabled={isPostingComment}
                      style={{ paddingRight: "40px", marginBottom: 0 }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handlePostComment();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handlePostComment}
                      disabled={isPostingComment || !newComment.trim()}
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: newComment.trim() ? "#0052cc" : "#dfe1e6",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>

                <CommentContainer>
                  {isLoadingDetails ? (
                    <p style={{ textAlign: "center", color: "#6b778c" }}>Загрузка...</p>
                  ) : comments.length === 0 ? (
                    <p style={{ textAlign: "center", color: "#6b778c", padding: "10px 0" }}>
                      Комментариев пока нет. Будьте первым!
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <CommentItem key={comment.id}>
                        <AvatarCircle>{getInitials(comment.author.name)}</AvatarCircle>
                        <CommentContent>
                          <CommentHeader>
                            {comment.author.name || "Пользователь"}
                            <CommentTime>{formatDate(comment.createdAt)}</CommentTime>
                          </CommentHeader>
                          {comment.text}
                        </CommentContent>
                      </CommentItem>
                    ))
                  )}
                </CommentContainer>
              </div>
            ) : (
              <CommentContainer>
                {isLoadingDetails ? (
                  <p style={{ textAlign: "center", color: "#6b778c" }}>Загрузка...</p>
                ) : activities.length === 0 ? (
                  <p style={{ textAlign: "center", color: "#6b778c" }}>История пуста</p>
                ) : (
                  activities.map((activity) => (
                    <ActivityItem key={activity.id}>
                      {activity.type === "STATUS_CHANGE" ? (
                        <ArrowRightCircle size={16} style={{ color: "#0052cc" }} />
                      ) : activity.type === "PRIORITY_CHANGE" ? (
                        <ArrowRightCircle size={16} style={{ color: "#ff8b00", transform: "rotate(-90deg)" }} />
                      ) : (
                        <Edit3 size={16} style={{ color: "#4c9aff" }} />
                      )}
                      <ActivityText>
                        <span>{activity.user?.name || activity.user?.email || "Система"}</span>{" "}
                        {activity.type === "STATUS_CHANGE" ? (
                          <>
                            изменил статус на <strong>{activity.content}</strong>
                          </>
                        ) : activity.type === "TITLE_CHANGE" ? (
                          <>
                            обновил название: <strong>{activity.content}</strong>
                          </>
                        ) : activity.type === "PRIORITY_CHANGE" ? (
                          <>
                            изменил приоритет: <strong>{activity.content}</strong>
                          </>
                        ) : (
                          activity.content
                        )}
                        <em>{formatDate(activity.createdAt)}</em>
                      </ActivityText>
                    </ActivityItem>
                  ))
                )}
              </CommentContainer>
            )}

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

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ fontSize: "0.85rem", color: "#5e6c84", fontWeight: 700, textTransform: "uppercase" }}>
                Описание
              </label>
              <TextArea
                placeholder="Добавьте подробности..."
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ fontSize: "0.85rem", color: "#5e6c84", fontWeight: 700, textTransform: "uppercase" }}>
                Приоритет
              </label>
              <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                {["LOW", "MEDIUM", "HIGH", "URGENT"].map((p) => (
                  <PriorityBadge
                    key={p}
                    $priority={p}
                    style={{
                      cursor: "pointer",
                      opacity: editPriority === p ? 1 : 0.4,
                      border: editPriority === p ? "2px solid #0052cc" : "2px solid transparent",
                      padding: "4px 8px",
                    }}
                    onClick={() => setEditPriority(p)}
                  >
                    {p === "LOW" ? "Низкий" : p === "MEDIUM" ? "Средний" : p === "HIGH" ? "Высокий" : "Критический"}
                  </PriorityBadge>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ fontSize: "0.85rem", color: "#5e6c84", fontWeight: 700, textTransform: "uppercase" }}>
                Исполнители
              </label>
              <AssigneeList>
                {projectMembers.map((member) => {
                  const isSelected = editAssigneeIds.includes(member.id);
                  return (
                    <AssigneeItem
                      key={member.id}
                      $selected={isSelected}
                      onClick={() => {
                        setEditAssigneeIds((prev) =>
                          isSelected ? prev.filter((id) => id !== member.id) : [...prev, member.id],
                        );
                      }}
                    >
                      <AvatarCircle style={{ width: 24, height: 24, fontSize: 10 }}>
                        {getInitials(member.name)}
                      </AvatarCircle>
                      {member.name || member.email}
                    </AssigneeItem>
                  );
                })}
              </AssigneeList>
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
