"use client";

import { useState, useEffect } from "react";
import styled from "styled-components";
import { Plus } from "lucide-react";
import Link from "next/link";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

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

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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

// Модальное окно (упрощенное)
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
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
`;

interface Project {
  id: string;
  name: string;
  description: string | null;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(true);

  // Загрузка списка проектов при инициализации
  useEffect(() => {
    fetchProjects();
  }, []);

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
      ) : (
        <ProjectGrid>
          {projects.map((project) => (
            <Link
              href={`/projects/${project.id}`}
              key={project.id}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <ProjectCard>
                <h3>{project.name}</h3>
                <p style={{ color: "#5e6c84", fontSize: "0.9rem", marginTop: "0.5rem" }}>
                  {project.description || "Нет описания"}
                </p>
              </ProjectCard>
            </Link>
          ))}
        </ProjectGrid>
      )}

      {isModalOpen && (
        <ModalOverlay>
          <Modal>
            <h2>Новый проект</h2>
            <form onSubmit={handleCreateProject} style={{ marginTop: "1rem" }}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>Название</label>
                <input
                  type="text"
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ddd" }}
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  required
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>Описание</label>
                <textarea
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                    minHeight: "100px",
                  }}
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                />
              </div>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: "0.5rem 1rem", background: "#ebecf0", border: "none", borderRadius: "4px" }}
                >
                  Отмена
                </button>
                <CreateButton type="submit">Создать</CreateButton>
              </div>
            </form>
          </Modal>
        </ModalOverlay>
      )}
    </MainContent>
  );
}
