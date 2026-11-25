import { sendSuccess } from '../utils/apiResponse.js';
import * as transactionService from '../services/transactionService.js';

export async function listTransactions(req, res) {
  const data = await transactionService.listTransactions(req.user.id, req.query);
  return sendSuccess(res, { data });
}

export async function getTransaction(req, res) {
  const transaction = await transactionService.getTransaction(req.user.id, req.params.id);
  return sendSuccess(res, { data: { transaction } });
}

export async function createTransaction(req, res) {
  const transaction = await transactionService.createTransaction(req.user, req.body);
  return sendSuccess(res, { statusCode: 201, message: 'Transaction created successfully', data: { transaction } });
}

export async function updateTransaction(req, res) {
  const transaction = await transactionService.updateTransaction(req.user.id, req.params.id, req.body);
  return sendSuccess(res, { message: 'Transaction updated successfully', data: { transaction } });
}

export async function deleteTransaction(req, res) {
  const data = await transactionService.deleteTransaction(req.user.id, req.params.id);
  return sendSuccess(res, { message: 'Transaction deleted successfully', data });
}

export async function listCategories(req, res) {
  const categories = await transactionService.listCategories(req.user.id, req.query.type);
  return sendSuccess(res, { data: { categories } });
}

export async function createCategory(req, res) {
  const category = await transactionService.createCategory(req.user.id, req.body);
  return sendSuccess(res, { statusCode: 201, message: 'Category created successfully', data: { category } });
}

export async function importTransactions(req, res) {
  const result = await transactionService.importTransactions(
    req.user,
    req.body.transactions
  );

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Transactions imported successfully',
    data: result,
  });
}