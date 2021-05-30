import {Entity,PrimaryGeneratedColumn,Column,Unique,CreateDateColumn,UpdateDateColumn,OneToMany} from "typeorm";
import { Length, IsNotEmpty } from "class-validator";
import * as bcrypt from "bcryptjs";
import { Post } from "./Post";
import { Review } from "./Review";

@Entity()
export class User {
  update(id: any, arg1: { passwordHash: void; }): User | PromiseLike<User> {
    throw new Error("Method not implemented.");
  }
  // ID Primary key
  @PrimaryGeneratedColumn()
  id: any;

  // E-mail
  @Column('varchar', { unique: true })
  email: string;

  @Column()
  @Length(4, 100)
  password: string;

  @Column()
  @Length(1, 100)
  firstName: string;

  @Column()
  @Length(1, 100)
  lastName: string;

  @Column({
    default: ""
  })
  description: string;

  //Role - default is 'user' - can be admin
  @Column({
    default: "user"
  })
  role: string;

  //check if user email is verified, default is false
  @Column({
    default: false
  })
  isActive: boolean;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  
  //hashing password
  hashPassword() {
    this.password = bcrypt.hashSync(this.password, 8);
  }
  // comparing passwords
  checkIfUnencryptedPasswordIsValid(unencryptedPassword: string) {
    return bcrypt.compareSync(unencryptedPassword, this.password);
  }

  @OneToMany(() => Post, (post: Post) => post.user, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  posts: Array<Post>

  @OneToMany(() => Review, (review: Review) => review.user, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  reviews: Array<Review>

}