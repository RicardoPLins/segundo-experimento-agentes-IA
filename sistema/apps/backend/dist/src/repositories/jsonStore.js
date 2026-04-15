import { promises as fs } from "fs";
import path from "path";
import { PersistenceError } from "../errors.js";
export class JsonStore {
    filePath;
    defaultValue;
    constructor(filePath, defaultValue) {
        this.filePath = filePath;
        this.defaultValue = defaultValue;
    }
    async read() {
        try {
            await this.ensureFile();
            const raw = await fs.readFile(this.resolveFilePath(), "utf-8");
            return JSON.parse(raw);
        }
        catch (error) {
            throw new PersistenceError(`Failed to read JSON store: ${String(error)}`);
        }
    }
    async write(value) {
        const filePath = this.resolveFilePath();
        const dir = path.dirname(filePath);
        const tempPath = path.join(dir, `${path.basename(filePath)}.tmp`);
        try {
            await fs.mkdir(dir, { recursive: true });
            await fs.writeFile(tempPath, JSON.stringify(value, null, 2), "utf-8");
            await fs.rename(tempPath, filePath);
        }
        catch (error) {
            throw new PersistenceError(`Failed to write JSON store: ${String(error)}`);
        }
    }
    async ensureFile() {
        try {
            await fs.access(this.resolveFilePath());
        }
        catch {
            await this.write(this.defaultValue);
        }
    }
    resolveFilePath() {
        return typeof this.filePath === "function" ? this.filePath() : this.filePath;
    }
}
