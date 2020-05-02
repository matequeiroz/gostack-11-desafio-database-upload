/* eslint-disable array-callback-return */
/* eslint-disable consistent-return */
import csvParse from 'csv-parse';
import path from 'path';
import fs from 'fs';
import { getCustomRepository, getRepository, In } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionRepository from '../repositories/TransactionsRepository';

interface RequestDTO {
  filename: string;
}

interface ObjectTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}
class ImportTransactionsService {
  async run({ filename }: RequestDTO): Promise<Transaction[]> {
    const csvFilePath = path.resolve(__dirname, '..', '..', 'tmp', filename);
    const transactions = await this.loadCSV(csvFilePath);

    return transactions;
  }

  async loadCSV(filePath: string): Promise<Transaction[]> {
    const transactions: ObjectTransaction[] = [];
    const categories: string[] = [];
    const categoryRepository = getRepository(Category);
    const transactionRepository = getCustomRepository(TransactionRepository);

    const readCSVStream = fs.createReadStream(filePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) => {
        return cell.trim();
      });

      if (!title || !type || !value || !category) return;

      transactions.push({ title, type, value, category });
      categories.push(category);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const existsCategories = await categoryRepository.find({
      where: {
        title: In(categories),
      },
    });

    const existsCategoriesTitles = existsCategories.map(
      category => category.title,
    );

    const categoriesNotExistsInDatabase: string[] = categories
      .filter(category => !existsCategoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoryRepository.create(
      categoriesNotExistsInDatabase.map(title => ({
        title,
      })),
    );

    await categoryRepository.save(newCategories);

    const allCategoriesExists = [...newCategories, ...existsCategories];

    const createdTransactions = await transactionRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: allCategoriesExists.find(category => {
          if (category.title === transaction.category) {
            return category.id;
          }
        }),
      })),
    );

    await transactionRepository.save(createdTransactions);

    fs.promises.unlink(filePath);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
