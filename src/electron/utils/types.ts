export type Finance = {
  description: string;
  date: string;
  amount: number;
  category?: string;
  type: "income" | "expense";
}