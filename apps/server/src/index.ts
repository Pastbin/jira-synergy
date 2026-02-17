import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

// Конфигурация переменных окружения
dotenv.config();

const app = express();
app.use(cors());

// Создание HTTP сервера
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Хранилище активных пользователей по проектам
const projectUsers = new Map<string, Map<string, any>>();

// Слушатель событий сокетов
io.on("connection", (socket) => {
  console.log("Пользователь подключен:", socket.id);

  // Присоединение к персональной комнате пользователя (по email)
  // Это нужно для получения глобальных уведомлений (например, о новом проекте)
  socket.on("authenticate", (user) => {
    if (user?.email) {
      socket.join(`user:${user.email}`);
      console.log(`Пользователь ${user.email} аутентифицирован в сокете`);
    }
  });

  // Присоединение к комнате проекта
  socket.on("join_project", ({ projectId, user }) => {
    socket.join(projectId);

    // Сохраняем информацию о пользователе
    if (!projectUsers.has(projectId)) {
      projectUsers.set(projectId, new Map());
    }
    projectUsers.get(projectId)?.set(socket.id, user);

    // Уведомляем всех в комнате об обновлении списка пользователей
    const usersInProject = Array.from(projectUsers.get(projectId)?.values() || []);
    io.to(projectId).emit("users_updated", usersInProject);

    console.log(`Пользователь ${user.name} вошел в проект ${projectId}`);
  });

  // Обработка события перемещения задачи
  socket.on("task_moved", (data) => {
    socket.to(data.projectId).emit("task_updated", data);
  });

  // Обработка новых комментариев
  socket.on("new_comment", (data) => {
    // Рассылаем всем в комнате проекта, кроме отправителя
    socket.to(data.projectId).emit("comment_received", data);
  });

  // Уведомление пользователя о том, что его добавили в проект
  socket.on("notify_invite", ({ email, project }) => {
    console.log(`Отправка уведомления для ${email} о проекте ${project.name}`);
    io.to(`user:${email}`).emit("project_added", project);
  });

  // Событие отключения
  socket.on("disconnect", () => {
    // Находим в каких проектах был пользователь и удаляем
    projectUsers.forEach((users, projectId) => {
      if (users.has(socket.id)) {
        users.delete(socket.id);
        const usersInProject = Array.from(users.values());
        io.to(projectId).emit("users_updated", usersInProject);
      }
    });
    console.log("Пользователь отключен");
  });
});

// Запуск сервера
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.io сервер запущен на порту ${PORT}`);
});
