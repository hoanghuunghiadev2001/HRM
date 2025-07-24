// lib/prisma.ts
import { PrismaClient } from "../../generated/prisma";

// Biến toàn cục để giữ instance Prisma trong quá trình phát triển
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Tạo một instance duy nhất và tái sử dụng
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error'], // hoặc ['query', 'warn', 'error'] nếu muốn debug
  });

// Chỉ lưu vào biến toàn cục trong môi trường phát triển
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
