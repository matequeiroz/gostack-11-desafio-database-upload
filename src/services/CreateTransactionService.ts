import { getRepository, getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionRepository from '../repositories/TransactionsRepository';

interface RequestDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

export default class CreateTransactionService {
  public async run({
    title,
    value,
    type,
    category,
  }: RequestDTO): Promise<Transaction> {
    // title não pode ser null
    if (!title) throw new AppError("field 'title' cannot be empty");

    // nemo valor pode ser nulo
    if (!value) throw new AppError("field 'value' cannot be empty");

    // verificar o type

    if (type !== 'income' && type !== 'outcome')
      throw new AppError("field 'type' wrong value");

    const categoryRepository = getRepository(Category);
    const transactionRepository = getCustomRepository(TransactionRepository);

    if (type === 'outcome') {
      const incomeBalance = await transactionRepository.getIncomeBalance();

      if (value > incomeBalance.income)
        throw new AppError(
          'transaction not approved, values above what is available.',
        );
    }

    const categoryExists = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });

    if (!categoryExists) {
      const newCategory = await categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(newCategory);

      const transaction = await transactionRepository.create({
        title,
        value,
        type,
        category_id: newCategory.id,
      });

      await transactionRepository.save(transaction);

      return transaction;
    }

    const transaction = await transactionRepository.create({
      title,
      value,
      type,
      category_id: categoryExists.id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}
