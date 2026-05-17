import "dotenv/config";
import { defineConfig, env } from "@prisma/config";

export default defineConfig({
  schema: "api/prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
