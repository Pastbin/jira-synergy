import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Первоначальная миграция для создания схемы базы данных
 * Создает все необходимые таблицы, индексы и связи
 */

export class InitialSchema0000000000001 implements MigrationInterface {
  name = "InitialSchema0000000000001"; // Уникальное имя миграции

  /**
   * Выполнение миграции - создание схемы базы данных
   * @param queryRunner - исполнитель SQL запросов
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Создание расширения для генерации UUID
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);

    // Создание таблицы пользователей
    await queryRunner.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        avatar VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Создание таблицы проектов
    await queryRunner.query(`
      CREATE TABLE projects (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'active',
        owner_id UUID NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT fk_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Создание таблицы связи пользователей и проектов (многие-ко-многим)
    await queryRunner.query(`
      CREATE TABLE user_projects (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        project_id UUID NOT NULL,
        role VARCHAR(20) DEFAULT 'member',
        joined_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        CONSTRAINT unique_user_project UNIQUE (user_id, project_id)
      );
    `);

    // Создание таблицы задач
    await queryRunner.query(`
      CREATE TABLE tasks (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(20) DEFAULT 'todo',
        priority INTEGER DEFAULT 0,
        project_id UUID NOT NULL,
        assignee_id UUID,
        creator_id UUID NOT NULL,
        deadline TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT fk_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        CONSTRAINT fk_assignee FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL,
        CONSTRAINT fk_creator FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Создание индексов для оптимизации запросов
    await queryRunner.query(`
      CREATE INDEX idx_tasks_project_id ON tasks(project_id);
      CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
      CREATE INDEX idx_tasks_creator_id ON tasks(creator_id);
      CREATE INDEX idx_tasks_status ON tasks(status);
      CREATE INDEX idx_user_projects_user_id ON user_projects(user_id);
      CREATE INDEX idx_user_projects_project_id ON user_projects(project_id);
    `);
  }

  /**
   * Откат миграции - удаление всех созданных объектов
   * @param queryRunner - исполнитель SQL запросов
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаление таблиц в обратном порядке (с учетом внешних ключей)
    await queryRunner.query(`DROP TABLE IF EXISTS tasks;`);
    await queryRunner.query(`DROP TABLE IF EXISTS user_projects;`);
    await queryRunner.query(`DROP TABLE IF EXISTS projects;`);
    await queryRunner.query(`DROP TABLE IF EXISTS users;`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp";`);
  }
}
