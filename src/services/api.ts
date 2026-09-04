import type { Company, DocumentControl, CheckRecord, UserAccount } from '../types';

export interface BootstrapResponse {
  ok: boolean;
  neon: 'connected' | 'disconnected';
  companies: Company[];
  records: CheckRecord[];
  users: UserAccount[];
}

export const api = {
  async getHealth(): Promise<{ status: string; neon: string; db?: string } | null> {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async getBootstrap(): Promise<BootstrapResponse | null> {
    try {
      const res = await fetch('/api/bootstrap');
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn('API /api/bootstrap inacessível, utilizando dados locais de contingência:', err);
      return null;
    }
  },

  async saveCompany(company: Company): Promise<boolean> {
    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(company)
      });
      return res.ok;
    } catch (err) {
      console.warn('Falha ao salvar empresa no Neon:', err);
      return false;
    }
  },

  async deleteCompany(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/companies/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch (err) {
      console.warn('Falha ao excluir empresa no Neon:', err);
      return false;
    }
  },

  async saveControl(control: DocumentControl): Promise<boolean> {
    try {
      const res = await fetch('/api/controls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(control)
      });
      return res.ok;
    } catch (err) {
      console.warn('Falha ao salvar controle no Neon:', err);
      return false;
    }
  },

  async deleteControl(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/controls/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch (err) {
      console.warn('Falha ao excluir controle no Neon:', err);
      return false;
    }
  },

  async saveRecord(record: CheckRecord): Promise<boolean> {
    try {
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
      return res.ok;
    } catch (err) {
      console.warn('Falha ao salvar check no Neon:', err);
      return false;
    }
  },

  async deleteRecord(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/records/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch (err) {
      console.warn('Falha ao excluir check no Neon:', err);
      return false;
    }
  },

  async clearRecords(controlId: string, month?: number, year?: number): Promise<boolean> {
    try {
      const res = await fetch('/api/records/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ controlId, month, year })
      });
      return res.ok;
    } catch (err) {
      console.warn('Falha ao zerar registros no Neon:', err);
      return false;
    }
  },

  async saveUser(user: UserAccount): Promise<boolean> {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      return res.ok;
    } catch (err) {
      console.warn('Falha ao salvar usuário no Neon:', err);
      return false;
    }
  },

  async deleteUser(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch (err) {
      console.warn('Falha ao excluir usuário no Neon:', err);
      return false;
    }
  }
};
