import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { OpportunityStatus, OpportunityType } from "./enums.js";
import { Category } from "./Category.js";
import { User } from "./User.js";

@Entity("opportunities")
export class Opportunity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 160 })
  title!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "enum", enum: OpportunityType })
  type!: OpportunityType;

  @Column({ type: "int" })
  capacity!: number;

  @Column({ type: "timestamp" })
  deadline!: Date;

  @Column({ type: "timestamp", nullable: true })
  startDate!: Date | null;

  @Column({ type: "varchar", length: 500, nullable: true })
  imageUrl!: string | null;

  @Column({ type: "varchar", length: 500, nullable: true })
  attachmentUrl!: string | null;

  @Column({
    type: "enum",
    enum: OpportunityStatus,
    default: OpportunityStatus.Draft,
  })
  status!: OpportunityStatus;

  @ManyToOne(() => User, { nullable: false })
  owner!: User;

  @ManyToOne(() => Category, { nullable: true, eager: true })
  category!: Category | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}