import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export default class AddForeignKeyInTableTransaction1588295146009
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createForeignKey(
      'tb_transactions',
      new TableForeignKey({
        name: 'CategoryTransaction',
        columnNames: ['category_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tb_categories',
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('tb_transactions', 'CategoryTransaction');
  }
}
