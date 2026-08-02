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
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 120 })
  action!: string;

  @Column({ type: "varchar", length: 120 })
  entityType!: string;

  @Column({ type: "varchar", length: 120 })
  entityId!: string;

  @Column({ type: "jsonb", nullable: true })
  metadata!: Record<string, unknown> | null;

  @ManyToOne(() => User, { nullable: true })
  actor!: User | null;

  @CreateDateColumn()
  createdAt!: Date;
}