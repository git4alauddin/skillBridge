import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { UserRole, UserStatus } from "./enums.js";

@Entity("users")
export class User {
  // Identity fields
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 120 })
  fullName!: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email!: string;

  // Credential fields
  @Column({ type: "varchar", length: 255 })
  passwordHash!: string;

  // Access fields
  @Column({ type: "enum", enum: UserRole, default: UserRole.Student })
  role!: UserRole;

  @Column({ type: "enum", enum: UserStatus, default: UserStatus.Active })
  status!: UserStatus;

  // Timestamp fields
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
