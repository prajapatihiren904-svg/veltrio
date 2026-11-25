VELTRIO Excel Import Fix

This patch updates only two files:
1) frontend/src/pages/import/DataImportPage.jsx
   - Detects EXPENSE NAME as the Description column.
   - Detects PAYMENT TYPE.
   - Parses DD/MM/YYYY dates correctly.
   - Filters blank spreadsheet rows and the TOTAL summary row.

2) backend/src/services/transactionService.js
   - Repairs existing generic "Imported transaction" rows by restoring their descriptions and correcting their dates/payment method from the re-imported source rows.
   - Adds the two distinct same-date/same-category/same-amount expenses instead of collapsing them as duplicates.
   - Keeps exact duplicate detection for actual repeated transactions.

HOW TO APPLY:
1. Stop the VELTRIO dev server (Ctrl+C in the terminal).
2. Make a backup copy of these two original files.
3. Extract this ZIP directly into your VELTRIO project root folder (the folder that contains backend and frontend).
4. Allow Windows to replace the two files.
5. Start the project again with: npm run dev
6. Open Import Data and upload MY OWN EXPENSES.xlsx again.
7. Check that preview shows 105 valid rows and that Description shows names such as Teeth Checkup, Notebook (2), Poha, etc.
8. Import once. The backend will repair legacy generic imported descriptions and add any missing distinct rows.

Do not click Import more than once while the first request is processing. Verify the result and dashboard total afterwards.
