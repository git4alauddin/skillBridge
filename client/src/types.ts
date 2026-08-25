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