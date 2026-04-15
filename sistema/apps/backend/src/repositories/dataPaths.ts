import path from "path";

const DEFAULT_DATA_DIR = "data";

export function getDataDir(): string {
  return process.env.WEB_SCHOLAR_DATA_DIR ?? DEFAULT_DATA_DIR;
}

export function dataFile(fileName: string): string {
  return path.resolve(getDataDir(), fileName);
}
