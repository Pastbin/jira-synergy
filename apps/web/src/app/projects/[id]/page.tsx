"use client";

import { useState, useEffect, use } from "react";
import styled from "styled-components";
import { ChevronLeft, UserPlus } from "lucide-react";
import Link from "next/link";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import KanbanBoard from "@/components/KanbanBoard";

// Контейнер страницы проекта
const ProjectContainer = styled.div`
  padding: 2rem;
`;

// Шапка проекта
const ProjectHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const InviteForm = styled.form`
  display: flex;
  gap: 0.5rem;
`;

const InviteInput = styled.input`
  padding: 6px 12px;
  border: 1px solid #dfe1e6;
  border-radius: 4px;
`;

const InviteButton = styled.button`
  background: #0052cc;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  &:hover {
    background: #0747a6;
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
  tasks: Array<{
    id: string;
    title: string;
    description: string | null;
    status: string;
    order: number;
  }>;
}

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

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
        alert("Участник добавлен!");
        setInviteEmail("");
        fetchProject();
      } else {
        const data = await res.json();
        alert(data.error || "Ошибка");
      }
    } catch (err) {
      alert("Ошибка сети");
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

      <KanbanBoard projectId={id} tasks={project.tasks || []} onTaskAdded={fetchProject} />
    </ProjectContainer>
  );
}
