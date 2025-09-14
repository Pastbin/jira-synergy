import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Project } from './Project';
import { User } from './User';

/**
 * Тип статуса задачи
 * Определяет возможные состояния задачи в workflow
 */
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'testing' | 'done';

/**
 * Сущность задачи
 * Представляет задачу в системе управления проектами
 * Содержит информацию о задаче, ее статусе, приоритете и связях
 */
@Entity('tasks')
export class Task {
  /**
   * Уникальный идентификатор задачи (UUID)
   * Генерируется автоматически при создании
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * Заголовок задачи
   * Обязательное поле, максимальная длина 255 символов
   */
  @Column({ type: 'varchar', length: 255 })
  title!: string;

  /**
   * Описание задачи
   * Необязательное поле, текстовый формат для детального описания
   */
  @Column({ type: 'text', nullable: true })
  description?: string;

  /**
   * Статус задачи
   * Определяет текущее состояние задачи в workflow
   * По умолчанию 'todo'
   */
  @Column({ 
    type: 'enum', 
    enum: ['todo', 'in_progress', 'review', 'testing', 'done'],
    default: 'todo'
  })
  status!: TaskStatus;

  /**
   * Приоритет задачи
   * Числовое значение, чем выше число - тем выше приоритет
   * По умолчанию 0
   */
  @Column({ type: 'int', default: 0 })
  priority!: number;

  /**
   * Идентификатор проекта
   * Ссылка на проект, к которому относится задача (UUID)
   */
  @Column({ type: 'uuid' })
  projectId!: string;

  /**
   * Идентификатор исполнителя задачи
   * Ссылка на пользователя-исполнителя (UUID), необязательное поле
   */
  @Column({ type: 'uuid', nullable: true })
  assigneeId?: string;

  /**
   * Идентификатор создателя задачи
   * Ссылка на пользователя-создателя (UUID)
   */
  @Column({ type: 'uuid' })
  creatorId!: string;

  /**
   * Дедлайн задачи
   * Необязательное поле, дата и время завершения задачи
   */
  @Column({ type: 'timestamp', nullable: true })
  deadline?: Date;

  /**
   * Дата создания задачи
   * Автоматически устанавливается при создании
   */
  @CreateDateColumn()
  createdAt!: Date;

  /**
   * Дата последнего обновления задачи
   * Автоматически обновляется при изменениях
   */
  @UpdateDateColumn()
  updatedAt!: Date;

  /**
   * Связь с проектом
   * Задача принадлежит одному проекту
   * При удалении проекта задачи также удаляются (CASCADE)
   */
  @ManyToOne(() => Project, project => project.tasks, { onDelete: 'CASCADE' })
  project!: Project;

  /**
   * Связь с исполнителем задачи
   * Задача может быть назначена на пользователя
   * При удалении пользователя ссылка становится null (SET NULL)
   */
  @ManyToOne(() => User, user => user.assignedTasks, { nullable: true })
  assignee?: User;

  /**
   * Связь с создателем задачи
   * Задача создана пользователем
   * При удалении пользователя задача удаляется (CASCADE)
   */
  @ManyToOne(() => User, user => user.createdTasks, { onDelete: 'CASCADE' })
  creator!: User;
}