import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import Button from '@/components/common/Button';
import Input from '@/components/forms/Input';
import Select from '@/components/forms/Select';
import Modal from '@/components/common/Modal';
import { transactionService } from '@/services/transactionService';
import toast from 'react-hot-toast';

function todayLocal() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

const EMPTY = { type: 'expense', amount: '', category: '', description: '', date: todayLocal(), paymentMethod: 'upi', notes: '' };

export default function TransactionForm({ isOpen, onClose, onSaved, categories, initialValue = null, defaultType = 'expense' }) {
  const [form, setForm] = useState({ ...EMPTY, type: defaultType });
  const [saving, setSaving] = useState(false);
  const [categoryItems, setCategoryItems] = useState(categories);
  const [newCategory, setNewCategory] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [categoryBusy, setCategoryBusy] = useState(false);

  useEffect(() => {
    setCategoryItems(categories);
  }, [categories]);

  useEffect(() => {
    if (!isOpen) return;
    setForm(initialValue ? {
      type: initialValue.type,
      amount: String(initialValue.amount),
      category: initialValue.category?._id || initialValue.category || '',
      description: initialValue.description || '',
      date: initialValue.date ? new Date(initialValue.date).toISOString().slice(0, 10) : todayLocal(),
      paymentMethod: initialValue.paymentMethod || 'other',
      notes: initialValue.notes || '',
    } : { ...EMPTY, type: defaultType });
    setAddingCategory(false);
    setNewCategory('');
  }, [isOpen, initialValue, defaultType]);

  const availableCategories = useMemo(() => categoryItems.filter((item) => item.type === form.type), [categoryItems, form.type]);

  useEffect(() => {
    if (availableCategories.length && !availableCategories.some((item) => item._id === form.category)) {
      setForm((current) => ({ ...current, category: availableCategories[0]._id }));
    }
  }, [availableCategories, form.category]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleAddCategory() {
    if (newCategory.trim().length < 2) return toast.error('Category name must be at least 2 characters');
    setCategoryBusy(true);
    try {
      const category = await transactionService.createCategory({ name: newCategory.trim(), type: form.type });
      setCategoryItems((items) => [...items, category]);
      setForm((current) => ({ ...current, category: category._id }));
      setNewCategory('');
      setAddingCategory(false);
      toast.success('Category added');
    } catch (error) {
      toast.error(error.message || 'Could not add category');
    } finally {
      setCategoryBusy(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.category) return toast.error('Please choose a category');
    setSaving(true);
    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
        date: new Date(`${form.date}T12:00:00`).toISOString(),
        notes: form.notes.trim(),
      };
      if (initialValue?._id) await transactionService.update(initialValue._id, payload);
      else await transactionService.create(payload);
      toast.success(initialValue ? 'Transaction updated' : 'Transaction added');
      onSaved();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Could not save transaction');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialValue ? 'Edit transaction' : 'Add transaction'} description="Keep your money records accurate and up to date." size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2 rounded-control bg-surface p-1">
          {['income', 'expense'].map((type) => (
            <button key={type} type="button" onClick={() => update('type', type)} className={`h-10 rounded-control text-sm font-semibold capitalize transition ${form.type === type ? 'bg-brand-500 text-brand-ink' : 'text-content-muted hover:text-content'}`}>{type}</button>
          ))}
        </div>
        <Input label="Amount (₹)" type="number" min="0.01" max="1000000000000" step="0.01" required value={form.amount} onChange={(event) => update('amount', event.target.value)} placeholder="0.00" />
        <div className="flex items-end gap-2">
          <div className="min-w-0 flex-1">
            <Select label="Category" required value={form.category} onChange={(event) => update('category', event.target.value)}>
              <option value="">Choose category</option>
              {availableCategories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
            </Select>
          </div>
          <Button type="button" variant="secondary" size="icon" aria-label="Add category" onClick={() => setAddingCategory((value) => !value)}><Plus className="h-4 w-4" /></Button>
        </div>
        {addingCategory && <div className="flex items-end gap-2 rounded-control border border-line bg-surface p-3">
          <div className="min-w-0 flex-1"><Input label="New category" value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="e.g. Rent" /></div>
          <Button type="button" size="sm" loading={categoryBusy} onClick={handleAddCategory}>Add</Button>
        </div>}
        <Input label="Description" required minLength={2} maxLength={120} value={form.description} onChange={(event) => update('description', event.target.value)} placeholder="e.g. Monthly salary" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Date" type="date" required value={form.date} onChange={(event) => update('date', event.target.value)} />
          <Select label="Payment method" value={form.paymentMethod} onChange={(event) => update('paymentMethod', event.target.value)}>
            <option value="cash">Cash</option><option value="upi">UPI</option><option value="card">Card</option><option value="bank_transfer">Bank transfer</option><option value="other">Other</option>
          </Select>
        </div>
        <label className="block text-sm font-medium text-content-muted">Notes <span className="font-normal text-content-subtle">(optional)</span>
          <textarea value={form.notes} onChange={(event) => update('notes', event.target.value)} maxLength={500} rows={3} placeholder="Add any details..." className="mt-2 w-full rounded-control border border-line bg-surface px-3.5 py-3 text-sm text-content placeholder:text-content-subtle focus-visible:border-brand-500" />
        </label>
        <div className="flex justify-end gap-2 border-t border-line pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>{initialValue ? 'Save changes' : 'Add transaction'}</Button>
        </div>
      </form>
    </Modal>
  );
}
