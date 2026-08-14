import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { User } from "./User.js";

@Entity("audit_logs")
export class AuditLog {
  // Identity fields
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // Audit event fields
  @Column({ type: "varchar", length: 120 })
  action!: string;

  @Column({ type: "varchar", length: 120 })
  entityType!: string;

  @Column({ type: "varchar", length: 120 })
  entityId!: string;

  @Column({ type: "jsonb", nullable: true })
  metadata!: Record<string, unknown> | null;

  // Relationship fields
  @ManyToOne(() => User, { nullable: true })
  actor!: User | null;

  // Timestamp fields
  @CreateDateColumn()
  createdAt!: Date;
}
