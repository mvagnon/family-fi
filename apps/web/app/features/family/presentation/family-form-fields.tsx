import InputAdornment from "@mui/material/InputAdornment";
import { z } from "zod";

export function requiredTextSchema(message: string) {
  return z.string({ error: message }).trim().min(1, { message });
}

export function requiredNumberTextSchema(message: string) {
  return z
    .string({ error: message })
    .trim()
    .min(1, { message })
    .transform((value) => Number(value.replace(",", ".")))
    .refine((value) => Number.isFinite(value), { message });
}

export function requiredIntegerTextSchema(message: string) {
  return requiredNumberTextSchema(message).refine(Number.isInteger, {
    message,
  });
}

export function getFieldErrorMessage(error: { message?: unknown } | undefined) {
  return typeof error?.message === "string" ? error.message : undefined;
}

export function getAmountSlotProps(currencySymbol: string) {
  return {
    htmlInput: {
      inputMode: "decimal",
    },
    input: {
      startAdornment: (
        <InputAdornment position="start">{currencySymbol}</InputAdornment>
      ),
    },
  } as const;
}
