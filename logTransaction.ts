import fs from "fs/promises";

export function log(data: any) {
  return fs.appendFile('tx-logs.json', JSON.stringify(data) + '\n');
}
