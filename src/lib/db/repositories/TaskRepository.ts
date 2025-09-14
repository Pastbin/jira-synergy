import { Repository } from "typeorm";
import { AppDataSource } from "../config";
import { Task, TaskStatus } from "../../entities/Task";

/**
 * Репозиторий для работы с задачами
 * Обеспечивает CRUD операции и дополнительные методы для работы с сущностью Task
 * Включает методы для поиска задач по различным критериям и статистики
 */
export class TaskRepository {
  private repository: Repository<Task>;

  /**
   * Инициализация репозитория TypeORM для сущности Task
   */
  constructor() {
    this.repository = AppDataSource.getRepository(Task);
  }

  /**
   * Поиск задачи по ID с полными связями
   * @param id - уникальный идентификатор задачи
   * @returns задача с проектом, исполнителем и создателем или null если не найдена
   */
  async findById(id: string): Promise<Task | null> {
    return this.repository.findOne({
      where: { id },
      relations: ["project", "assignee", "creator"],
    });
  }

  /**
   * Поиск задач по проекту
   * @param projectId - идентификатор проекта
   * @returns массив задач проекта с исполнителями и создателями, отсортированный по приоритету и дате создания
   */
  async findByProject(projectId: string): Promise<Task[]> {
    return this.repository.find({
      where: { projectId },
      relations: ["assignee", "creator"],
      order: { priority: "DESC", createdAt: "DESC" },
    });
  }

  /**
   * Поиск задач по исполнителю
   * @param assigneeId - идентификатор исполнителя задачи
   * @returns массив задач назначенных пользователю, отсортированный по приоритету и дате создания
   */
  async findByAssignee(assigneeId: string): Promise<Task[]> {
    return this.repository.find({
      where: { assigneeId },
      relations: ["project", "creator"],
      order: { priority: "DESC", createdAt: "DESC" },
    });
  }

  /**
   * Поиск задач по статусу в рамках проекта
   * @param projectId - идентификатор проекта
   * @param status - статус задачи для фильтрации
   * @returns массив задач с указанным статусом, отсортированный по приоритету и дате создания
   */
  async findByStatus(projectId: string, status: TaskStatus): Promise<Task[]> {
    return this.repository.find({
      where: { projectId, status },
      relations: ["assignee"],
      order: { priority: "DESC", createdAt: "DESC" },
    });
  }

  /**
   * Создание новой задачи
   * @param taskData - данные задачи для создания
   * @returns созданная задача
   */
  async create(taskData: Partial<Task>): Promise<Task> {
    const task = this.repository.create(taskData);
    return this.repository.save(task);
  }

  /**
   * Обновление данных задачи
   * @param id - идентификатор задачи
   * @param taskData - новые данные задачи
   * @returns обновленная задача или null если не найдена
   */
  async update(id: string, taskData: Partial<Task>): Promise<Task | null> {
    await this.repository.update(id, taskData);
    return this.findById(id);
  }

  /**
   * Обновление статуса задачи
   * @param id - идентификатор задачи
   * @param status - новый статус задачи
   * @returns обновленная задача или null если не найдена
   */
  async updateStatus(id: string, status: TaskStatus): Promise<Task | null> {
    await this.repository.update(id, { status });
    return this.findById(id);
  }

  /**
   * Удаление задачи
   * @param id - идентификатор задачи
   * @returns true если задача удалена, false если не найдена
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  /**
   * Получение статистики задач по статусам для проекта
   * @param projectId - идентификатор проекта
   * @returns массив объектов со статусом и количеством задач для каждого статуса
   */
  async getProjectTaskStats(
    projectId: string
  ): Promise<{ status: TaskStatus; count: number }[]> {
    return this.repository
      .createQueryBuilder("task")
      .select("task.status", "status")
      .addSelect("COUNT(task.id)", "count")
      .where("task.projectId = :projectId", { projectId })
      .groupBy("task.status")
      .getRawMany();
  }
}
