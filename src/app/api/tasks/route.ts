import { NextRequest, NextResponse } from 'next/server';
import { TaskRepository } from '@/lib/db/repositories/TaskRepository';
import { TaskStatus } from '@/lib/entities/Task';
import { CreateTaskRequest, GetTasksQueryParams } from '@/lib/types/api/tasks';

const taskRepository = new TaskRepository();

/**
 * GET /api/tasks
 * Получение списка задач с возможностью фильтрации
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const assigneeId = searchParams.get('assigneeId');
    const status = searchParams.get('status') as TaskStatus | null;

    // Валидация query параметров
    const queryParams: GetTasksQueryParams = {
      projectId: projectId || undefined,
      assigneeId: assigneeId || undefined,
      status: status || undefined
    };

    let tasks;
    
    if (projectId && status) {
      tasks = await taskRepository.findByStatus(projectId, status);
    } else if (projectId) {
      tasks = await taskRepository.findByProject(projectId);
    } else if (assigneeId) {
      tasks = await taskRepository.findByAssignee(assigneeId);
    } else {
      return NextResponse.json(
        { error: 'Необходимо указать projectId, assigneeId или status для фильтрации' },
        { status: 400 }
      );
    }

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Ошибка при получении задач:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера при получении задач' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tasks
 * Создание новой задачи
 */
export async function POST(request: NextRequest) {
  try {
    const taskData: CreateTaskRequest = await request.json();
    
    // Валидация обязательных полей
    if (!taskData.title || !taskData.projectId || !taskData.creatorId) {
      return NextResponse.json(
        { error: 'Обязательные поля: title, projectId, creatorId' },
        { status: 400 }
      );
    }

    const task = await taskRepository.create(taskData);
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Ошибка при создании задачи:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера при создании задачи' },
      { status: 500 }
    );
  }
}