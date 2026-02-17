import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Получение деталей проекта и связанных с ним задач
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user) {
    return NextResponse.json({ error: "Неавторизован" }, { status: 401 });
  }

  try {
    const project = await prisma.project.findFirst({
      where: {
        id: id,
        OR: [{ ownerId: session.user.id }, { members: { some: { userId: session.user.id } } }],
      },
      include: {
        tasks: {
          include: {
            assignees: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { order: "asc" },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Проект не найден" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("GET Project by ID Error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
