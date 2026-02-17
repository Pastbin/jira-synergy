import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Получение истории изменений задачи (лог активностей)
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: taskId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  try {
    const activities = await prisma.activity.findMany({
      where: { taskId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(activities);
  } catch (error) {
    return NextResponse.json({ error: "Ошибка при получении истории активностей" }, { status: 500 });
  }
}
