import { Pool } from "pg";
import { requireEnv, requireEnvI } from "./env";

export const pool = new Pool({
	host: requireEnv("PG_HOST"),
	user: requireEnv("PG_PASSWORD"),
	password: requireEnv("PG_PASSWORD"),
	max: requireEnvI("PG_MAX")
});
