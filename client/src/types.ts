export type Role = "admin" | "mentor" | "student";

export type UserStatus = "active" | "suspended";

export type OpportunityType =
  | "project"
  | "internship"
  | "research"
  | "hackathon"
  | "collaboration";

export type OpportunityStatus =
  | "draft"
  | "pending_approval"
  | "published"
  | "closed"
  | "rejected";

export type ApplicationStatus =
  | "pending"
  | "shortlisted"
  | "selected"
  | "rejected"
  | "waitlisted"
  | "withdrawn"
  | "completed";

export type User = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: string;
  name: string;
};

export type Opportunity = {
  id: string;
  title: string;
  description: string;
  type: OpportunityType;
  capacity: number;
  deadline: string;
  startDate: string | null;
  imageUrl: string | null;
  attachmentUrl: string | null;
  status: OpportunityStatus;
  owner: User;
  category: Category | null;
  createdAt: string;
  updatedAt: string;
};

export type Application = {
  id: string;
  status: ApplicationStatus;
  coverNote: string | null;
  mentorNote: string | null;
  student: User;
  opportunity: Opportunity;
  createdAt: string;
  updatedAt: string;
};

export type DashboardResponse = {
  role: Role;
  metrics: Record<string, number>;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
  role: Extract<Role, "student" | "mentor">;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type CurrentUserResponse = {
  user: User;
};

export type OpportunityListResponse = {
  opportunities: Opportunity[];
  total: number;
  page: number;
  limit: number;
};

export type ApplyResponse = {
  application: Application;
};

export type ApplicationListResponse = {
  applications: Application[];
};

export type WithdrawApplicationResponse = {
  application: Application;
};

export type CreateOpportunityPayload = {
  title: string;
  description: string;
  type: OpportunityType;
  capacity: number;
  deadline: string;
  startDate?: string;
  imageUrl?: string;
  attachmentUrl?: string;
};

export type OpportunityResponse = {
  opportunity: Opportunity;
};

export type MyOpportunitiesResponse = {
  opportunities: Opportunity[];
};
