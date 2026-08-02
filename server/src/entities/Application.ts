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
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    type: "enum",
    enum: ApplicationStatus,
    default: ApplicationStatus.Pending,
  })
  status!: ApplicationStatus;

  @Column({ type: "text", nullable: true })
  coverNote!: string | null;

  @Column({ type: "text", nullable: true })
  mentorNote!: string | null;

  @ManyToOne(() => User, { nullable: false })
  student!: User;

  @ManyToOne(() => Opportunity, { nullable: false })
  opportunity!: Opportunity;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}