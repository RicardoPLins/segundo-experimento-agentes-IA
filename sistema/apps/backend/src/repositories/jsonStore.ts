import { promises as fs } from "fs";
import path from "path";
import { PersistenceError } from "../errors.js";

export class JsonStore<T> {
  constructor(private readonly filePath: string, private readonly defaultValue: T) {}

  async read(): Promise<T> {
    try {
      await this.ensureFile();
      const raw = await fs.readFile(this.filePath, "utf-8");
      return JSON.parse(raw) as T;
    } catch (error) {
      throw new PersistenceError(`Failed to read JSON store: ${String(error)}`);
    }
  }

  async write(value: T): Promise<void> {
    const dir = path.dirname(this.filePath);
    const tempPath = path.join(dir, `${path.basename(this.filePath)}.tmp`);
    try {
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(tempPath, JSON.stringify(value, null, 2), "utf-8");
      await fs.rename(tempPath, this.filePath);
    } catch (error) {
      throw new PersistenceError(`Failed to write JSON store: ${String(error)}`);
    }
  }

  private async ensureFile(): Promise<void> {
    try {
      await fs.access(this.filePath);
    } catch {
      await this.write(this.defaultValue);
    }
  }
}
