"use client";

import { useState, useEffect } from "react";
import styled from "styled-components";
import { Plus, Trash2, FolderPlus } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { getSocket } from "@/lib/socket";

const MainContent = styled.div`
  padding: 2rem;
`;

// Сетка карточек проектов
const ProjectGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

// Карточка проекта
const ProjectCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  border-left: 5px solid #0052cc;
  position: relative;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:hover .delete-btn {
    opacity: 1;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  border: 2px dashed #dfe1e6;
  margin-top: 2rem;
  text-align: center;
  color: #5e6c84;

  svg {
    color: #0052cc;
    margin-bottom: 1.5rem;
    opacity: 0.5;
  }

  h2 {
    color: #172b4d;
    margin-bottom: 0.5rem;
  }

  p {
    max-width: 400px;
    margin-bottom: 2rem;
  }
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid #ebecf0;
  border-radius: 4px;
  padding: 6px;
  color: #de350b;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #ffebe6;
    border-color: #ff5230;
    transform: scale(1.1);
  }
`;

// Кнопка создания проекта
const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #0052cc;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    background-color: #0747a6;
  }
`;

// Модальное окно (современный Jira-стиль)
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(9, 30, 66, 0.54);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
  animation: fadeIn 0.15s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const Modal = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  box-shadow:
    0 20px 40px -12px rgba(9, 30, 66, 0.25),
    0 0 1px rgba(9, 30, 66, 0.31);
  animation: slideUp 0.2s ease-out;

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const FormLabel = styled.label`
  display: block;
  font-size: 0.85rem;
  color: #5e6c84;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 8px;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #dfe1e6;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #4c9aff;
    box-shadow: 0 0 0 2px rgba(76, 154, 255, 0.2);
  }
`;

const FormTextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #dfe1e6;
  border-radius: 6px;
  min-height: 120px;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #4c9aff;
    box-shadow: 0 0 0 2px rgba(76, 154, 255, 0.2);
  }
`;

const Notification = styled.div`
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: #172b4d;
  color: white;
  padding: 12px 24px;
  border-radius: 30px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  z-index: 2000;
  animation: slideUpFade 0.3s ease-out;

  @keyframes slideUpFade {
    from {
      transform: translate(-50%, 20px);
      opacity: 0;
    }
    to {
      transform: translate(-50%, 0);
      opacity: 1;
    }
  }
`;

interface Project {
  id: string;
  name: string;
  description: string | null;
}

export default function ProjectsPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  // Состояние для подтверждения удаления
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; projectId: string | null }>({
    isOpen: false,
    projectId: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  useEffect(() => {
    fetchProjects();

    // Настройка сокетов для получения уведомлений в реальном времени
    const socket = getSocket();

    if (session?.user?.email) {
      socket.emit("authenticate", { email: session.user.email });

      socket.on("project_added", (project: Project) => {
        setProjects((prev) => {
          // Избегаем дубликатов
          if (prev.some((p) => p.id === project.id)) return prev;
          return [project, ...prev];
        });
        setNotification(`Вас добавили в новый проект: "${project.name}"`);
        setTimeout(() => setNotification(null), 5000);
      });
    }

    return () => {
      socket.off("project_added");
    };
  }, [session]);

  const fetchProjects = async () => {
    const res = await fetch("/api/projects");
    if (res.ok) {
      const data = await res.json();
      setProjects(data);
    }
    setLoading(false);
  };

  // Обработка создания проекта
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProject),
    });

    if (res.ok) {
      setIsModalOpen(false);
      setNewProject({ name: "", description: "" });
      fetchProjects();
    }
  };

  const openDeleteModal = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteConfirmation({ isOpen: true, projectId: id });
  };

  const handleConfirmDelete = async () => {
    const id = deleteConfirmation.projectId;
    if (!id) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setProjects(projects.filter((p) => p.id !== id));
        setNotification("Проект успешно удален");
        setTimeout(() => setNotification(null), 3000);
      } else {
        const data = await res.json();
        setNotification(data.error || "Ошибка при удалении");
        setTimeout(() => setNotification(null), 5000);
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      setNotification("Не удалось удалить проект");
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsDeleting(false);
      setDeleteConfirmation({ isOpen: false, projectId: null });
    }
  };

  return (
    <MainContent>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Ваши проекты</h1>
        <CreateButton onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Создать проект
        </CreateButton>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "4rem" }}>
          <LoadingSpinner />
        </div>
      ) : projects.length > 0 ? (
        <ProjectGrid>
          {projects.map((project) => (
            <Link
              href={`/projects/${project.id}`}
              key={project.id}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <ProjectCard>
                <DeleteButton className="delete-btn" onClick={(e) => openDeleteModal(e, project.id)}>
                  <Trash2 size={16} />
                </DeleteButton>
                <h3>{project.name}</h3>
                <p style={{ color: "#5e6c84", fontSize: "0.9rem", marginTop: "0.5rem" }}>
                  {project.description || "Нет описания"}
                </p>
              </ProjectCard>
            </Link>
          ))}
        </ProjectGrid>
      ) : (
        <EmptyState>
          <FolderPlus size={64} />
          <h2>У вас пока нет проектов</h2>
          <p>
            Начните работу с создания своего первого проекта. Это поможет вам организовать задачи и эффективно работать
            в команде.
          </p>
          <CreateButton onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Создать свой первый проект
          </CreateButton>
        </EmptyState>
      )}

      {isModalOpen && (
        <ModalOverlay onClick={() => setIsModalOpen(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <h2 style={{ color: "#172b4d", marginBottom: "1.5rem" }}>Новый проект</h2>
            <form onSubmit={handleCreateProject}>
              <div style={{ marginBottom: "1.5rem" }}>
                <FormLabel>Название проекта</FormLabel>
                <FormInput
                  type="text"
                  placeholder="Назовите ваш проект..."
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  required
                  autoFocus
                />
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <FormLabel>Описание</FormLabel>
                <FormTextArea
                  placeholder="Расскажите немного о целях проекта..."
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "flex-end",
                  marginTop: "2rem",
                  paddingTop: "1.5rem",
                  borderTop: "1px solid #ebecf0",
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: "10px 16px",
                    background: "none",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: 600,
                    cursor: "pointer",
                    color: "#42526e",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#ebecf0")}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  Отмена
                </button>
                <CreateButton type="submit">Создать проект</CreateButton>
              </div>
            </form>
          </Modal>
        </ModalOverlay>
      )}

      {notification && <Notification>{notification}</Notification>}

      <ConfirmModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, projectId: null })}
        onConfirm={handleConfirmDelete}
        title="Удалить проект?"
        message="Это действие нельзя отменить. Все задачи, комментарии и история активностей этого проекта будут удалены навсегда."
        confirmText="Удалить проект"
        isSubmitting={isDeleting}
      />
    </MainContent>
  );
}
