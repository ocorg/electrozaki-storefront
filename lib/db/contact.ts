import { prisma } from "./client";

type ContactMessageInput = {
  name: string;
  phone?: string;
  email?: string;
  message: string;
};

export async function createContactMessage(input: ContactMessageInput) {
  return prisma.contactMessage.create({
    data: {
      name: input.name,
      phone: input.phone,
      email: input.email,
      message: input.message,
    },
  });
}

// Admin-only — only ever called from app/admin routes, which proxy.ts gates
// behind the admin session cookie. No read/unread flag in the schema, so
// this is a plain chronological list.
export async function listContactMessages() {
  return prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
}

export async function countRecentContactMessages(days = 7): Promise<number> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return prisma.contactMessage.count({ where: { createdAt: { gte: since } } });
}
