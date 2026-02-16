import type { Metadata } from "next";
import StyledComponentsRegistry from "@/lib/registry";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jira Synergy",
  description: "Project management tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
      </body>
    </html>
  );
}
