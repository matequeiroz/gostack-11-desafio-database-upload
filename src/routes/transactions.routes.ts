import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

import multerConfig from '../config/multer';

const transactionsRouter = Router();
const middlewareUpload = multer(multerConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionRepository.find({
    select: ['id', 'title', 'value', 'type', 'created_at', 'updated_at'],
    relations: ['category'],
  });
  const balance = await transactionRepository.getBalance();
  return response.status(200).json({
    transactions,
    balance,
  });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, category, type } = request.body;
  const createTransactionService = new CreateTransactionService();
  const transaction = await createTransactionService.run({
    title,
    value,
    category,
    type,
  });

  return response.status(201).json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const deleteTransactionService = new DeleteTransactionService();
  await deleteTransactionService.run({ id });

  return response.status(204).send();
});

transactionsRouter.post(
  '/import',
  middlewareUpload.single('file'),
  async (request, response) => {
    const importTransactionsService = new ImportTransactionsService();
    const transactionsImported = await importTransactionsService.run({
      filename: request.file.filename,
    });
    return response.status(200).json(transactionsImported);
  },
);

export default transactionsRouter;
