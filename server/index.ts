import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sql, testConnection } from './db';
import { runMigration } from './migrate';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 1. Health & Status
app.get('/api/health', async (_req, res) => {
  const conn = await testConnection();
  if (conn.ok) {
    res.json({ status: 'ok', neon: 'connected', db: conn.dbName, timestamp: conn.timestamp });
  } else {
    res.status(500).json({ status: 'error', neon: 'disconnected', error: conn.error });
  }
});

// 2. Bootstrap (Carga completa unificada do sistema)
app.get('/api/bootstrap', async (_req, res) => {
  try {
    const rawCompanies = await sql`SELECT * FROM companies ORDER BY name ASC`;
    const rawControls = await sql`SELECT * FROM document_controls ORDER BY created_at ASC`;
    const rawRecords = await sql`SELECT * FROM check_records ORDER BY date DESC, checked_at DESC`;
    const rawUsers = await sql`SELECT * FROM user_accounts ORDER BY name ASC`;

    // Reestruturar controles dentro de suas respectivas empresas
    const companies = rawCompanies.map(comp => {
      const compControls = rawControls
        .filter(c => c.company_id === comp.id)
        .map(c => ({
          id: c.id,
          companyId: c.company_id,
          title: c.title,
          docCode: c.doc_code,
          revision: c.revision,
          pageInfo: c.page_info,
          popRef: c.pop_ref,
          emissionDate: c.emission_date,
          companyName: c.company_name,
          documentType: c.document_type,
          confidentialText: c.confidential_text,
          showColumnTimes: c.show_column_times !== false,
          sectors: typeof c.sectors === 'string' ? JSON.parse(c.sectors) : c.sectors || [],
          tasks: typeof c.tasks === 'string' ? JSON.parse(c.tasks) : c.tasks || [],
          createdAt: c.created_at,
          updatedAt: c.updated_at
        }));

      return {
        id: comp.id,
        name: comp.name,
        tradeName: comp.trade_name,
        cnpj: comp.cnpj,
        documentCodePrefix: comp.document_code_prefix,
        primaryColor: comp.primary_color,
        logoUrl: comp.logo_url,
        createdAt: comp.created_at,
        updatedAt: comp.updated_at,
        controls: compControls
      };
    });

    const records = rawRecords.map(r => ({
      id: r.id,
      companyId: r.company_id,
      controlId: r.control_id,
      taskId: r.task_id,
      taskName: r.task_name,
      sectorId: r.sector_id,
      date: r.date,
      dayNumber: r.day_number,
      month: r.month,
      year: r.year,
      scheduledTime: r.scheduled_time || undefined,
      checkedAt: r.checked_at,
      checkedTime: r.checked_time,
      userId: r.user_id,
      userName: r.user_name,
      userInitials: r.user_initials,
      status: r.status,
      delayMinutes: r.delay_minutes || 0,
      method: r.method,
      notes: r.notes || undefined,
      locationValidation: r.location_validation !== false
    }));

    const users = rawUsers.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      password: u.password,
      initials: u.initials,
      badgeNumber: u.badge_number,
      role: u.role,
      avatarColor: u.avatar_color
    }));

    res.json({
      ok: true,
      neon: 'connected',
      companies,
      records,
      users
    });
  } catch (err: any) {
    console.error('Erro no /api/bootstrap:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// 3. Empresas (Companies)
app.post('/api/companies', async (req, res) => {
  try {
    const comp = req.body;
    await sql`
      INSERT INTO companies (id, name, trade_name, cnpj, document_code_prefix, primary_color, logo_url, created_at, updated_at)
      VALUES (${comp.id}, ${comp.name}, ${comp.tradeName || ''}, ${comp.cnpj || ''}, ${comp.documentCodePrefix || 'DOC'}, ${comp.primaryColor || 'emerald'}, ${comp.logoUrl || ''}, ${comp.createdAt || new Date().toISOString()}, ${new Date().toISOString()})
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        trade_name = EXCLUDED.trade_name,
        cnpj = EXCLUDED.cnpj,
        document_code_prefix = EXCLUDED.document_code_prefix,
        primary_color = EXCLUDED.primary_color,
        logo_url = EXCLUDED.logo_url,
        updated_at = NOW();
    `;
    res.json({ ok: true, company: comp });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.delete('/api/companies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await sql`DELETE FROM companies WHERE id = ${id}`;
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// 4. Modelos de Controle (Document Controls)
app.post('/api/controls', async (req, res) => {
  try {
    const ctrl = req.body;
    await sql`
      INSERT INTO document_controls (
        id, company_id, title, doc_code, revision, page_info, pop_ref, emission_date,
        company_name, document_type, confidential_text, show_column_times, sectors, tasks, created_at, updated_at
      ) VALUES (
        ${ctrl.id}, ${ctrl.companyId}, ${ctrl.title}, ${ctrl.docCode}, ${ctrl.revision}, ${ctrl.pageInfo},
        ${ctrl.popRef}, ${ctrl.emissionDate}, ${ctrl.companyName}, ${ctrl.documentType}, ${ctrl.confidentialText},
        ${ctrl.showColumnTimes !== false}, ${JSON.stringify(ctrl.sectors)}, ${JSON.stringify(ctrl.tasks)},
        ${ctrl.createdAt || new Date().toISOString()}, ${new Date().toISOString()}
      )
      ON CONFLICT (id) DO UPDATE SET
        company_id = EXCLUDED.company_id,
        title = EXCLUDED.title,
        doc_code = EXCLUDED.doc_code,
        revision = EXCLUDED.revision,
        page_info = EXCLUDED.page_info,
        pop_ref = EXCLUDED.pop_ref,
        emission_date = EXCLUDED.emission_date,
        company_name = EXCLUDED.company_name,
        document_type = EXCLUDED.document_type,
        confidential_text = EXCLUDED.confidential_text,
        show_column_times = EXCLUDED.show_column_times,
        sectors = EXCLUDED.sectors,
        tasks = EXCLUDED.tasks,
        updated_at = NOW();
    `;
    res.json({ ok: true, control: ctrl });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.delete('/api/controls/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await sql`DELETE FROM document_controls WHERE id = ${id}`;
    await sql`DELETE FROM check_records WHERE control_id = ${id}`;
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// 5. Registros de Check (Check Records)
app.post('/api/records', async (req, res) => {
  try {
    const r = req.body;
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
      ON CONFLICT (id) DO UPDATE SET
        checked_time = EXCLUDED.checked_time,
        checked_at = EXCLUDED.checked_at,
        user_id = EXCLUDED.user_id,
        user_name = EXCLUDED.user_name,
        user_initials = EXCLUDED.user_initials,
        status = EXCLUDED.status,
        delay_minutes = EXCLUDED.delay_minutes,
        method = EXCLUDED.method,
        notes = EXCLUDED.notes;
    `;
    res.json({ ok: true, record: r });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.delete('/api/records/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await sql`DELETE FROM check_records WHERE id = ${id}`;
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Zerar Lançamentos
app.post('/api/records/clear', async (req, res) => {
  try {
    const { controlId, month, year } = req.body;
    if (month !== undefined && year !== undefined) {
      await sql`
        DELETE FROM check_records 
        WHERE control_id = ${controlId} AND month = ${month} AND year = ${year}
      `;
    } else {
      await sql`
        DELETE FROM check_records 
        WHERE control_id = ${controlId}
      `;
    }
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// 6. Usuários (Users)
app.post('/api/users', async (req, res) => {
  try {
    const u = req.body;
    await sql`
      INSERT INTO user_accounts (id, name, email, password, initials, badge_number, role, avatar_color)
      VALUES (${u.id}, ${u.name}, ${u.email || ''}, ${u.password || 'admin'}, ${u.initials}, ${u.badgeNumber}, ${u.role}, ${u.avatarColor})
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        password = EXCLUDED.password,
        initials = EXCLUDED.initials,
        badge_number = EXCLUDED.badge_number,
        role = EXCLUDED.role,
        avatar_color = EXCLUDED.avatar_color;
    `;
    res.json({ ok: true, user: u });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await sql`DELETE FROM user_accounts WHERE id = ${id}`;
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Inicialização
async function start() {
  try {
    // Garante migração prévia na inicialização
    await runMigration();
    app.listen(PORT, () => {
      console.log(`🚀 Servidor API do VerifIQ rodando na porta ${PORT} com Neon PostgreSQL`);
    });
  } catch (err) {
    console.error('Falha ao iniciar servidor:', err);
    process.exit(1);
  }
}

start();
