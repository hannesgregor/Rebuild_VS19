import {Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn, OneToMany, JoinColumn, ManyToOne} from "typeorm";
import { Category } from "./Category";
import { User } from "./User";
import { Post } from "./Post";

@Entity({ name: "reviews" })
export class Review {
    [x: string]: any;
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'integer' })
    rating: number;

    @Column({
        type: "text",
      })
    review_text!: string;

    @ManyToOne('User', (user: User) => user.reviews, { nullable: false })
    @JoinColumn({ name: 'user_id'})
    user!: User

    @ManyToOne('Post', (post: Post) => post.reviews, { nullable: false })
    @JoinColumn({ name: 'post_id'})
    post!: any;

    @CreateDateColumn()
    createdAt!: Date;
  
    @UpdateDateColumn()
    updatedAt!: Date;

}