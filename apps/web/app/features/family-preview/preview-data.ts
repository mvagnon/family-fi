import type { FamilyCategory, FamilyMember, RecurringLine } from "./types";

export const familyMembers: FamilyMember[] = [
  {
    id: "lea",
    name: "Léa",
    role: "Parent",
    professionalCategory: "Pro. Léa",
  },
  {
    id: "marc",
    name: "Marc",
    role: "Parent",
    professionalCategory: "Pro. Marc",
  },
];

export const familyCategories: FamilyCategory[] = [
  { id: "budget", label: "Budget", kind: "shared" },
  { id: "heart", label: "Cœur", kind: "shared" },
  { id: "credit", label: "Crédit", kind: "shared" },
  { id: "leisure", label: "Loisir", kind: "shared" },
  { id: "pro-lea", label: "Pro. Léa", kind: "professional", ownerId: "lea" },
  { id: "pro-marc", label: "Pro. Marc", kind: "professional", ownerId: "marc" },
];

export const recurringLines: RecurringLine[] = [
  {
    id: "rent",
    title: "Loyer",
    description: "Appartement familial et charges incluses",
    categoryId: "budget",
    movement: "negative",
    amount: 1850,
    isEstimate: false,
    recurrenceMonths: 1,
  },
  {
    id: "lea-salary",
    title: "Salaire Léa",
    description: "Revenu salarié net",
    categoryId: "pro-lea",
    movement: "positive",
    amount: 4200,
    isEstimate: false,
    recurrenceMonths: 1,
  },
  {
    id: "groceries",
    title: "Courses",
    description: "Alimentation, hygiène et produits maison",
    categoryId: "heart",
    movement: "negative",
    amount: 690,
    isEstimate: true,
    recurrenceMonths: 1,
    minAmount: 620,
    maxAmount: 760,
  },
  {
    id: "car-loan",
    title: "Crédit auto",
    description: "Mensualité du véhicule familial",
    categoryId: "credit",
    movement: "negative",
    amount: 315,
    isEstimate: false,
    recurrenceMonths: 1,
  },
  {
    id: "piano",
    title: "Cours piano",
    description: "Activité enfant",
    categoryId: "leisure",
    movement: "negative",
    amount: 90,
    isEstimate: false,
    recurrenceMonths: 1,
  },
  {
    id: "marc-freelance",
    title: "Mission freelance Marc",
    description: "Revenu variable facturé tous les deux mois",
    categoryId: "pro-marc",
    movement: "positive",
    amount: 950,
    isEstimate: true,
    recurrenceMonths: 2,
    minAmount: 700,
    maxAmount: 1200,
  },
];
