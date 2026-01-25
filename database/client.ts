import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import * as schema from "./schema";

const expoDb = openDatabaseSync("lockedin.db");
export const db = drizzle(expoDb, { schema });
