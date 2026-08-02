export enum UserRole {
  Admin = "admin",
  Mentor = "mentor",
  Student = "student",
}

export enum UserStatus {
  Active = "active",
  Suspended = "suspended",
}

export enum OpportunityType {
  Project = "project",
  Internship = "internship",
  Research = "research",
  Hackathon = "hackathon",
  Collaboration = "collaboration",
}

export enum OpportunityStatus {
  Draft = "draft",
  Pending = "pending_approval",
  Published = "published",
  Closed = "closed",
  Rejected = "rejected",
}

export enum ApplicationStatus {
  Pending = "pending",
  Shortlisted = "shortlisted",
  Selected = "selected",
  Rejected = "rejected",
  Waitlisted = "waitlisted",
  Withdrawn = "withdrawn",
  Completed = "completed",
}