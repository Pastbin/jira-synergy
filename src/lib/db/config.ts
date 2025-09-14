import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Project } from "../entities/Project";
import { Task } from "../entities/Task";
import { UserProject } from "../entities/UserProject";

/**
 * Конфигурация подключения к базе данных PostgreSQL
 * Настройки берутся из переменных окружения или используются значения по умолчанию
 */

// Основной источник данных для работы с базой данных
// Используется TypeORM для управления подключениями и миграциями
export const AppDataSource = new DataSource({
  type: "postgres", // Тип базы данных - PostgreSQL
  host: process.env.DB_HOST || "localhost", // Хост базы данных
  port: parseInt(process.env.DB_PORT || "5432"), // Порт подключения
  username: process.env.DB_USERNAME || "postgres", // Имя пользователя БД
  password: process.env.DB_PASSWORD || "postgres", // Пароль пользователя БД
  database: process.env.DB_NAME || "jira_synergy", // Название базы данных
  synchronize: process.env.NODE_ENV !== "production", // Автоматическая синхронизация схемы (только для разработки)
  logging: process.env.NODE_ENV === "development", // Логирование SQL запросов (только для разработки)
  entities: [User, Project, Task, UserProject], // Сущности базы данных
  migrations: ["src/lib/migrations/*.ts"], // Путь к миграциям
  subscribers: [], // Подписчики на события (пока не используются)
});

/**
 * Инициализация подключения к базе данных
 * Выполняет подключение и логирует результат
 * @throws ошибка подключения к базе данных
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    // Установка соединения с базой данных
    await AppDataSource.initialize();
    console.log("Подключение к базе данных установлено");
  } catch (error) {
    console.error("Ошибка подключения к базе данных:", error);
    throw error;
  }
};
