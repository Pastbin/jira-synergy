import { NextRequest, NextResponse } from 'next/server';
import { TaskRepository } from '@/lib/db/repositories/TaskRepository';
import { TaskStatus } from '@/lib/entities/Task';
import { UpdateTaskStatusRequest } from '@/lib/types/api/tasks';

const taskRepository = new TaskRepository();

/**
 * PATCH /api/tasks/[id]/status
 * Изменение статуса задачи
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status }: UpdateTaskStatusRequest = await request.json();
    
    // Валидация статуса
    const validStatuses: TaskStatus[] = ['todo', 'in_progress', 'review', 'testing', 'done'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Неверный статус задачи. Допустимые значения: todo, in_progress, review, testing, done' },
        { status: 400 }
      );
    }

    // Проверяем существование задачи
    const existingTask = await taskRepository.findById(params.id);
    if (!existingTask) {
      return NextResponse.json(
        { error: 'Задача не найдена' },
        { status: 404 }
      );
    }

    const updatedTask = await taskRepository.updateStatus(params.id, status);
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Ошибка при изменении статуса задачи:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера при изменении статуса задачи' },
      { status: 500 }
    );
  }
}