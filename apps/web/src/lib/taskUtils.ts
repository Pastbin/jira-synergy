/**
 * Чистые функции для логики задач (серверная часть).
 * Используются в тестах для проверки бизнес-правил.
 */

const ORDER_STEP = 1000;

/** Допустимые статусы задачи (Kanban). */
export const TASK_STATUSES = ["TODO", "IN_PROGRESS", "REVIEW", "TESTING", "DONE"] as const;

/**
 * Вычисляет order для новой задачи в колонке.
 * Чистая функция: только вход → выход, без побочных эффектов.
 */
export function computeNewTaskOrder(lastOrder: number | null): number {
  return lastOrder != null ? lastOrder + ORDER_STEP : ORDER_STEP;
}

/**
 * Проверяет, что статус задачи допустимый.
 * Чистая функция.
 */
export function isAllowedTaskStatus(status: string): boolean {
  return TASK_STATUSES.includes(status as (typeof TASK_STATUSES)[number]);
}
