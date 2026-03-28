import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";
import { logger } from "./lib/logger";

const { Pool } = pg;

const dbUrl = process.env.DATABASE_URL || process.env.REPLIT_DB_URL;

if (!dbUrl) {
  logger.warn("DATABASE_URL nao esta definida no seu arquivo .env. O banco de dados nao funcionara corretamente ate que voce preencha as credenciais.");
}

// Criamos o pool mesmo se dbUrl for nula, mas passamos uma string vazia para evitar erro de inicializacao imediata
// se dbUrl estiver ausente. O erro ocorrera apenas na primeira tentativa de query.
export const pool = new Pool({ 
  connectionString: dbUrl || "postgres://dummy:dummy@localhost:5432/dummy",
  connectionTimeoutMillis: 5000,
  max: 20,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  logger.error('ERRO INESPERADO NO POOL DO POSTGRES', { 
    message: err.message, 
    code: (err as any).code,
    stack: err.stack 
  });
  if (err.message.includes('Tenant or user not found')) {
    logger.warn('DICA DE CONFIGURACAO: O Project ID ou a senha no DATABASE_URL estao possivelmente incorretos no .env');
  }
});

// Metrics and monitoring
export const dbMetrics = {
  totalQueries: 0,
  slowQueries: 0,
  errors: 0,
  queryTimes: [] as number[],
  lastReset: new Date(),
};

// Wrap query to track performance
const originalQuery = pool.query.bind(pool);
pool.query = (async (text: any, params: any, callback: any) => {
  const start = Date.now();
  dbMetrics.totalQueries++;
  
  try {
    const result = await originalQuery(text, params, callback);
    const duration = Date.now() - start;
    dbMetrics.queryTimes.push(duration);
    if (duration > 100) dbMetrics.slowQueries++; // Slow query threshold: 100ms
    if (dbMetrics.queryTimes.length > 1000) dbMetrics.queryTimes.shift(); // Keep last 1000
    return result;
  } catch (err) {
    dbMetrics.errors++;
    throw err;
  }
}) as any;

export const db = drizzle(pool, { schema });

export function getDBStats() {
  const avgTime = dbMetrics.queryTimes.length > 0 
    ? dbMetrics.queryTimes.reduce((a, b) => a + b, 0) / dbMetrics.queryTimes.length 
    : 0;
  
  return {
    ...dbMetrics,
    avgQueryTimeMs: Math.round(avgTime * 100) / 100,
    pool: {
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount,
    }
  };
}
