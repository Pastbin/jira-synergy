import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Добавление участника в проект по email
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user) {
    return NextResponse.json({ error: "Неавторизован" }, { status: 401 });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email обязателен" }, { status: 400 });
    }

    // Проверяем, является ли текущий пользователь владельцем проекта
    const project = await prisma.project.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Проект не найден" }, { status: 404 });
    }

    if (project.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Только владелец может добавлять участников" }, { status: 403 });
    }

    // Ищем пользователя по email
    const userToAdd = await prisma.user.findUnique({
      where: { email },
    });

    if (!userToAdd) {
      return NextResponse.json({ error: "Пользователь с таким email не найден" }, { status: 404 });
    }

    // Добавляем участника с ролью (по умолчанию VIEWER)
    await prisma.projectMember.create({
      data: {
        projectId: id,
        userId: userToAdd.id,
        role: "EDITOR", // По умолчанию даем EDITOR, чтобы могли двигать
      },
    });

    return NextResponse.json({ message: "Участник успешно добавлен" });
  } catch (error) {
    console.error("Add Member Error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

// Получение списка всех участников проекта
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id: projectId } = await params;

  if (!session?.user) {
    return NextResponse.json({ error: "Неавторизован" }, { status: 401 });
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Проект не найден" }, { status: 404 });
    }

    // Собираем всех участников в плоский список
    const allMembers = [
      { ...project.owner, role: "ADMIN" },
      ...project.members.map((m) => ({ ...m.user, role: m.role })),
    ];

    return NextResponse.json(allMembers);
  } catch (error) {
    console.error("Get Members Error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

// Изменение роли или удаление участника
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id: projectId } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Неавторизован" }, { status: 401 });
  }

  try {
    const { userId, role, action } = await req.json();

    // Проверяем права отправителя (только ADMIN или Владелец проекта)
    const senderMembership = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: { where: { userId: session.user.id } },
      },
    });

    if (!senderMembership) return NextResponse.json({ error: "Проект не найден" }, { status: 404 });

    const isOwner = senderMembership.ownerId === session.user.id;
    const isAdmin = senderMembership.members[0]?.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "У вас нет прав для управления участниками" }, { status: 403 });
    }

    if (action === "REMOVE") {
      await prisma.projectMember.deleteMany({
        where: { projectId, userId },
      });
      return NextResponse.json({ message: "Участник удален" });
    }

    if (role) {
      // Ищем запись в ProjectMember (владельца нельзя менять через эту таблицу, так как его там нет)
      const member = await prisma.projectMember.findFirst({
        where: { projectId, userId },
      });

      if (!member) {
        return NextResponse.json({ error: "Участник не найден или является владельцем" }, { status: 404 });
      }

      await prisma.projectMember.update({
        where: { id: member.id },
        data: { role },
      });

      return NextResponse.json({ message: "Роль обновлена" });
    }

    return NextResponse.json({ error: "Неверные данные" }, { status: 400 });
  } catch (error) {
    console.error("Update Member Error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
