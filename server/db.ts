import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('⚠️ AVISO: DATABASE_URL não encontrada no arquivo .env');
}

// Instância SQL serverless otimizada para o Neon
export const sql = neon(connectionString || '');

export async function testConnection(): Promise<{ ok: boolean; timestamp?: string; dbName?: string; error?: string }> {
  try {
    const result = await sql`SELECT NOW() as current_time, current_database() as db_name`;
    return {
      ok: true,
      timestamp: result[0]?.current_time,
      dbName: result[0]?.db_name
    };
  } catch (err: any) {
    console.error('❌ Erro de conexão com Neon PostgreSQL:', err.message);
    return {
      ok: false,
      error: err.message
    };
  }
}
