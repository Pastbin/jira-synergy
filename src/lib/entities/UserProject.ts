import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Column,
} from "typeorm";
import { User } from "./User";
import { Project } from "./Project";

/**
 * Тип роли пользователя в проекте
 * Определяет уровень доступа и права пользователя в рамках проекта
 */
export type UserRole = "owner" | "admin" | "member";

/**
 * Сущность связи пользователя и проекта
 * Представляет информацию о роли пользователя в проекте и связях с пользователями и проектами
 */
@Entity("user_projects")
export class UserProject {
  /**
   * Уникальный идентификатор сущности UserProject
   * Генерируется автоматически при создании сущности
   */
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  /**
   * Идентификатор пользователя, связанного с данным проектом
   * Используется для создания связи между пользователями и проектами
   */
  @Column({ type: "uuid" })
  userId!: string;

  /**
   * Идентификатор проекта, связанного с данным пользователем
   * Используется для создания связи между проектами и пользователями
   */
  @Column({ type: "uuid" })
  projectId!: string;

  /**
   * Роль пользователя в проекте
   * Определяет уровень доступа и права пользователя в рамках проекта
   * Может принимать значения 'owner', 'admin', 'member'
   */
  @Column({
    type: "enum",
    enum: ["owner", "admin", "member"],
    default: "member",
  })
  role!: UserRole;

  /**
   * Дата и время присоединения пользователя к проекту
   * Генерируется автоматически при создании сущности
   */
  @CreateDateColumn()
  joinedAt!: Date;

  /**
   * Ссылка на пользователя, связанного с данным проектом
   * Используется для создания связи между пользователями и проектами
   */
  @ManyToOne(() => User, (user) => user.userProjects, { onDelete: "CASCADE" })
  user!: User;

  /**
   * Ссылка на проект, связанного с данным пользователем
   * Используется для создания связи между проектами и пользователями
   */
  @ManyToOne(() => Project, (project) => project.userProjects, {
    onDelete: "CASCADE",
  })
  project!: Project;
}
