import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// API эндпоинт для регистрации нового пользователя
export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    // Проверка существования пользователя
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Пользователь уже существует" }, { status: 400 });
    }

    // Хеширование пароля перед сохранением в БД
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание записи пользователя
    await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ message: "Пользователь успешно создан" }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
