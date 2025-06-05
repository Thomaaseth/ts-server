import type { MigrationConfig } from "drizzle-orm/migrator";

process.loadEnvFile();

function envOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is required`);
  }
  return value;
}

const migrationConfig: MigrationConfig = {
  migrationsFolder: "./src/db/migrations",
};

type APIConfig = {
  fileserverHits: number;
  db: {
    url: string,
    migrationConfig: MigrationConfig,
  };
  platform: string;
  secret: string;
  polkaKey: string;
}

export const config: APIConfig = {
  fileserverHits: 0,
  db: {
    url: envOrThrow("DB_URL"),
    migrationConfig: migrationConfig,
  },
  platform: envOrThrow("PLATFORM"),
  secret: envOrThrow("SECRET"),
  polkaKey: envOrThrow("POLKA_KEY")
}

