import { IsEmailValid } from "./validators/IsEmailValid";
import {
  IsDefined,
  IsString,
  Length,
  Validate,
  validate,
} from "class-validator";
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";
import { errors } from "../errors/error_msgs";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @IsDefined()
  @IsString()
  @Length(3, 20, { message: errors.INVALID_USERNAME })
  @Column({ unique: true, nullable: false })
  username: string;

  @IsDefined()
  @IsString()
  @Validate(IsEmailValid, [errors.INVALID_EMAIL])
  @Column({ unique: true, nullable: false })
  email: string;

  @IsString()
  @Column({ nullable: false })
  @Length(8, 200, { message: errors.INVALID_PASSWORD })
  password: string;

  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;
}
