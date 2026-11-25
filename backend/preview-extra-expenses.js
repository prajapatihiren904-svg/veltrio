import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Transaction from './src/models/Transaction.js';

dotenv.config();

const USER_ID = '6af3f313c5ea528152b87b58';

async function previewExtraExpenses() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log('MongoDB Connected Successfully');

        const extraRecords = await Transaction.find({
            user: new mongoose.Types.ObjectId(USER_ID),
            type: 'expense',
            description: 'Imported transaction',
            amount: { $in: [20, 10] },
            date: {
                $gte: new Date('2026-10-14T00:00:00.000Z'),
                $lt: new Date('2026-10-16T00:00:00.000Z')
            }
        }).lean();

        console.log('\n========== EXTRA RECORDS PREVIEW ==========\n');

        extraRecords.forEach((record, index) => {
            console.log(`Record ${index + 1}`);
            console.log('MongoDB ID:', record._id);
            console.log('Date:', record.date);
            console.log('Description:', record.description);
            console.log('Amount: ₹', record.amount);
            console.log('--------------------------------');
        });

        console.log('Total records found:', extraRecords.length);

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

previewExtraExpenses();