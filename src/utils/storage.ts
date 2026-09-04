import type { Company, DocumentControl, CheckRecord, UserAccount } from '../types';
import { INITIAL_COMPANIES, INITIAL_USERS, generateSampleRecords } from '../data/initialData';

const STORAGE_KEYS = {
  COMPANIES: 'hlb_companies_v3',
  ACTIVE_COMPANY_ID: 'hlb_active_company_id_v3',
  ACTIVE_CONTROL_ID: 'hlb_active_control_id_v3',
  RECORDS: 'hlb_records_v3',
  USERS: 'hlb_users_v3',
  AUTH_USER: 'hlb_auth_user_v3'
};

export const storage = {
  // COMPANIES
  getCompanies(): Company[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMPANIES);
      if (!data) return INITIAL_COMPANIES;
      const parsed: Company[] = JSON.parse(data);
      const herbarium = parsed.find(c => c.id === 'comp-herbarium');
      if (herbarium) {
        const hasSanitarios = herbarium.controls.some(c => c.id === 'ctrl-sanitarios-hlb-0003' || c.docCode === 'HLB-ANX-0003');
        if (!hasSanitarios) {
          const defaultSanitarios = INITIAL_COMPANIES.find(c => c.id === 'comp-herbarium')?.controls.find(c => c.id === 'ctrl-sanitarios-hlb-0003');
          if (defaultSanitarios) {
            herbarium.controls.push(defaultSanitarios);
            localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(parsed));
          }
        }
      }
      return parsed;
    } catch {
      return INITIAL_COMPANIES;
    }
  },

  saveCompanies(companies: Company[]) {
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));
  },

  getActiveCompanyId(): string {
    const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_COMPANY_ID);
    const companies = this.getCompanies();
    if (stored && companies.some(c => c.id === stored)) {
      return stored;
    }
    return companies[0]?.id || INITIAL_COMPANIES[0].id;
  },

  setActiveCompanyId(id: string) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_COMPANY_ID, id);
    const comp = this.getCompanies().find(c => c.id === id);
    if (comp && comp.controls.length > 0) {
      this.setActiveControlId(comp.controls[0].id);
    }
  },

  getActiveCompany(): Company {
    const companies = this.getCompanies();
    const activeId = this.getActiveCompanyId();
    return companies.find(c => c.id === activeId) || companies[0] || INITIAL_COMPANIES[0];
  },

  saveCompany(company: Company): Company[] {
    const companies = this.getCompanies();
    const idx = companies.findIndex(c => c.id === company.id);
    let updated: Company[];

    if (idx >= 0) {
      updated = [...companies];
      updated[idx] = { ...company, updatedAt: new Date().toISOString() };
    } else {
      updated = [
        ...companies,
        {
          ...company,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    }

    this.saveCompanies(updated);
    return updated;
  },

  deleteCompany(companyId: string): Company[] {
    const companies = this.getCompanies().filter(c => c.id !== companyId);
    const finalCompanies = companies.length > 0 ? companies : INITIAL_COMPANIES;
    this.saveCompanies(finalCompanies);

    // Delete associated records
    const records = this.getRecords().filter(r => r.companyId !== companyId);
    this.saveRecords(records);

    if (this.getActiveCompanyId() === companyId) {
      this.setActiveCompanyId(finalCompanies[0].id);
    }

    return finalCompanies;
  },

  // CONTROLS (within Active Company)
  getActiveControlId(): string {
    const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_CONTROL_ID);
    const activeComp = this.getActiveCompany();
    if (stored && activeComp.controls.some(c => c.id === stored)) {
      return stored;
    }
    return activeComp.controls[0]?.id || '';
  },

  setActiveControlId(id: string) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CONTROL_ID, id);
  },

  getActiveControl(): DocumentControl {
    const activeComp = this.getActiveCompany();
    const activeCtrlId = this.getActiveControlId();
    return activeComp.controls.find(c => c.id === activeCtrlId) || activeComp.controls[0];
  },

  saveControl(control: DocumentControl): { updatedCompany: Company; companies: Company[] } {
    const companies = this.getCompanies();
    const compIdx = companies.findIndex(c => c.id === control.companyId);
    const targetComp = companies[compIdx] || this.getActiveCompany();

    const ctrlIdx = targetComp.controls.findIndex(c => c.id === control.id);
    let updatedControls: DocumentControl[];

    if (ctrlIdx >= 0) {
      updatedControls = [...targetComp.controls];
      updatedControls[ctrlIdx] = { ...control, updatedAt: new Date().toISOString() };
    } else {
      updatedControls = [
        ...targetComp.controls,
        {
          ...control,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    }

    const updatedComp: Company = {
      ...targetComp,
      controls: updatedControls,
      updatedAt: new Date().toISOString()
    };

    const updatedCompanies = [...companies];
    const actualCompIdx = companies.findIndex(c => c.id === updatedComp.id);
    if (actualCompIdx >= 0) {
      updatedCompanies[actualCompIdx] = updatedComp;
    } else {
      updatedCompanies.push(updatedComp);
    }

    this.saveCompanies(updatedCompanies);
    return { updatedCompany: updatedComp, companies: updatedCompanies };
  },

  duplicateControl(controlId: string): { newControl: DocumentControl; updatedCompany: Company; companies: Company[] } {
    const activeComp = this.getActiveCompany();
    const source = activeComp.controls.find(c => c.id === controlId) || activeComp.controls[0];

    const newId = `ctrl-${Date.now()}`;
    const newControl: DocumentControl = {
      ...JSON.parse(JSON.stringify(source)),
      id: newId,
      title: `${source.title} (CÓPIA)`,
      docCode: `${source.docCode}-CPY`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tasks: source.tasks.map(t => ({
        ...t,
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        qrPayload: `HLB-CHECK:${activeComp.id}:${newId}:${t.code}:${t.name.toUpperCase().replace(/\s+/g, '_')}`
      }))
    };

    const { updatedCompany, companies } = this.saveControl(newControl);
    this.setActiveControlId(newId);

    return { newControl, updatedCompany, companies };
  },

  deleteControl(controlId: string): { updatedCompany: Company; companies: Company[] } {
    const activeComp = this.getActiveCompany();
    const remainingControls = activeComp.controls.filter(c => c.id !== controlId);
    
    const updatedComp: Company = {
      ...activeComp,
      controls: remainingControls
    };

    const companies = this.getCompanies().map(c => c.id === updatedComp.id ? updatedComp : c);
    this.saveCompanies(companies);

    if (remainingControls.length > 0) {
      this.setActiveControlId(remainingControls[0].id);
    }

    // Delete records
    const records = this.getRecords().filter(r => r.controlId !== controlId);
    this.saveRecords(records);

    return { updatedCompany: updatedComp, companies };
  },

  // RECORDS
  getRecords(): CheckRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECORDS);
      if (data) return JSON.parse(data);
      const initial = generateSampleRecords(new Date());
      this.saveRecords(initial);
      return initial;
    } catch {
      return generateSampleRecords(new Date());
    }
  },

  saveRecords(records: CheckRecord[]) {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  },

  // USERS & AUTH
  getUsers(): UserAccount[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  },

  saveUsers(users: UserAccount[]) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  getAuthUser(): UserAccount | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      if (data) return JSON.parse(data);
      // Default to first admin
      return INITIAL_USERS[0];
    } catch {
      return INITIAL_USERS[0];
    }
  },

  setAuthUser(user: UserAccount | null) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    }
  },

  // RESET & BACKUP
  resetToDefault(): { companies: Company[]; records: CheckRecord[]; users: UserAccount[]; authUser: UserAccount } {
    localStorage.clear();
    const records = generateSampleRecords(new Date());
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(INITIAL_COMPANIES));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_COMPANY_ID, INITIAL_COMPANIES[0].id);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CONTROL_ID, INITIAL_COMPANIES[0].controls[0].id);
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(INITIAL_USERS[0]));

    return {
      companies: INITIAL_COMPANIES,
      records,
      users: INITIAL_USERS,
      authUser: INITIAL_USERS[0]
    };
  },

  exportBackupJson(): string {
    const data = {
      version: 3,
      companies: this.getCompanies(),
      activeCompanyId: this.getActiveCompanyId(),
      activeControlId: this.getActiveControlId(),
      records: this.getRecords(),
      users: this.getUsers(),
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  },

  importBackupJson(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.companies && data.records) {
        this.saveCompanies(data.companies);
        this.saveRecords(data.records);
        if (data.users) this.saveUsers(data.users);
        if (data.activeCompanyId) this.setActiveCompanyId(data.activeCompanyId);
        if (data.activeControlId) this.setActiveControlId(data.activeControlId);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to import backup', e);
      return false;
    }
  }
};
