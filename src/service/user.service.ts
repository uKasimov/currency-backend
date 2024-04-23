import { prisma } from "../db/client";
import bcrypt from "bcrypt";
import { UserCreate, UserReturn } from "../schema/user.schema";

export async function registerUser(
  payload: UserCreate
): Promise<UserReturn | null> {
  const user = await prisma.user.findMany({
    where: { OR: [{ username: payload.username }, { email: payload.email }] },
  });
  if (user.length) {
    return null;
  }
  const hashedPassword = await bcrypt.hash(payload.password, 10);
  return await prisma.user.create({
    data: { ...payload, password: hashedPassword },
  });
}
