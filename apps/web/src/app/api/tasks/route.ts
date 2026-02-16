import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Создание новой задачи
export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Неавторизован" }, { status: 401 });
  }

  try {
    const { title, description, status, projectId } = await req.json();

    if (!title || !projectId) {
      return NextResponse.json({ error: "Название и ID проекта обязательны" }, { status: 400 });
    }

    // Проверяем, является ли пользователь владельцем проекта (или участником в будущем)
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Проект не найден или нет доступа" }, { status: 403 });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || "TODO",
        projectId,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Task creation error:", error);
    return NextResponse.json({ error: "Ошибка при создании задачи" }, { status: 500 });
  }
}
