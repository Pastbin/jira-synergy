"use client";

import { useState, useEffect, use } from "react";
import styled from "styled-components";
import { ChevronLeft } from "lucide-react";
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
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

// Заглушка для доски
const KanbanBoardPlaceholder = styled.div`
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
    status: string;
  }>;
}

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProject = async () => {
    const res = await fetch(`/api/projects/${id}`);
    if (res.ok) {
      const data = await res.json();
      setProject(data);
    }
    setLoading(false);
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
        <Link
          href="/projects"
          style={{ display: "flex", alignItems: "center", color: "#0052cc", textDecoration: "none" }}
        >
          <ChevronLeft size={20} /> К списку
        </Link>
        <h1>{project.name}</h1>
      </ProjectHeader>

      <div style={{ marginBottom: "2rem" }}>
        <p style={{ color: "#5e6c84" }}>{project.description || "Без описания"}</p>
      </div>

      <KanbanBoard projectId={id} tasks={project.tasks || []} onTaskAdded={fetchProject} />
    </ProjectContainer>
  );
}
