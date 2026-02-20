"use client";

import { useState } from "react";
import styled from "styled-components";
import { Folder, LogOut, Menu, X } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const MOBILE_BREAKPOINT = "900px";

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: row;
  min-height: 100vh;
  background-color: #f4f5f7;

  /* На мобильных: колонка — сверху только тонкая полоска с бургером, ниже контент на весь экран. Сайдбар в поток не входит. */
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    flex-direction: column;
  }
`;

/* Десктоп: сайдбар в потоке слева. Мобильные: в потоке сайдбара нет (display:none), при открытии — поверх всего. */
const SidebarWrap = styled.div<{ $open?: boolean }>`
  flex-shrink: 0;

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    display: ${(p) => (p.$open ? "block" : "none")};
    position: fixed;
    inset: 0;
    z-index: 1000;
    pointer-events: ${(p) => (p.$open ? "auto" : "none")};
  }
`;

const Sidebar = styled.aside<{ $open?: boolean }>`
  width: 240px;
  min-width: 240px;
  background-color: #0747a6;
  color: white;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  position: sticky;
  top: 0;
  height: 100vh;

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: min(280px, 85vw);
    min-width: unset;
    z-index: 1001;
    transform: translateX(${(p) => (p.$open ? "0" : "-100%")});
    transition: transform 0.2s ease-out;
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.2);
  }
`;

const MainContent = styled.main`
  flex: 1;
  overflow-y: auto;
  min-width: 0;
  width: 100%;

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    flex: 1;
    min-height: 0;
  }
`;

/* Только на мобильных: одна строка сверху (бургер + название), не боковая колонка. */
const MobileHeader = styled.header`
  display: none;

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    background: #0747a6;
    color: white;
    position: sticky;
    top: 0;
    z-index: 999;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    min-height: 48px;
    max-height: 48px;
  }
`;

const BurgerButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
  }
`;

const SidebarCloseBtn = styled(BurgerButton)`
  @media (min-width: ${MOBILE_BREAKPOINT}) {
    display: none !important;
  }
`;

const Overlay = styled.div<{ $show: boolean }>`
  display: none;
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 1000;
    opacity: ${(p) => (p.$show ? 1 : 0)};
    pointer-events: ${(p) => (p.$show ? "auto" : "none")};
    transition: opacity 0.2s;
  }
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <DashboardContainer>
      <MobileHeader>
        <BurgerButton onClick={() => setSidebarOpen(true)} aria-label="Открыть меню">
          <Menu size={24} />
        </BurgerButton>
        <Link href="/" style={{ textDecoration: "none", color: "white", fontWeight: 600, fontSize: "1.1rem" }}>
          Jira Synergy
        </Link>
      </MobileHeader>

      <Overlay $show={sidebarOpen} onClick={closeSidebar} aria-hidden="true" />
      <SidebarWrap $open={sidebarOpen} onClick={closeSidebar}>
      <Sidebar $open={sidebarOpen} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <Link href="/" style={{ textDecoration: "none", color: "white" }} onClick={closeSidebar}>
            <h2 style={{ margin: 0 }}>Jira Synergy</h2>
          </Link>
          <SidebarCloseBtn onClick={closeSidebar} aria-label="Закрыть меню">
            <X size={22} />
          </SidebarCloseBtn>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <NavItem href="/projects" $active={pathname === "/projects"} onClick={closeSidebar}>
            <Folder size={20} /> Проекты
          </NavItem>
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
      </SidebarWrap>
      <MainContent>{children}</MainContent>
    </DashboardContainer>
  );
}
