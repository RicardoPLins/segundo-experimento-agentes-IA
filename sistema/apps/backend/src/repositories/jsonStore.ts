import { promises as fs } from "fs";
import path from "path";
import { PersistenceError } from "../errors.js";

export class JsonStore<T> {
  constructor(
    private readonly filePath: string | (() => string),
    private readonly defaultValue: T
  ) {}

  async read(): Promise<T> {
    try {
      await this.ensureFile();
      const raw = await fs.readFile(this.resolveFilePath(), "utf-8");
      return JSON.parse(raw) as T;
    } catch (error) {
      throw new PersistenceError(`Failed to read JSON store: ${String(error)}`);
    }
  }

  async write(value: T): Promise<void> {
    const filePath = this.resolveFilePath();
    const dir = path.dirname(filePath);
    const tempPath = path.join(dir, `${path.basename(filePath)}.tmp`);
    try {
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(tempPath, JSON.stringify(value, null, 2), "utf-8");
      await fs.rename(tempPath, filePath);
    } catch (error) {
      throw new PersistenceError(`Failed to write JSON store: ${String(error)}`);
    }
  }

  private async ensureFile(): Promise<void> {
    try {
      await fs.access(this.resolveFilePath());
    } catch {
      await this.write(this.defaultValue);
    }
  }

  private resolveFilePath(): string {
    return typeof this.filePath === "function" ? this.filePath() : this.filePath;
  }
}
