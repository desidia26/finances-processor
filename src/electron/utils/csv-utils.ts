import { promises as fs } from 'fs';
import type { Finance } from './types';

async function processChaseCSV(filePath: string) : Promise<Finance[]> {
  let text = await fs.readFile(filePath, 'utf-8');
  let lines = text.split("\n");
  let headers = lines[0].split(",");
  if (headers.includes("Balance")) {
    return processDebitLines(lines);
  }
  else {
    return processCreditLines(lines);
  }
}

function processCreditLines(lines: string[]) : Finance[] {
  let finances : Finance[] = [];
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
      finances.push({ description, date, amount, type: "income" });
    } else {
      finances.push({ description, date, amount: Math.abs(amount), type: "expense", category });
    }
  }
  return finances;
}

function processDebitLines(lines: string[]) : Finance[] {
  let finances : Finance[] = [];
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
      finances.push({ description, date, amount, type: "income" });
    } else if (!description.includes('Payment to Chase card ending')) {
      finances.push({ description, date, amount: Math.abs(amount), type: "expense", category });
    }
  }
  return finances;
}

export { processChaseCSV };