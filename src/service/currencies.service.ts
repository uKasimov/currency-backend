import { prisma } from "../db/client";
import axios from "axios";
import { parseString } from "xml2js";
import {CurrencyQueryOptionsSchemaType, ParsedDataSchemaType} from "../schema/currency.schema";

const MARKET_URL = "http://www.cbr.ru/scripts/XML_daily.asp";


export async function getCurrencies(options: CurrencyQueryOptionsSchemaType) {
  const { page, limit, date, orderBy } = options;
  const skip = (page - 1) * limit;

  const queryOptions: any = {
    skip,
    take: limit,
    include: {
      exchangeRates: {
        orderBy: { date: orderBy || "asc" },
        take: -1,
      },
    },
  };
  if (date) queryOptions.include.exchangeRates.where = { date };

  return await prisma.currency.findMany(queryOptions);
}

export async function getById(currencyId: string) {
  return prisma.currency.findUnique({
    where: { cbrId: currencyId },
    include: {
      exchangeRates: {
        orderBy: { date: "desc" },
      },
    },
  });
}

export async function updateAll(): Promise<ParsedDataSchemaType> {
  const response = await axios.get(MARKET_URL);
  const jsonData = await parseXML(response.data);
  const currencies = jsonData.ValCurs.Valute;
  const marketDate = jsonData.ValCurs.$.Date;

  for (const currency of currencies) {
    const candidate = {
      cbrId: currency.$.ID,
      name: currency.Name[0],
      nominal: parseInt(currency.Nominal[0]),
      code: currency.CharCode[0],
      numCode: parseInt(currency.NumCode[0]),
      exchangeRate: parseFloat(currency.Value[0].replace(",", ".")),
      vunitRate: parseFloat(currency.VunitRate[0].replace(",", ".")),
    };

    const existingCurrency = await prisma.currency.findUnique({
      where: { cbrId: candidate.cbrId },
    });

    if (existingCurrency) {
      const existingExchangeRate = await prisma.exchangeRate.findFirst({
        where: {
          AND: [{ currencyId: existingCurrency.cbrId }, { date: marketDate }],
        },
      });

      if (existingExchangeRate) {
        await prisma.exchangeRate.update({
          where: { id: existingExchangeRate.id },
          data: { exchangeRate: candidate.exchangeRate },
        });
      } else {
        await prisma.exchangeRate.create({
          data: {
            currencyId: existingCurrency.cbrId,
            exchangeRate: candidate.exchangeRate,
            vunitRate: candidate.vunitRate,
            date: marketDate,
          },
        });
      }
    } else {
      await prisma.currency.create({
        data: {
          cbrId: candidate.cbrId,
          name: candidate.name,
          nominal: candidate.nominal,
          code: candidate.code,
          numCode: candidate.numCode,
          exchangeRates: {
            create: [
              {
                exchangeRate: candidate.exchangeRate,
                vunitRate: candidate.vunitRate,
                date: marketDate,
              },
            ],
          },
        },
      });
    }
  }
  return jsonData;
}

function parseXML(xml: string): Promise<ParsedDataSchemaType> {
  return new Promise((resolve, reject) => {
    parseString(xml, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result as ParsedDataSchemaType);
      }
    });
  });
}
