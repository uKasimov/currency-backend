import { Router } from "express";
import { authRouter } from "./auth.router";
import { userRouter } from "./user.router";
import {currencyRouter} from "./currencies.router";

export const indexRouter = Router();

indexRouter.use("/user", userRouter);
indexRouter.use("/auth", authRouter);
indexRouter.use("/currencies", currencyRouter);
