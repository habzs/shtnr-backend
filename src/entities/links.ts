import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class Link {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: "public" })
  user_id: string;

  @Column()
  url: string;

  @Column()
  shtnd_url: string;

  @Column({ default: 0 })
  times_visited: number;

  @CreateDateColumn({ type: "timestamptz" })
  public created_at: Date;

  @CreateDateColumn({ type: "timestamptz" })
  public updated_at: Date;
}
