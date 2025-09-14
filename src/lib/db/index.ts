/**
 * Экспорт всех основных компонентов базы данных
 * Центральный файл для импорта сущностей, репозиториев и конфигурации
 */
export * from "./config";
export { User } from "../entities/User"; // Сущность пользователя
export { Project } from "../entities/Project"; // Сущность проекта
export { Task, type TaskStatus } from "../entities/Task"; // Сущность задачи и тип статуса
export { UserProject, type UserRole } from "../entities/UserProject"; // Связь пользователь-проект и тип роли
export * from "../types/database"; // Типы данных для базы данных
