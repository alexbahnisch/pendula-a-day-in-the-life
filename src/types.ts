import z from "zod";

export const GoogleSheetsAction = z.object({
  Spreadsheet: z.string(),
  Sheet: z.string(),
  Name: z.string(),
  Response: z.string(),
});

export type GoogleSheetsAction = z.infer<typeof GoogleSheetsAction>;

export const Person = z.object({
  Name: z.string(),
  Number: z.string().regex(/^04\d{8}$/),
});

export type Person = z.infer<typeof Person>;

export const Persons = z.array(Person);

export type Persons = z.infer<typeof Persons>;

export const Result = z.object({
  Name: z.string(),
  Number: z.string().regex(/^04\d{8}$/),
  Accepted: z.boolean(),
});

export type Result = z.infer<typeof Result>;
