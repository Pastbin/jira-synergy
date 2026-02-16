"use client";

import { useState, useEffect } from "react";
import styled from "styled-components";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

// Контейнер страницы проекта
const ProjectContainer = styled.div`
  padding: 2rem;
  background-color: #ffffff;
  min-height: 100vh;
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

export default function ProjectDetailsPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProject();
  }, []);

  const fetchProject = async () => {
    const res = await fetch(`/api/projects/${params.id}`);
    if (res.ok) {
      const data = await res.json();
      setProject(data);
    }
    setLoading(false);
  };

  if (loading) return <p>Загрузка проекта...</p>;
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

      <KanbanBoardPlaceholder>Здесь скоро будет Kanban-доска с поддержкой Drag-and-Drop</KanbanBoardPlaceholder>
    </ProjectContainer>
  );
}
