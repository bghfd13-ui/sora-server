import * as path from "path";
import * as fs from "fs";
const projectDir = path.resolve(process.cwd());
export const Config = JSON.parse(fs.readFileSync(path.join(projectDir, "/config.json")).toString());
export default Config;
