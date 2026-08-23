export type UserRole = 'resident' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export type ComplaintStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
export type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type ComplaintCategory = 
  | 'PLUMBING' 
  | 'ELECTRICAL' 
  | 'CLEANING' 
  | 'SECURITY' 
  | 'MAINTENANCE' 
  | 'OTHER';

export interface ComplaintHistory {
  id: number;
  status: ComplaintStatus;
  actor_name: string;
  actor_role: UserRole;
  note: string | null;
  created_at: string;
}

export interface Complaint {
  id: number;
  resident_id: number;
  resident_name: string;
  category: ComplaintCategory;
  description: string;
  photo_url: string | null;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  created_at: string;
  updated_at: string | null;
  resolved_at: string | null;
  is_overdue: boolean;
  history: ComplaintHistory[];
}

export interface ComplaintCreate {
  category: ComplaintCategory;
  description: string;
  photo_url?: string;
}

export interface Notice {
  id: number;
  title: string;
  content: string;
  is_important: boolean;
  created_by: number;
  creator_name: string;
  created_at: string;
}

export interface NoticeCreate {
  title: string;
  content: string;
  is_important: boolean;
}

export interface DashboardStats {
  total: number;
  by_status: Record<string, number>;
  by_category: Record<string, number>;
  overdue: number;
}