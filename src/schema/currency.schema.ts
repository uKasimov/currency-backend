import { z } from 'zod';

export const GetCurrenciesSchema = z.object({
    page: z.number().int().min(1).optional(),
    limit: z.number().int().min(1).optional(),
});

export const GetCurrencySchema = z.object({
    cbrId: z.string().optional(),
});

export const ValuteSchema = z.object({
    $: z.object({
        ID: z.string()
    }),
    NumCode: z.array(z.string()),
    CharCode: z.array(z.string()),
    Nominal: z.array(z.string()),
    Name: z.array(z.string()),
    Value: z.array(z.string()),
    VunitRate: z.array(z.string()),
});

export const ValCursSchema = z.object({
    $: z.object({
        Date: z.string(),
        name: z.string(),
    }),
    Valute: z.array(ValuteSchema),
});

export const ParsedDataSchema = z.object({
    ValCurs: ValCursSchema,
});
export const CurrencyQueryOptionsSchema = z.object({
    page: z.number(),
    limit: z.number(),
    date: z.string().optional(),
    orderBy: z.enum(["asc", "desc"]).optional(),
    exchangeRateOrderBy: z.enum(["asc", "desc"]).optional()
});


// Infer TypeScript types from Zod schemas
export type GetCurrenciesSchemaType = z.infer<typeof GetCurrenciesSchema>;
export type ValuteSchemaType = z.infer<typeof ValuteSchema>;
export type ValCursSchemaType = z.infer<typeof ValCursSchema>;
export type ParsedDataSchemaType = z.infer<typeof ParsedDataSchema>;
export type CurrencyQueryOptionsSchemaType = z.infer<typeof CurrencyQueryOptionsSchema>;


