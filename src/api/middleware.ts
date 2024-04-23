import { AnyZodObject } from "zod";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "config";
import { prisma } from "../db/client";
import { jwtPayloadSchema } from "../schema/auth.schema";
import { User } from "@prisma/client";

export const validate =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      return next();
    } catch (error) {
      return res.status(400).json(error);
    }
  };

export const authenticate =
    ({ isAdmin = false } = {}) =>
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const header = req.header("Authorization");
                if (!header) {
                    return res.status(401).send("No authorization header found"!);
                }
                const token = header.replace("Bearer ", "");
                if (!token) {
                    return res.status(401).send("Invalid authorization header!");
                }

                const jwtPayload = jwt.verify(token, config.get("auth.jwtSecret"));
                const verifiedPayload = await jwtPayloadSchema.parseAsync(jwtPayload);

                const user = await prisma.user.findUnique({
                    where: { id: verifiedPayload.id },
                });
                if (user === null) {
                    return res
                        .status(404)
                        .send(`User with id ${verifiedPayload.id} not found!`);
                }

                if (isAdmin && user.role !== 'ADMIN') {
                    return res.status(403).send("Access forbidden. Admin privileges required.");
                }

                (req as AuthorizedRequest).user = user;

                return next();
            } catch (error) {
                return res.status(400).json(error);
            }
        };


export type AuthorizedRequest = Request & { user: User };
