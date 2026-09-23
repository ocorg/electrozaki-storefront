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
