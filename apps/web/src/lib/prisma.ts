import { PrismaClient } from "@prisma/client";

// Инициализация синглтона Prisma Client для предотвращения множественных подключений
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
