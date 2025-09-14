import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UserProject } from './UserProject';
import { Task } from './Task';

/**
 * Сущность проекта
 * Представляет проект в системе управления задачами
 * Содержит информацию о проекте, его статусе и связях с пользователями и задачами
 */
@Entity('projects')
export class Project {
  /**
   * Уникальный идентификатор проекта (UUID)
   * Генерируется автоматически при создании
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * Название проекта
   * Обязательное поле, максимальная длина 255 символов
   */
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  /**
   * Описание проекта
   * Необязательное поле, текстовый формат
   */
  @Column({ type: 'text', nullable: true })
  description?: string;

  /**
   * Статус проекта
   * По умолчанию 'active', максимальная длина 50 символов
   * Возможные значения: active, archived, completed и т.д.
   */
  @Column({ type: 'varchar', length: 50, default: 'active' })
  status!: string;

  /**
   * Идентификатор владельца проекта
   * Ссылка на пользователя-владельца (UUID)
   */
  @Column({ type: 'uuid' })
  ownerId!: string;

  /**
   * Дата создания проекта
   * Автоматически устанавливается при создании
   */
  @CreateDateColumn()
  createdAt!: Date;

  /**
   * Дата последнего обновления проекта
   * Автоматически обновляется при изменениях
   */
  @UpdateDateColumn()
  updatedAt!: Date;

  /**
   * Связь с таблицей пользователей проекта (многие-ко-многим)
   * Содержит информацию о пользователях, участвующих в проекте
   */
  @OneToMany(() => UserProject, userProject => userProject.project)
  userProjects!: UserProject[];

  /**
   * Связь с задачами проекта
   * Содержит все задачи, относящиеся к данному проекту
   */
  @OneToMany(() => Task, task => task.project)
  tasks!: Task[];
}