import { sql, testConnection } from './db';
import { INITIAL_COMPANIES, INITIAL_USERS, generateSampleRecords } from '../src/data/initialData';

export async function runMigration() {
  console.log('🚀 Iniciando migração e configuração do banco Neon PostgreSQL...');

  const conn = await testConnection();
  if (!conn.ok) {
    throw new Error(`Falha na conexão com Neon: ${conn.error}`);
  }
  console.log(`✅ Conexão estabelecida com sucesso com o banco "${conn.dbName}" em ${conn.timestamp}`);

  // 1. Criação das tabelas
  console.log('📦 Criando tabelas no PostgreSQL...');

  await sql`
    CREATE TABLE IF NOT EXISTS companies (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      trade_name VARCHAR(255),
      cnpj VARCHAR(50),
      document_code_prefix VARCHAR(20),
      primary_color VARCHAR(50),
      logo_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS document_controls (
      id VARCHAR(100) PRIMARY KEY,
      company_id VARCHAR(100) REFERENCES companies(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      doc_code VARCHAR(100) NOT NULL,
      revision VARCHAR(50),
      page_info VARCHAR(50),
      pop_ref VARCHAR(100),
      emission_date VARCHAR(50),
      company_name VARCHAR(255),
      document_type VARCHAR(100),
      confidential_text TEXT,
      show_column_times BOOLEAN DEFAULT TRUE,
      sectors JSONB NOT NULL DEFAULT '[]',
      tasks JSONB NOT NULL DEFAULT '[]',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS check_records (
      id VARCHAR(180) PRIMARY KEY,
      company_id VARCHAR(100),
      control_id VARCHAR(100),
      task_id VARCHAR(100),
      task_name VARCHAR(255),
      sector_id VARCHAR(100),
      date VARCHAR(20),
      day_number INT,
      month INT,
      year INT,
      scheduled_time VARCHAR(20),
      checked_at TIMESTAMPTZ,
      checked_time VARCHAR(20),
      user_id VARCHAR(100),
      user_name VARCHAR(255),
      user_initials VARCHAR(20),
      status VARCHAR(50),
      delay_minutes INT DEFAULT 0,
      method VARCHAR(50),
      notes TEXT,
      location_validation BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_records_control_month ON check_records(control_id, month, year);
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_records_company ON check_records(company_id);
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS user_accounts (
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      initials VARCHAR(20),
      badge_number VARCHAR(50),
      role VARCHAR(50),
      avatar_color VARCHAR(50),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  console.log('✅ Tabelas e índices verificados e prontos.');

  // 2. Seed inicial se o banco estiver vazio
  const existingCompanies = await sql`SELECT COUNT(*)::int as count FROM companies`;
  const count = existingCompanies[0]?.count || 0;

  if (count === 0) {
    console.log('🌱 Banco vazio detectado. Populando com dados iniciais (Herbarium, modelos e usuários)...');

    // Inserir Usuários
    for (const u of INITIAL_USERS) {
      await sql`
        INSERT INTO user_accounts (id, name, email, password, initials, badge_number, role, avatar_color)
        VALUES (${u.id}, ${u.name}, ${u.email || ''}, ${u.password || 'admin'}, ${u.initials}, ${u.badgeNumber}, ${u.role}, ${u.avatarColor})
        ON CONFLICT (id) DO NOTHING;
      `;
    }

    // Inserir Empresas e Controles
    for (const comp of INITIAL_COMPANIES) {
      await sql`
        INSERT INTO companies (id, name, trade_name, cnpj, document_code_prefix, primary_color, logo_url, created_at, updated_at)
        VALUES (${comp.id}, ${comp.name}, ${comp.tradeName || ''}, ${comp.cnpj || ''}, ${comp.documentCodePrefix || 'DOC'}, ${comp.primaryColor || 'emerald'}, ${comp.logoUrl || ''}, ${comp.createdAt || new Date().toISOString()}, ${comp.updatedAt || new Date().toISOString()})
        ON CONFLICT (id) DO NOTHING;
      `;

      for (const ctrl of comp.controls) {
        await sql`
          INSERT INTO document_controls (
            id, company_id, title, doc_code, revision, page_info, pop_ref, emission_date,
            company_name, document_type, confidential_text, show_column_times, sectors, tasks, created_at, updated_at
          ) VALUES (
            ${ctrl.id}, ${comp.id}, ${ctrl.title}, ${ctrl.docCode}, ${ctrl.revision}, ${ctrl.pageInfo},
            ${ctrl.popRef}, ${ctrl.emissionDate}, ${ctrl.companyName}, ${ctrl.documentType}, ${ctrl.confidentialText},
            ${ctrl.showColumnTimes !== false}, ${JSON.stringify(ctrl.sectors)}, ${JSON.stringify(ctrl.tasks)},
            ${ctrl.createdAt || new Date().toISOString()}, ${ctrl.updatedAt || new Date().toISOString()}
          )
          ON CONFLICT (id) DO NOTHING;
        `;
      }
    }

    // Inserir registros de amostra para testes imediatos
    const sampleRecords = generateSampleRecords(new Date());
    console.log(`📝 Gravando ${sampleRecords.length} registros de amostragem inicial no Neon...`);

    for (const r of sampleRecords) {
      await sql`
        INSERT INTO check_records (
          id, company_id, control_id, task_id, task_name, sector_id, date, day_number, month, year,
          scheduled_time, checked_at, checked_time, user_id, user_name, user_initials, status, delay_minutes,
          method, notes, location_validation
        ) VALUES (
          ${r.id}, ${r.companyId}, ${r.controlId}, ${r.taskId}, ${r.taskName}, ${r.sectorId},
          ${r.date}, ${r.dayNumber}, ${r.month}, ${r.year}, ${r.scheduledTime || null}, ${r.checkedAt},
          ${r.checkedTime}, ${r.userId}, ${r.userName}, ${r.userInitials}, ${r.status}, ${r.delayMinutes || 0},
          ${r.method}, ${r.notes || null}, ${r.locationValidation !== false}
        )
        ON CONFLICT (id) DO NOTHING;
      `;
    }

    console.log('✅ Carga de dados iniciais (Seed) finalizada com sucesso!');
  } else {
    console.log(`ℹ️ Banco de dados já possui ${count} empresa(s) cadastrada(s). Migração concluída.`);
  }
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}` || process.argv[1]?.endsWith('migrate.ts')) {
  runMigration()
    .then(() => {
      console.log('🎉 Migração concluída com sucesso!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Falha na migração:', err);
      process.exit(1);
    });
}
