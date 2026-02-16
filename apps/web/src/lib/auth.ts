import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Конфигурация NextAuth для управления сессиями и авторизацией
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Поиск пользователя в базе данных
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        // Проверка пароля (сравнение хешей)
        if (user && (await bcrypt.compare(credentials.password as string, user.password))) {
          return { id: user.id, name: user.name, email: user.email };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    // Добавление ID пользователя в объект сессии
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login", // Кастомная страница входа
  },
  secret: process.env.NEXTAUTH_SECRET,
});
