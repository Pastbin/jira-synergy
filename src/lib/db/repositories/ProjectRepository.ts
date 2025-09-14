import { Repository } from "typeorm";
import { Project } from "../../entities/Project";
import { AppDataSource } from "../config";

/**
 * Репозиторий для работы с проектами
 * Обеспечивает CRUD операции и дополнительные методы для работы с сущностью Project
 */

export class ProjectRepository {
  private repository: Repository<Project>;

  constructor() {
    // Инициализация репозитория TypeORM для сущности Project
    this.repository = AppDataSource.getRepository(Project);
  }

  /**
   * Поиск проекта по ID с полными связями
   * @param id - уникальный идентификатор проекта
   * @returns проект с пользователями и задачами или null если не найден
   */
  async findById(id: string): Promise<Project | null> {
    return this.repository.findOne({
      where: { id },
      relations: ["userProjects", "userProjects.user", "tasks"],
    });
  }

  /**
   * Поиск проектов по владельцу
   * @param ownerId - идентификатор владельца проекта
   * @returns массив проектов принадлежащих пользователю
   */
  async findByOwner(ownerId: string): Promise<Project[]> {
    return this.repository.find({
      where: { ownerId },
      relations: ["userProjects", "tasks"],
    });
  }

  /**
   * Создание нового проекта
   * @param projectData - данные проекта для создания
   * @returns созданный проект
   */
  async create(projectData: Partial<Project>): Promise<Project> {
    const project = this.repository.create(projectData);
    return this.repository.save(project);
  }

  /**
   * Обновление данных проекта
   * @param id - идентификатор проекта
   * @param projectData - новые данные проекта
   * @returns обновленный проект или null если не найден
   */
  async update(
    id: string,
    projectData: Partial<Project>
  ): Promise<Project | null> {
    await this.repository.update(id, projectData);
    return this.findById(id);
  }

  /**
   * Удаление проекта
   * @param id - идентификатор проекта
   * @returns true если проект удален, false если не найден
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  /**
   * Получение всех проектов
   * @returns массив всех проектов с связями
   */
  async findAll(): Promise<Project[]> {
    return this.repository.find({
      relations: ["userProjects", "tasks"],
    });
  }

  /**
   * Получение проектов пользователя
   * @param userId - идентификатор пользователя
   * @returns массив проектов в которых участвует пользователь
   */
  async getUserProjects(userId: string): Promise<Project[]> {
    return this.repository
      .createQueryBuilder("project")
      .innerJoin("project.userProjects", "userProject")
      .where("userProject.userId = :userId", { userId })
      .leftJoinAndSelect("project.userProjects", "up")
      .leftJoinAndSelect("project.tasks", "tasks")
      .getMany();
  }
}
