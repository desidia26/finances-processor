import { type Income, type Expense, CSVResults } from "../types";


async function processChaseCSV(file: File) : Promise<CSVResults> {
  let text = await file.text();
  let lines = text.split("\n");
  let headers = lines[0].split(",");
  if (headers.includes("Balance")) {
    return processDebitLines(lines);
  }
  else {
    return processCreditLines(lines);
  }
}

function processCreditLines(lines: string[]) : CSVResults {
  let expenses : Expense[] = [];
  let income : Income[] = [];
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].length === 0 || lines[i].includes("Payment")) {
      continue;
    }
    let line = lines[i].split(",");
    let amount = Number(line[5]);
    let description = line[2]
    let date = line[0];
    let category = line[3];
    if (amount > 0) {
      income.push({ description, date, amount });
    } else {
      expenses.push({ description, date, amount: Math.abs(amount), category });
    }
  }
  return new CSVResults({ income, expenses });
}

function processDebitLines(lines: string[]) : CSVResults {
  let income : Income[] = []
  let expenses : Expense[] = [];
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].length === 0) {
      continue;
    }
    let line = lines[i].split(",");
    let amount = Number(line[3]);
    let description = line[2]
    let date = line[1];
    let category = line[4];
    if (amount > 0) {
      income.push({ description, date, amount });
    } else if (!description.includes('Payment to Chase card ending')) {
      expenses.push({ description, date, amount: Math.abs(amount), category });
    }
  }
  return new CSVResults({ income, expenses });
}

export { processChaseCSV };