import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";

import { ApplicationStatus } from "./enums.js";
import { Opportunity } from "./Opportunity.js";
import { User } from "./User.js";

@Entity("applications")
@Unique(["student", "opportunity"])
export class Application {
  // Identity fields
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // Status fields
  @Column({
    type: "enum",
    enum: ApplicationStatus,
    default: ApplicationStatus.Pending,
  })
  status!: ApplicationStatus;

  // Note fields
  @Column({ type: "text", nullable: true })
  coverNote!: string | null;

  @Column({ type: "text", nullable: true })
  mentorNote!: string | null;

  // Relationship fields
  @ManyToOne(() => User, { nullable: false })
  student!: User;

  @ManyToOne(() => Opportunity, { nullable: false })
  opportunity!: Opportunity;

  // Timestamp fields
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
