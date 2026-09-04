import type { Company, DocumentControl, CheckRecord, UserAccount } from '../types';
import { neonCloud, type CloudBootstrapData } from './neonCloud';

export type BootstrapResponse = CloudBootstrapData;

export const api = {
  async getHealth(): Promise<{ status: string; neon: string; db?: string } | null> {
    try {
      const isConnected = await neonCloud.testConnection();
      return {
        status: isConnected ? 'ok' : 'offline',
        neon: isConnected ? 'connected' : 'disconnected',
        db: 'neondb'
      };
    } catch {
      return { status: 'offline', neon: 'disconnected' };
    }
  },

  async getBootstrap(): Promise<BootstrapResponse | null> {
    try {
      const data = await neonCloud.getBootstrap();
      if (data && data.ok) {
        return data;
      }
      return null;
    } catch (err) {
      console.warn('Falha ao sincronizar com Neon Cloud, utilizando armazenamento local:', err);
      return null;
    }
  },

  async saveCompany(company: Company): Promise<boolean> {
    return await neonCloud.saveCompany(company);
  },

  async deleteCompany(id: string): Promise<boolean> {
    return await neonCloud.deleteCompany(id);
  },

  async saveControl(control: DocumentControl): Promise<boolean> {
    return await neonCloud.saveControl(control);
  },

  async deleteControl(id: string): Promise<boolean> {
    return await neonCloud.deleteControl(id);
  },

  async saveRecord(record: CheckRecord): Promise<boolean> {
    return await neonCloud.saveRecord(record);
  },

  async deleteRecord(id: string): Promise<boolean> {
    return await neonCloud.deleteRecord(id);
  },

  async clearRecords(controlId: string, month?: number, year?: number): Promise<boolean> {
    return await neonCloud.clearRecords(controlId, month, year);
  },

  async saveUser(user: UserAccount): Promise<boolean> {
    return await neonCloud.saveUser(user);
  },

  async deleteUser(id: string): Promise<boolean> {
    return await neonCloud.deleteUser(id);
  }
};
