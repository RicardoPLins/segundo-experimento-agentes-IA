import path from "path";
const DEFAULT_DATA_DIR = "data";
export function getDataDir() {
    return process.env.WEB_SCHOLAR_DATA_DIR ?? DEFAULT_DATA_DIR;
}
export function dataFile(fileName) {
    return path.resolve(getDataDir(), fileName);
}
