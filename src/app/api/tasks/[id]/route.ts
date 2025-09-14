import { NextRequest, NextResponse } from 'next/server';
import { TaskRepository } from '@/lib/db/repositories/TaskRepository';
import { UpdateTaskRequest } from '@/lib/types/api/tasks';

const taskRepository = new TaskRepository();

/**
 * GET /api/tasks/[id]
 * Получение задачи по ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const task = await taskRepository.findById(params.id);
    
    if (!task) {
      return NextResponse.json(
        { error: 'Задача не найдена' },
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Ошибка при получении задачи:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера при получении задачи' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/tasks/[id]
 * Полное обновление задачи
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskData: UpdateTaskRequest = await request.json();
    
    // Проверяем существование задачи
    const existingTask = await taskRepository.findById(params.id);
    if (!existingTask) {
      return NextResponse.json(
        { error: 'Задача не найдена' },
        { status: 404 }
      );
    }

    const updatedTask = await taskRepository.update(params.id, taskData);
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Ошибка при обновлении задачи:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера при обновлении задачи' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tasks/[id]
 * Удаление задачи
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await taskRepository.delete(params.id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Задача не найдена' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Задача успешно удалена' });
  } catch (error) {
    console.error('Ошибка при удалении задачи:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера при удалении задачи' },
      { status: 500 }
    );
  }
}