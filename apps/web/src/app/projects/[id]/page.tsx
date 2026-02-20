"use client";

import { useState, useEffect, use } from "react";
import styled from "styled-components";
import { ChevronLeft, UserPlus, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import KanbanBoard from "@/components/KanbanBoard";
import { getSocket } from "@/lib/socket";

// Контейнер страницы проекта
const ProjectContainer = styled.div`
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem 12px;
  }
`;

// Шапка проекта
const ProjectHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 12px;

  @media (max-width: 768px) {
    margin-bottom: 1rem;
  }
`;

const InviteForm = styled.form`
  display: flex;
  gap: 0.5rem;
`;

const InviteInput = styled.input`
  padding: 8px 12px;
  border: 2px solid #dfe1e6;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
  &:focus {
    outline: none;
    border-color: #4c9aff;
  }
`;

const InviteButton = styled.button`
  background: #0052cc;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  transition: background 0.2s;
  &:hover {
    background: #0747a6;
  }
  &:disabled {
    background: #ebecf0;
    color: #a5adba;
    cursor: not-allowed;
  }
`;

const Toast = styled.div<{ $type?: "success" | "error" }>`
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: ${(props) => (props.$type === "error" ? "#DE350B" : "#36B37E")};
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 10px;
  animation: slideIn 0.3s ease-out;
  z-index: 2000;
  font-weight: 500;

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

// Контейнер для пустого состояния доски
const EmptyBoardState = styled.div`
  background: #f4f5f7;
  border: 2px dashed #dfe1e6;
  border-radius: 8px;
  height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5e6c84;
`;

interface Project {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  members: Array<{
    role: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  tasks: Array<{
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    order: number;
    assignees: Array<{
      id: string;
      name: string | null;
      email: string;
    }>;
  }>;
}

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToastMsg = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchProject = async () => {
    const res = await fetch(`/api/projects/${id}`);
    if (res.ok) {
      const data = await res.json();
      setProject(data);
    }
    setLoading(false);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      const res = await fetch(`/api/projects/${id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      });
      if (res.ok) {
        showToastMsg("Пользователь приглашен в проект");

        // Отправляем уведомление через сокеты
        if (project) {
          const socket = getSocket();
          socket.emit("notify_invite", {
            email: inviteEmail,
            project: {
              id: project.id,
              name: project.name,
              description: project.description,
            },
          });
        }

        setInviteEmail("");
        fetchProject();
      } else {
        const data = await res.json();
        showToastMsg(data.error || "Ошибка", "error");
      }
    } catch (err) {
      showToastMsg("Ошибка сети", "error");
    } finally {
      setInviting(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (!project) return <p>Проект не найден</p>;

  return (
    <ProjectContainer>
      <ProjectHeader>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link
            href="/projects"
            style={{ display: "flex", alignItems: "center", color: "#0052cc", textDecoration: "none" }}
          >
            <ChevronLeft size={20} /> К списку
          </Link>
          <h1 style={{ margin: 0 }}>{project.name}</h1>
        </div>

        <InviteForm onSubmit={handleInvite}>
          <InviteInput
            type="email"
            placeholder="Email участника"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            disabled={inviting}
          />
          <InviteButton type="submit" disabled={inviting}>
            <UserPlus size={16} /> {inviting ? "..." : "Пригласить"}
          </InviteButton>
        </InviteForm>
      </ProjectHeader>

      <div style={{ marginBottom: "2rem" }}>
        <p style={{ color: "#5e6c84" }}>{project.description || "Без описания"}</p>
      </div>

      <KanbanBoard
        projectId={id}
        tasks={project.tasks || []}
        onTaskAdded={fetchProject}
        userRole={
          project.ownerId === session?.user?.id
            ? "ADMIN"
            : project.members.find((m) => m.user.id === session?.user?.id)?.role || "VIEWER"
        }
      />

      {toast && (
        <Toast $type={toast.type}>
          {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {toast.message}
        </Toast>
      )}
    </ProjectContainer>
  );
}
