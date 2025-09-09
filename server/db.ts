import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Em ambiente de desenvolvimento, permitir execução sem banco de dados
let pool;
let db;

// Temporariamente desabilitado para desenvolvimento sem PostgreSQL
// if (!process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
//   throw new Error(
//     "DATABASE_URL must be set in production. Did you forget to provision a database?",
//   );
// }

if (process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
} else {
  console.warn('DATABASE_URL não definido. Funcionalidades de banco de dados não estarão disponíveis.');
  // Criar mock objects para evitar erros
  db = {
    select: () => ({ from: () => ({ where: () => [] }) }),
    insert: () => ({ values: () => ({ returning: () => [] }) }),
    update: () => ({ set: () => ({ where: () => [] }) }),
    delete: () => ({ where: () => [] })
  } as any;
  pool = {
    query: () => Promise.resolve({ rows: [] })
  } as any;
}

export { pool, db };