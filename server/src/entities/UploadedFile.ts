import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { Application } from "./Application.js";
import { Opportunity } from "./Opportunity.js";

@Entity("uploaded_files")
export class UploadedFile {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  originalName!: string;

  @Column({ type: "varchar", length: 255 })
  storedName!: string;

  @Column({ type: "varchar", length: 120 })
  mimeType!: string;

  @Column({ type: "int" })
  size!: number;

  @Column({ type: "varchar", length: 500 })
  url!: string;

  @ManyToOne(() => Application, { nullable: true })
  application!: Application | null;

  @ManyToOne(() => Opportunity, { nullable: true })
  opportunity!: Opportunity | null;

  @CreateDateColumn()
  createdAt!: Date;
}