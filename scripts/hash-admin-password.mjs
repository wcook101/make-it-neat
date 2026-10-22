import { randomBytes, scryptSync } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const password = process.env.ADMIN_PASSWORD ?? "";
let value = password;
if (!value) {
  const prompt = createInterface({ input, output });
  value = await prompt.question("Admin password: ");
  prompt.close();
}
if (value.length < 12) {
  console.error("Use at least 12 characters.");
  process.exit(1);
}
const salt = randomBytes(16);
const key = scryptSync(value, salt, 32, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
console.log(`scrypt:16384:8:1:${salt.toString("base64url")}:${key.toString("base64url")}`);
