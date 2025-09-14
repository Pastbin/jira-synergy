import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { UserProject } from "./UserProject";
import { Task } from "./Task";

/**
 * Сущность пользователя
 * Представляет пользователя системы управления проектами
 * Содержит информацию о пользователе и его связях с проектами и задачами
 */
@Entity("users")
export class User {
  /**
   * Уникальный идентификатор пользователя (UUID)
   * Генерируется автоматически при создании
   */
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  /**
   * Email пользователя
   * Обязательное поле, уникальное значение, максимальная длина 255 символов
   * Используется для аутентификации и связи
   */
  @Column({ type: "varchar", length: 255, unique: true })
  email!: string;

  /**
   * Пароль пользователя
   * Обязательное поле, хранится в хэшированном виде
   * Максимальная длина 255 символов
   */
  @Column({ type: "varchar", length: 255 })
  password!: string;

  /**
   * Имя пользователя
   * Обязательное поле, максимальная длина 100 символов
   * Отображаемое имя пользователя в системе
   */
  @Column({ type: "varchar", length: 100 })
  name!: string;

  /**
   * Аватар пользователя
   * Необязательное поле, ссылка на изображение аватара
   * Максимальная длина 255 символов
   */
  @Column({ type: "varchar", length: 255, nullable: true })
  avatar?: string;

  /**
   * Дата создания пользователя
   * Автоматически устанавливается при создании
   */
  @CreateDateColumn()
  createdAt!: Date;

  /**
   * Дата последнего обновления пользователя
   * Автоматически обновляется при изменениях
   */
  @UpdateDateColumn()
  updatedAt!: Date;

  /**
   * Связь с проектами пользователя (многие-ко-многим)
   * Содержит информацию о проектах, в которых участвует пользователь
   */
  @OneToMany(() => UserProject, (userProject) => userProject.user)
  userProjects!: UserProject[];

  /**
   * Связь с назначенными задачами
   * Содержит задачи, которые назначены на данного пользователя
   */
  @OneToMany(() => Task, (task) => task.assignee)
  assignedTasks!: Task[];

  /**
   * Связь с созданными задачами
   * Содержит задачи, которые созданы данным пользователем
   */
  @OneToMany(() => Task, (task) => task.creator)
  createdTasks!: Task[];
}
