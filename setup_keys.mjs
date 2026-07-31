import { execFileSync } from "node:child_process";
import { exportJWK, exportPKCS8, generateKeyPair } from "jose";

const keys = await generateKeyPair("RS256");
const privateKey = (await exportPKCS8(keys.privateKey)).trimEnd().replace(/\n/g, " ");
const publicKey = await exportJWK(keys.publicKey);
const jwks = JSON.stringify({ keys: [{ use: "sig", ...publicKey }] });

const node = process.execPath;
const convexBin = "./node_modules/convex/bin/main.js";

for (const [name, value] of [
  ["JWT_PRIVATE_KEY", privateKey],
  ["JWKS", jwks],
]) {
  execFileSync(node, [convexBin, "env", "set", "--", name, value], { stdio: "inherit" });
}

console.log("Convex Auth dev keys set successfully.");
