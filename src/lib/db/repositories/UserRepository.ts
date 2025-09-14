import { Repository } from "typeorm";
import { AppDataSource } from "../config";
import { User } from "../../entities/User";

/**
 * Репозиторий для работы с пользователями
 * Обеспечивает CRUD операции для работы с сущностью User
 * Включает методы для поиска пользователей по различным критериям
 */
export class UserRepository {
  private repository: Repository<User>;

  /**
   * Инициализация репозитория TypeORM для сущности User
   */
  constructor() {
    this.repository = AppDataSource.getRepository(User);
  }

  /**
   * Поиск пользователя по ID
   * @param id - уникальный идентификатор пользователя
   * @returns пользователь или null если не найден
   */
  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  /**
   * Поиск пользователя по email
   * @param email - email пользователя для поиска
   * @returns пользователь или null если не найден
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  /**
   * Создание нового пользователя
   * @param userData - данные пользователя для создания
   * @returns созданный пользователь
   */
  async create(userData: Partial<User>): Promise<User> {
    const user = this.repository.create(userData);
    return this.repository.save(user);
  }

  /**
   * Обновление данных пользователя
   * @param id - идентификатор пользователя
   * @param userData - новые данные пользователя
   * @returns обновленный пользователь или null если не найден
   */
  async update(id: string, userData: Partial<User>): Promise<User | null> {
    await this.repository.update(id, userData);
    return this.findById(id);
  }

  /**
   * Удаление пользователя
   * @param id - идентификатор пользователя
   * @returns true если пользователь удален, false если не найден
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  /**
   * Получение всех пользователей
   * @returns массив всех пользователей
   */
  async findAll(): Promise<User[]> {
    return this.repository.find();
  }
}
