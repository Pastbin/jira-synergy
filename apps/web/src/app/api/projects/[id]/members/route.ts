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
