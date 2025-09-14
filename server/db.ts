import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

// Em ambiente de desenvolvimento, permitir execução sem banco de dados
let client;
let db;

// Temporariamente desabilitado para desenvolvimento sem PostgreSQL
// if (!process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
//   throw new Error(
//     "DATABASE_URL must be set in production. Did you forget to provision a database?",
//   );
// }

if (process.env.DATABASE_URL) {
  client = postgres(process.env.DATABASE_URL);
  db = drizzle(client, { schema });
} else {
  console.warn('DATABASE_URL não definido. Funcionalidades de banco de dados não estarão disponíveis.');
  // Criar mock objects para evitar erros
  db = {
    select: () => ({ from: () => ({ where: () => [] }) }),
    insert: () => ({ values: () => ({ returning: () => [] }) }),
    update: () => ({ set: () => ({ where: () => [] }) }),
    delete: () => ({ where: () => [] })
  } as any;
  client = {
    query: () => Promise.resolve({ rows: [] })
  } as any;
}

export { client as pool, db };