
export interface Company {
  id: number;
  name: string;
  industry: string;
  status: string;
  manager: string;
  notes?: string;
  // Tab 1: Identity & Contact
  taxId?: string;
  foundingDate?: string;
  address?: string;
  authorizedPerson?: string;
  email?: string;
  phone?: string;
  socialLinks?: {
    website?: string;
    instagram?: string;
    linkedin?: string;
  };
  // Tab 2: Contract & Agency
  agencyStartDate?: string;
  contractDetails?: string;
  servicePackage?: string;
  paymentNotes?: string;
  servicesProvided?: string[]; // e.g. ["Google Ads", "SEO"]
  toolsUsed?: string[];
  // Tab 3: Configuration
  kpiConfig?: Record<string, boolean>; // e.g. { "LinkedIn": false, "Google Ads": true }
  // Tab 4: Initial Analysis
  initialAnalysis?: string;
}

export interface Product {
  name: string;
  price: number;
  cost: number;
  volume: number;
  profit: number;
  type: string;
}

export interface ProductSale {
  id: string;
  name: string;
  qty: number;
  price: number;
  cost: number;
}

export interface AppData {
  companies: Company[];
  db: Record<string, Record<string, any>>;
  products: Product[];
}

export interface SelectedDate {
  year: number;
  month: number;
}

export interface PageHeaderProps {
  companies: Company[];
  selectedCompanyId: number | null;
  setSelectedCompanyId: (id: number | null) => void;
  selectedDate: SelectedDate;
  setSelectedDate: (date: SelectedDate) => void;
  setActivePage: (page: string) => void;
}

declare global {
  interface Window {
    __firebase_config?: string;
    __app_id?: string;
    __initial_auth_token?: string;
  }
}