import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface IncomeBalance {
  income: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const income = await this.createQueryBuilder('tb_transactions')
      .select('SUM(tb_transactions.value)')
      .where("tb_transactions.type = 'income'")
      .getRawOne();

    const outcome = await this.createQueryBuilder('tb_transactions')
      .select('SUM(tb_transactions.value)')
      .where("tb_transactions.type = 'outcome'")
      .getRawOne();

    return {
      income: Number(income.sum),
      outcome: Number(outcome.sum),
      total: income.sum - outcome.sum,
    };
  }

  public async getIncomeBalance(): Promise<IncomeBalance> {
    const balance = await this.getBalance();

    return {
      income: balance.total,
    };
  }
}

export default TransactionsRepository;
