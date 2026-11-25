import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import Category from './src/models/Category.js';
import Transaction from './src/models/Transaction.js';

dotenv.config();

const USER_ID = '6af3f313c5ea528152b87b58';

async function exportExpenses() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('MongoDB Connected Successfully');

    const expenses = await Transaction.find({
      user: new mongoose.Types.ObjectId(USER_ID),
      type: 'expense',
    })
      .populate('category', 'name')
      .sort({ date: 1, createdAt: 1 })
      .lean();

    const records = expenses.map((item) => ({
      date: item.date.toISOString().slice(0, 10),
      description: item.description,
      amount: item.amount,
      category: item.category?.name || 'Uncategorised',
      paymentMethod: item.paymentMethod,
      currency: item.currency,
    }));

    const total = records.reduce(
      (sum, item) => sum + Number(item.amount),
      0
    );

    const output = {
      totalRecords: records.length,
      totalExpenses: Math.round(total * 100) / 100,
      records,
    };

    fs.writeFileSync(
      'mongodb-expenses.json',
      JSON.stringify(output, null, 2),
      'utf8'
    );

    console.log('-----------------------------');
    console.log('Export Successful!');
    console.log('Total Records:', records.length);
    console.log('Total Expenses: ₹', output.totalExpenses);
    console.log('File: mongodb-expenses.json');
    console.log('-----------------------------');
  } catch (error) {
    console.error('Export Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

exportExpenses();