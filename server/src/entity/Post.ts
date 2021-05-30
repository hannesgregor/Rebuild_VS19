import {Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn, OneToMany, JoinColumn, ManyToOne} from "typeorm";
import {Category} from "./Category";
import { User } from "./User";
import { Review } from "./Review";

@Entity({ name: 'posts' })
export class Post {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({
        type: "text",
      })
    content!: string;

    @ManyToOne('User', (user: User) => user.posts, { nullable: false })
    @JoinColumn({ name: 'user_id'})
    user!: User

    @ManyToMany(() => Category, category => category.posts)
    @JoinTable()
    categories: Category[];

    @ManyToMany(() => Review, review => review.post)
    @JoinTable()
    reviews: Review[];

    @CreateDateColumn()
    createdAt!: Date;
  
    @UpdateDateColumn()
    updatedAt!: Date;

}