import {MigrationInterface, QueryRunner} from "typeorm";

export class EditedUserDescriptionToBeEmptyDefaul1621440145912 implements MigrationInterface {
    name = 'EditedUserDescriptionToBeEmptyDefaul1621440145912'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` CHANGE `description` `description` varchar(255) NOT NULL DEFAULT ''");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` CHANGE `description` `description` varchar(255) NULL DEFAULT ''");
    }

}
