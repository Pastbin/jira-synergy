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
    const { title, description, status, projectId, priority, assigneeIds } = await req.json();

    if (!title || !projectId) {
      return NextResponse.json({ error: "Название и ID проекта обязательны" }, { status: 400 });
    }

    // Проверяем доступ: владелец или участник с правом EDITOR/ADMIN
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: session.user.id },
          { members: { some: { userId: session.user.id, role: { in: ["ADMIN", "EDITOR"] } } } },
        ],
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Проект не найден или нет прав для создания задач" }, { status: 403 });
    }

    const lastTask = await prisma.task.findFirst({
      where: { projectId, status: status || "TODO" },
      orderBy: { order: "desc" },
    });

    const newOrder = lastTask ? lastTask.order + 1000 : 1000;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || "TODO",
        priority: priority || "MEDIUM",
        order: newOrder,
        projectId,
        assignees: assigneeIds
          ? {
              connect: assigneeIds.map((id: string) => ({ id })),
            }
          : undefined,
      },
      include: {
        assignees: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Task creation error:", error);
    return NextResponse.json({ error: "Ошибка при создании задачи" }, { status: 500 });
  }
}
