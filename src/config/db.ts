import "dotenv/config";

import postgres from "@prisma/orm-postgres/runtime";
import { contractFromJson } from "@prisma/orm-postgres/static";
import type { Contract } from "../../prisma/contract.d.js";
import contractJson from "../../prisma/contract.json" with { type: "json" };

const database_url = process.env["DATABASE_URL"]!;

if (!database_url) {
  throw new Error("Database connection failed");
}
const contract = contractFromJson<Contract>(contractJson);

export const db = postgres({
  contract,
  url: database_url,
});
