import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAllowedTaskStatus } from "@/lib/taskUtils";

// Обновление задачи (например, смена статуса при Drag-and-Drop)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Неавторизован" }, { status: 401 });
  }

  const currentUserId = session.user.id;

  try {
    const body = await req.json();
    const { status, title, description, order, priority, assigneeIds } = body;

    if (status && !isAllowedTaskStatus(status)) {
      return NextResponse.json({ error: "Недопустимый статус задачи" }, { status: 400 });
    }

    // Проверка прав доступа: редактировать задачу может владелец или участник с доступом
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            members: {
              where: { userId: currentUserId },
            },
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Задача не найдена" }, { status: 404 });
    }

    const isOwner = task.project.ownerId === currentUserId;
    const member = task.project.members[0];
    const isEditor = member && member.role !== "VIEWER";

    if (!isOwner && !isEditor) {
      return NextResponse.json({ error: "У вас нет прав для изменения этой задачи" }, { status: 403 });
    }

    // Собираем лог изменений
    const activities = [];
    if (status && status !== task.status) {
      activities.push({
        type: "STATUS_CHANGE",
        content: `${task.status} -> ${status}`,
        taskId: id,
        userId: currentUserId,
      });
    }
    if (title && title !== task.title) {
      activities.push({
        type: "TITLE_CHANGE",
        content: title,
        taskId: id,
        userId: currentUserId,
      });
    }
    if (priority && priority !== task.priority) {
      activities.push({
        type: "PRIORITY_CHANGE",
        content: `${task.priority} -> ${priority}`,
        taskId: id,
        userId: currentUserId,
      });
    }

    const [updatedTask] = await prisma.$transaction([
      prisma.task.update({
        where: { id },
        data: {
          status: status || undefined,
          order: typeof order === "number" ? order : undefined,
          title: title || undefined,
          description: typeof description !== "undefined" ? description : undefined,
          priority: priority || undefined,
          assignees: assigneeIds
            ? {
                set: assigneeIds.map((id: string) => ({ id })),
              }
            : undefined,
        },
        include: {
          assignees: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      // Если есть изменения, создаем лог активности
      ...(activities.length > 0 ? activities.map((a) => prisma.activity.create({ data: a })) : []),
    ]);

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Task update error:", error);
    return NextResponse.json({ error: "Ошибка при обновлении задачи" }, { status: 500 });
  }
}

// Удаление задачи
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Неавторизован" }, { status: 401 });
  }

  const currentUserId = session.user.id;

  try {
    // Проверка прав доступа перед удалением
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            members: {
              where: { userId: currentUserId },
            },
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Задача не найдена" }, { status: 404 });
    }

    const isOwner = task.project.ownerId === currentUserId;
    const member = task.project.members[0];
    const isAdmin = member && member.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Удалять задачи может только владелец или администратор проекта" },
        { status: 403 },
      );
    }

    await prisma.task.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Task deletion error:", error);
    return NextResponse.json({ error: "Ошибка при удалении задачи" }, { status: 500 });
  }
}
