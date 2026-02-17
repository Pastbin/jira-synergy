import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Получение списка комментариев к задаче
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: taskId } = await params;
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  try {
    const comments = await prisma.comment.findMany({
      where: { taskId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json({ error: "Ошибка при получении комментариев" }, { status: 500 });
  }
}

// Добавление нового комментария
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: taskId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  try {
    const { text } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Текст комментария не может быть пустым" }, { status: 400 });
    }

    // Создаем комментарий и запись в логе активности в одной транзакции
    const [comment] = await prisma.$transaction([
      prisma.comment.create({
        data: {
          text,
          taskId,
          authorId: session.user.id,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.activity.create({
        data: {
          type: "COMMENT_ADDED",
          content: text.length > 50 ? text.substring(0, 50) + "..." : text,
          taskId,
          userId: session.user.id,
        },
      }),
    ]);

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Comment error:", error);
    return NextResponse.json({ error: "Ошибка при добавлении комментария" }, { status: 500 });
  }
}
