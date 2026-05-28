import type { FormEvent } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";

import { formatRecurrence } from "./preview-format";
import type { FamilyCategory, RecurringLine } from "./types";

const recurrenceOptions = [1, 2, 3, 6, 12];

interface LineEditDialogProps {
  categories: FamilyCategory[];
  line: RecurringLine | null;
  onClose: () => void;
  onSave: (line: RecurringLine) => void;
  open: boolean;
}

export function LineEditDialog({
  categories,
  line,
  onClose,
  onSave,
  open,
}: LineEditDialogProps) {
  if (!line) {
    return null;
  }

  const minValue = line.minAmount ?? line.amount;
  const maxValue = line.maxAmount ?? line.amount;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!line) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const isEstimate = formData.has("isEstimate");

    onSave({
      ...line,
      amount: getNumberValue(formData, "amount", line.amount),
      categoryId: getStringValue(formData, "categoryId", line.categoryId),
      description: getStringValue(formData, "description", line.description),
      isEstimate,
      maxAmount: isEstimate
        ? getNumberValue(formData, "maxAmount", maxValue)
        : undefined,
      minAmount: isEstimate
        ? getNumberValue(formData, "minAmount", minValue)
        : undefined,
      movement:
        getStringValue(formData, "movement", line.movement) === "positive"
          ? "positive"
          : "negative",
      recurrenceMonths: getNumberValue(
        formData,
        "recurrenceMonths",
        line.recurrenceMonths,
      ),
      title: getStringValue(formData, "title", line.title),
    });
  }

  return (
    <Dialog fullWidth maxWidth="md" onClose={onClose} open={open}>
      <DialogTitle>Modifier une ligne</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2.25} sx={{ pt: 1 }}>
            <Stack direction={{ sm: "row", xs: "column" }} spacing={2}>
              <TextField
                defaultValue={line.title}
                fullWidth
                id={`${line.id}-edit-title`}
                label="Intitulé"
                name="title"
              />
              <TextField
                defaultValue={line.categoryId}
                fullWidth
                id={`${line.id}-edit-category`}
                label="Catégorie"
                name="categoryId"
                select
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            <TextField
              defaultValue={line.description}
              fullWidth
              id={`${line.id}-edit-description`}
              label="Description"
              minRows={3}
              multiline
              name="description"
            />

            <Stack direction={{ sm: "row", xs: "column" }} spacing={2}>
              <TextField
                defaultValue={line.movement}
                fullWidth
                id={`${line.id}-edit-movement`}
                label="Mouvement"
                name="movement"
                select
              >
                <MenuItem value="positive">Entrée</MenuItem>
                <MenuItem value="negative">Sortie</MenuItem>
              </TextField>
              <TextField
                defaultValue={line.amount}
                fullWidth
                id={`${line.id}-edit-amount`}
                label="Montant"
                name="amount"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">€</InputAdornment>
                    ),
                  },
                }}
              />
              <TextField
                defaultValue={line.recurrenceMonths}
                fullWidth
                id={`${line.id}-edit-recurrence`}
                label="Récurrence"
                name="recurrenceMonths"
                select
              >
                {recurrenceOptions.map((months) => (
                  <MenuItem key={months} value={months}>
                    {formatRecurrence(months)}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            <FormControlLabel
              control={
                <Checkbox defaultChecked={line.isEstimate} name="isEstimate" />
              }
              label="Utiliser une estimation"
            />

            <Stack direction={{ sm: "row", xs: "column" }} spacing={2}>
              <TextField
                defaultValue={minValue}
                fullWidth
                id={`${line.id}-edit-min-value`}
                label="Valeur minimum"
                name="minAmount"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">€</InputAdornment>
                    ),
                  },
                }}
              />
              <TextField
                defaultValue={maxValue}
                fullWidth
                id={`${line.id}-edit-max-value`}
                label="Valeur maximum"
                name="maxAmount"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">€</InputAdornment>
                    ),
                  },
                }}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} type="button">
            Annuler
          </Button>
          <Button type="submit" variant="contained">
            Enregistrer
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

function getStringValue(
  formData: FormData,
  name: string,
  fallback: string,
): string {
  const value = formData.get(name);

  if (typeof value !== "string") {
    return fallback;
  }

  return value.trim() || fallback;
}

function getNumberValue(
  formData: FormData,
  name: string,
  fallback: number,
): number {
  const value = formData.get(name);

  if (typeof value !== "string") {
    return fallback;
  }

  const normalizedValue = value.trim().replace(",", ".");

  if (!normalizedValue) {
    return fallback;
  }

  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}
