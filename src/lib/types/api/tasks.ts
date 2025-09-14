/**
 * Типы для API работы с задачами
 */

import { Task, TaskStatus } from '@/lib/entities/Task';

/**
 * Запрос на создание задачи
 */
export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: number;
  projectId: string;
  assigneeId?: string;
  creatorId: string;
  deadline?: Date;
}

/**
 * Запрос на обновление задачи
 */
export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: number;
  assigneeId?: string;
  deadline?: Date;
}

/**
 * Запрос на изменение статуса задачи
 */
export interface UpdateTaskStatusRequest {
  status: TaskStatus;
}

/**
 * Ответ API с задачей
 */
export interface TaskResponse extends Task {}

/**
 * Ответ API со списком задач
 */
export type TasksResponse = Task[];

/**
 * Ответ API при успешном удалении
 */
export interface DeleteTaskResponse {
  message: string;
}

/**
 * Ответ API при ошибке
 */
export interface ErrorResponse {
  error: string;
}

/**
 * Параметры запроса для получения задач
 */
export interface GetTasksQueryParams {
  projectId?: string;
  assigneeId?: string;
  status?: TaskStatus;
}