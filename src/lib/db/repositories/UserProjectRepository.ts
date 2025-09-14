import { Repository } from "typeorm";
import { User } from "../../entities/User";
import { UserProject, UserRole } from "../../entities/UserProject";
import { AppDataSource } from "../config";

/**
 * Репозиторий для работы с сущностью UserProject
 * Обеспечивает CRUD операции и дополнительные методы для работы с сущностью UserProject
 */
export class UserProjectRepository {
  private repository: Repository<UserProject>;

  /**
   * Конструктор репозитория
   * Инициализирует репозиторий TypeORM для сущности UserProject
   */
  constructor() {
    this.repository = AppDataSource.getRepository(UserProject);
  }

  /**
   * Поиск сущности UserProject по ID с полными связями
   * @param id - уникальный идентификатор сущности UserProject
   * @returns сущность UserProject с пользователями и проектами или null если не найдена
   */
  async findById(id: string): Promise<UserProject | null> {
    return this.repository.findOne({
      where: { id },
      relations: ["user", "project"],
    });
  }

  /**
   * Поиск сущности UserProject по пользователя и проекту
   * @param userId - идентификатор пользователя
   * @param projectId - идентификатор проекта
   * @returns сущность UserProject с пользователями и проектами или null если не найдена
   */
  async findByUserAndProject(
    userId: string,
    projectId: string
  ): Promise<UserProject | null> {
    return this.repository.findOne({
      where: { userId, projectId },
      relations: ["user", "project"],
    });
  }

  /**
   * Поиск сущности UserProject по пользователя
   * @param userId - идентификатор пользователя
   * @returns массив сущностей UserProject, связанных с указанным пользователем
   */
  async findByUser(userId: string): Promise<UserProject[]> {
    return this.repository.find({
      where: { userId },
      relations: ["project"],
    });
  }

  /**
   * Поиск сущности UserProject по проекту
   * @param projectId - идентификатор проекта
   * @returns массив сущностей UserProject, связанных с указанным проектом
   */
  async findByProject(projectId: string): Promise<UserProject[]> {
    return this.repository.find({
      where: { projectId },
      relations: ["user"],
    });
  }

  /**
   * Создание новой сущности UserProject
   * @param userProjectData - данные сущности UserProject для создания
   * @returns созданная сущность UserProject
   */
  async create(userProjectData: Partial<UserProject>): Promise<UserProject> {
    const userProject = this.repository.create(userProjectData);
    return this.repository.save(userProject);
  }

  /**
   * Обновление роли пользователя в проекте
   * @param userId - идентификатор пользователя
   * @param projectId - идентификатор проекта
   * @param role - роль пользователя в проекте
   * @returns обновленная сущность UserProject или null если не найдена
   */
  async updateRole(
    userId: string,
    projectId: string,
    role: UserRole
  ): Promise<UserProject | null> {
    await this.repository.update({ userId, projectId }, { role });
    return this.findByUserAndProject(userId, projectId);
  }

  /**
   * Удаление сущности UserProject
   * @param userId - идентификатор пользователя
   * @param projectId - идентификатор проекта
   * @returns true если сущность удалена, false если не найдена
   */
  async delete(userId: string, projectId: string): Promise<boolean> {
    const result = await this.repository.delete({ userId, projectId });
    return (result.affected ?? 0) > 0;
  }

  /**
   * Проверка наличия пользователя в проекте
   * @param userId - идентификатор пользователя
   * @param projectId - идентификатор проекта
   * @returns true если пользователь является членом проекта, false если не является
   */
  async isUserInProject(userId: string, projectId: string): Promise<boolean> {
    const count = await this.repository.count({ where: { userId, projectId } });
    return count > 0;
  }

  /**
   * Получение роли пользователя в проекте
   * @param userId - идентификатор пользователя
   * @param projectId - идентификатор проекта
   * @returns роль пользователя в проекте или null если не найдена
   */
  async getUserRole(
    userId: string,
    projectId: string
  ): Promise<UserRole | null> {
    const userProject = await this.findByUserAndProject(userId, projectId);
    return userProject?.role || null;
  }

  /**
   * Получение списка пользователей, являющихся членами проекта
   * @param projectId - идентификатор проекта
   * @returns список пользователей, являющихся членами проекта
   */
  async getProjectMembers(projectId: string): Promise<User[]> {
    const userProjects = await this.findByProject(projectId);
    return userProjects.map((up) => up.user);
  }
}
