"use client";

import styled from "styled-components";
import { Folder, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f4f5f7;
`;

const Sidebar = styled.aside`
  width: 240px;
  background-color: #0747a6;
  color: white;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  position: sticky;
  top: 0;
  height: 100vh;
`;

const MainContent = styled.main`
  flex: 1;
  overflow-y: auto;
`;

const NavItem = styled(Link)<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  background-color: ${(props) => (props.$active ? "rgba(255, 255, 255, 0.1)" : "transparent")};

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <DashboardContainer>
      <Sidebar>
        <Link href="/" style={{ textDecoration: "none", color: "white" }}>
          <h2 style={{ marginBottom: "2rem" }}>Jira Synergy</h2>
        </Link>
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <NavItem href="/projects" $active={pathname === "/projects"}>
            <Folder size={20} /> Проекты
          </NavItem>
          {/* Будущие ссылки можно добавить здесь */}
        </nav>
        <div
          style={{
            marginTop: "auto",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px 12px",
          }}
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut size={20} /> Выйти
        </div>
      </Sidebar>
      <MainContent>{children}</MainContent>
    </DashboardContainer>
  );
}
