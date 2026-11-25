import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Transaction from './src/models/Transaction.js';

dotenv.config();

const USER_ID = '6af3f313c5ea528152b87b58';

const EXTRA_RECORD_IDS = [
    '6af490c3d6e2f9cb0c3708f3',
    '6af490c3d6e2f9cb0c3708f2'
];

async function deleteExtraExpenses() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log('MongoDB Connected Successfully');

        const result = await Transaction.deleteMany({
            _id: {
                $in: EXTRA_RECORD_IDS.map(
                    id => new mongoose.Types.ObjectId(id)
                )
            },
            user: new mongoose.Types.ObjectId(USER_ID),
            type: 'expense',
            description: 'Imported transaction',
            amount: { $in: [10, 20] }
        });

        console.log('\n========== DELETION RESULT ==========');
        console.log('Records deleted:', result.deletedCount);

        if (result.deletedCount === 2) {
            console.log('Success! Both extra records deleted.');
        } else {
            console.log('Warning: Expected 2 records, but deleted:', result.deletedCount);
        }

    } catch (error) {
        console.error('Deletion Error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

deleteExtraExpenses();