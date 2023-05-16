export type Income = {
  description: string;
  date: string;
  amount: number;
}

export type Expense = Income &{
  category: string;
}

export type CSVResultType = {
  income: Income[];
  expenses: Expense[];
}

export class CSVResults{
  income: Income[];
  expenses: Expense[];

  constructor(data: CSVResultType) {
    this.income = data.income;
    this.expenses = data.expenses;
  }

  concat(csvResult: CSVResultType) {
    this.income = [...this.income, ...csvResult.income];
    this.expenses = [...this.expenses, ...csvResult.expenses];
  }
}