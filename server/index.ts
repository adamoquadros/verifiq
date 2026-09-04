import dotenv from 'dotenv';
import { app } from './app';
import { runMigration } from './migrate';
import { isDbConfigured } from './db';

dotenv.config();

const PORT = process.env.PORT || 3001;

async function start() {
  try {
    if (isDbConfigured) {
      // Garante migração prévia na inicialização quando banco configurado
      await runMigration();
    } else {
      console.warn('⚠️ DATABASE_URL não configurada. Servidor operando em modo local.');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Servidor API do VerifIQ rodando na porta ${PORT} com Neon PostgreSQL`);
    });
  } catch (err) {
    console.error('Falha ao iniciar servidor:', err);
    process.exit(1);
  }
}

start();
