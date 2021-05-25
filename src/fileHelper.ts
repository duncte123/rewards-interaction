import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

export function txtFile(fileName: string): string {
  return path.join(__dirname, '..', 'txtFiles', fileName);
}

export function writeFile(fileName: string, content: string): void {
  fs.writeFileSync(txtFile(fileName), content);
}

export function clearFile(fileName: string): void {
  writeFile(fileName, '');
}
