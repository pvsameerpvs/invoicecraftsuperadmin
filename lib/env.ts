import { z } from "zod";

const envSchema = z.object({
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string().min(1),
  GOOGLE_PRIVATE_KEY: z.string().min(1),
  MASTER_SHEET_ID: z.string().min(1),
  COOKIE_SECRET: z.string().min(32),
  ROOT_DOMAIN: z.string().min(1).default("invoicecraftjs.com"),
  USER_TEMPLATE_SHEET_ID: z.string().min(1),
  USER_SHEET_FOLDER_ID: z.string().min(1),
});

export const env = envSchema.parse({
  GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY,
  MASTER_SHEET_ID: process.env.MASTER_SHEET_ID,
  COOKIE_SECRET: process.env.COOKIE_SECRET,
  ROOT_DOMAIN: process.env.ROOT_DOMAIN,
  USER_TEMPLATE_SHEET_ID: process.env.USER_TEMPLATE_SHEET_ID,
  USER_SHEET_FOLDER_ID: process.env.USER_SHEET_FOLDER_ID,
});
