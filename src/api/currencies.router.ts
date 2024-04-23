import { Router, Request, Response } from "express";
import { authenticate, validate } from "./middleware";
import {
  GetCurrenciesSchema,
  GetCurrencySchema,
  GetCurrenciesSchemaType,
} from "../schema/currency.schema";
import {
  getById,
  getCurrencies,
  updateAll,
} from "../service/currencies.service";

export const currencyRouter = Router();

currencyRouter.get(
  "/",
  authenticate(),
  validate(GetCurrenciesSchema),
  async (req: Request, res: Response) => {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const date = req.query.date ? (req.query.date as string) : undefined;
    const orderBy = req.query.orderBy
      ? (req.query.orderBy as "asc" | "desc")
      : undefined;

    const currencies = await getCurrencies({
      page,
      limit,
      date,
      orderBy,
    });

    if (!currencies.length) {
      return res.status(404).json("No currencies found");
    }

    return res.status(200).json(currencies);
  }
);

currencyRouter.get(
  "/:id",
  authenticate(),
  validate(GetCurrencySchema),
  async (req: Request, res: Response) => {
    const currencyId = req.params.id;
    const currency = await getById(currencyId);
    if (currency) {
      return res.status(200).json(currency);
    } else {
      return res.status(404).json({ error: "Currency not found" });
    }
  }
);

currencyRouter.post(
  "/update",
  authenticate({ isAdmin: true }),
  async (req: Request, res: Response) => {
    const newValues = await updateAll();
    return res.status(200).json(newValues);
  }
);
