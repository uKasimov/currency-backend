import { Router, Request, Response } from "express";
import { userUpdate } from "../schema/user.schema";
import { authenticate, AuthorizedRequest, validate } from "./middleware";
import { prisma } from "../db/client";

export const userRouter = Router();

userRouter.put(
  "/",
  authenticate(),
  validate(userUpdate),
  async (req: Request, res: Response) => {
    const user = (req as AuthorizedRequest).user;
    const result = await prisma.user.update({
      where: { id: user.id },
      data: req.body,
    });
    return res.status(200).send(result);
  }
);
