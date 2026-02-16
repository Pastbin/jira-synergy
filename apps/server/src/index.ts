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

// Слушатель событий сокетов
io.on("connection", (socket) => {
  console.log("Пользователь подключен:", socket.id);

  // Обработка события перемещения задачи
  socket.on("task_moved", (data) => {
    // Рассылка обновлений всем участникам проекта
    socket.to(data.projectId).emit("task_updated", data);
  });

  // Присоединение к комнате проекта
  socket.on("join_project", (projectId) => {
    socket.join(projectId);
    console.log(`Пользователь ${socket.id} вошел в проект ${projectId}`);
  });

  // Событие отключения
  socket.on("disconnect", () => {
    console.log("Пользователь отключен");
  });
});

// Запуск сервера
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.io сервер запущен на порту ${PORT}`);
});
