import { execFileSync } from "node:child_process";
import { exportJWK, exportPKCS8, generateKeyPair } from "jose";

const keys = await generateKeyPair("RS256");
const privateKey = (await exportPKCS8(keys.privateKey)).trimEnd().replace(/\n/g, " ");
const publicKey = await exportJWK(keys.publicKey);
const jwks = JSON.stringify({ keys: [{ use: "sig", ...publicKey }] });
const convex = "./node_modules/convex/bin/main.js";
const node = "C:\\Program Files\\nodejs\\node.exe";

for (const [name, value] of [
  ["SITE_URL", "https://onlice-gestion.vercel.app"],
  ["JWT_PRIVATE_KEY", privateKey],
  ["JWKS", jwks],
]) {
  execFileSync(node, [convex, "env", "set", "--prod", "--", name, value], {
    stdio: "ignore",
  });
}

console.log("Convex Auth production variables configured.");
