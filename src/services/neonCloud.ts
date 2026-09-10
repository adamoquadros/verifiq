import { neon } from '@neondatabase/serverless';
import type { Company, DocumentControl, CheckRecord, UserAccount } from '../types';

// Connection string oficial do Neon PostgreSQL (Pooler AWS sa-east-1)
const NEON_CONNECTION_STRING = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_DATABASE_URL) ||
  'postgresql://neondb_owner:npg_tMJOpxA71onk@ep-purple-queen-ac0udtxr-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require';

// Instância SQL serverless direta
export const sql = neon(NEON_CONNECTION_STRING);

export interface CloudBootstrapData {
  ok: boolean;
  neon: 'connected' | 'disconnected';
  companies: Company[];
  records: CheckRecord[];
  users: UserAccount[];
}

export const neonCloud = {
  // 1. Teste de Conectividade
  async testConnection(): Promise<boolean> {
    try {
      const res = await sql`SELECT 1 as alive`;
      return Array.isArray(res) && res.length > 0;
    } catch (err) {
      console.warn('Falha na verificação de conectividade com Neon:', err);
      return false;
    }
  },

  // 2. Carga Completa (Bootstrap)
  async getBootstrap(): Promise<CloudBootstrapData | null> {
    try {
      const [rawCompanies, rawControls, rawRecords, rawUsers] = await Promise.all([
        sql`SELECT * FROM companies ORDER BY name ASC`,
        sql`SELECT * FROM document_controls ORDER BY created_at ASC`,
        sql`SELECT * FROM check_records ORDER BY date DESC, checked_at DESC`,
        sql`SELECT * FROM user_accounts ORDER BY name ASC`
      ]);

      const companies: Company[] = rawCompanies.map((comp: any) => {
        const compControls = rawControls
          .filter((c: any) => c.company_id === comp.id)
          .map((c: any) => ({
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

      const records: CheckRecord[] = rawRecords.map((r: any) => ({
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

      // Garante que a coluna company_id exista na tabela
      try {
        await sql`ALTER TABLE user_accounts ADD COLUMN IF NOT EXISTS company_id VARCHAR(100)`;
      } catch {}

      const users: UserAccount[] = rawUsers.map((u: any) => {
        const company = u.company_id ? companies.find(c => c.id === u.company_id) : undefined;
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          password: u.password,
          initials: u.initials,
          badgeNumber: u.badge_number,
          role: (u.role === 'SUPERVISOR' ? 'VIEWER' : u.role) || 'OPERATOR',
          avatarColor: u.avatar_color,
          companyId: u.company_id || undefined,
          companyName: company?.name
        };
      });

      return {
        ok: true,
        neon: 'connected',
        companies,
        records,
        users
      };
    } catch (err) {
      console.warn('Erro ao carregar dados da nuvem Neon:', err);
      return null;
    }
  },

  // 3. Usuários (Salvar / Criar / Editar)
  async saveUser(u: UserAccount): Promise<boolean> {
    try {
      // Garante que a coluna company_id exista na tabela
      try {
        await sql`ALTER TABLE user_accounts ADD COLUMN IF NOT EXISTS company_id VARCHAR(100)`;
      } catch {
        // ignora se já existir
      }

      await sql`
        INSERT INTO user_accounts (id, name, email, password, initials, badge_number, role, avatar_color, company_id)
        VALUES (${u.id}, ${u.name}, ${u.email || ''}, ${u.password || '1234'}, ${u.initials}, ${u.badgeNumber}, ${u.role}, ${u.avatarColor}, ${u.companyId || null})
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          password = EXCLUDED.password,
          initials = EXCLUDED.initials,
          badge_number = EXCLUDED.badge_number,
          role = EXCLUDED.role,
          avatar_color = EXCLUDED.avatar_color,
          company_id = EXCLUDED.company_id;
      `;
      return true;
    } catch (err) {
      console.error('Erro ao salvar usuário no Neon:', err);
      return false;
    }
  },

  // Excluir Usuário
  async deleteUser(id: string): Promise<boolean> {
    try {
      await sql`DELETE FROM user_accounts WHERE id = ${id}`;
      return true;
    } catch (err) {
      console.error('Erro ao excluir usuário no Neon:', err);
      return false;
    }
  },

  // 4. Registros de Check (Salvar / Deletar / Zerar)
  async saveRecord(r: CheckRecord): Promise<boolean> {
    try {
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
      return true;
    } catch (err) {
      console.error('Erro ao salvar check no Neon:', err);
      return false;
    }
  },

  async deleteRecord(id: string): Promise<boolean> {
    try {
      await sql`DELETE FROM check_records WHERE id = ${id}`;
      return true;
    } catch (err) {
      console.error('Erro ao excluir check no Neon:', err);
      return false;
    }
  },

  async clearRecords(controlId: string, month?: number, year?: number): Promise<boolean> {
    try {
      if (month !== undefined && year !== undefined) {
        await sql`DELETE FROM check_records WHERE control_id = ${controlId} AND month = ${month} AND year = ${year}`;
      } else {
        await sql`DELETE FROM check_records WHERE control_id = ${controlId}`;
      }
      return true;
    } catch (err) {
      console.error('Erro ao zerar registros no Neon:', err);
      return false;
    }
  },

  // 5. Modelos de Controle
  async saveControl(ctrl: DocumentControl): Promise<boolean> {
    try {
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
      return true;
    } catch (err) {
      console.error('Erro ao salvar controle no Neon:', err);
      return false;
    }
  },

  async deleteControl(id: string): Promise<boolean> {
    try {
      await sql`DELETE FROM document_controls WHERE id = ${id}`;
      await sql`DELETE FROM check_records WHERE control_id = ${id}`;
      return true;
    } catch (err) {
      console.error('Erro ao excluir controle no Neon:', err);
      return false;
    }
  },

  // 6. Empresas
  async saveCompany(comp: Company): Promise<boolean> {
    try {
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
      return true;
    } catch (err) {
      console.error('Erro ao salvar empresa no Neon:', err);
      return false;
    }
  },

  async deleteCompany(id: string): Promise<boolean> {
    try {
      await sql`DELETE FROM companies WHERE id = ${id}`;
      return true;
    } catch (err) {
      console.error('Erro ao excluir empresa no Neon:', err);
      return false;
    }
  }
};
