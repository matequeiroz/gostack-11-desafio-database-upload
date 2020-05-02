import { getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';
import Transaction from '../repositories/TransactionsRepository';

interface RequestDTO {
  id: string;
}

class DeleteTransactionService {
  public async run({ id }: RequestDTO): Promise<void> {
    if (!id) throw new AppError('id of transaction not provider');

    const transactionRepository = getCustomRepository(Transaction);
    // verifica se a transação existe
    const transaction = await transactionRepository.findOne(id);

    if (!transaction) throw new AppError('transaction not found');

    await transactionRepository.delete(id);
  }
}

export default DeleteTransactionService;
