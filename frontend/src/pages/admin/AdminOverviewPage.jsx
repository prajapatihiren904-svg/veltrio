import { useEffect, useState } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  Wallet,
  RefreshCw,
} from 'lucide-react';

import Card from '@/components/common/Card';
import PageHeader from '@/components/common/PageHeader';
import Button from '@/components/common/Button';
import { adminService } from '@/services/adminService';

const formatNumber = (value) =>
  new Intl.NumberFormat('en-IN').format(Number(value || 0));

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return '—';

  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

function StatCard({ title, value, icon: Icon, description }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-content-muted">{title}</p>
          <h3 className="mt-2 text-2xl font-bold text-content">
            {value}
          </h3>
          <p className="mt-1 text-xs text-content-muted">
            {description}
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400">
          <Icon size={23} />
        </div>
      </div>
    </Card>
  );
}

export default function AdminOverviewPage() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOverview = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await adminService.getOverview();
      setOverview(result);
    } catch (err) {
      setError(err.message || 'Unable to load admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <RefreshCw className="animate-spin text-brand-400" size={28} />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <p className="text-red-400">{error}</p>
        <Button className="mt-4" onClick={loadOverview}>
          Try again
        </Button>
      </Card>
    );
  }

  const users = overview?.users || {};
  const transactions = overview?.transactions || {};

  return (
    <div className="mx-auto max-w-7xl space-y-6">

      <PageHeader
        title="Admin Overview"
        description="Monitor VELTRIO users, transactions and platform activity."
        action={
          <Button onClick={loadOverview}>
            <RefreshCw size={15} className="mr-2" />
            Refresh
          </Button>
        }
      />

      {/* User Statistics */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">User Statistics</h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            title="Total Users"
            value={formatNumber(users.total)}
            icon={Users}
            description="All registered accounts"
          />

          <StatCard
            title="Active Users"
            value={formatNumber(users.active)}
            icon={UserCheck}
            description="Currently active accounts"
          />

          <StatCard
            title="Suspended Users"
            value={formatNumber(users.suspended)}
            icon={UserX}
            description="Suspended accounts"
          />
        </div>
      </section>

      {/* Transaction Statistics */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">
          Financial Overview
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            title="Total Transactions"
            value={formatNumber(transactions.total)}
            icon={ArrowLeftRight}
            description="All platform transactions"
          />

          <StatCard
            title="Total Income"
            value={formatCurrency(transactions.totalIncome)}
            icon={TrendingUp}
            description={`${formatNumber(transactions.incomeCount)} income records`}
          />

          <StatCard
            title="Total Expenses"
            value={formatCurrency(transactions.totalExpenses)}
            icon={TrendingDown}
            description={`${formatNumber(transactions.expenseCount)} expense records`}
          />

          <StatCard
            title="Net Amount"
            value={formatCurrency(transactions.netAmount)}
            icon={Wallet}
            description="Income minus expenses"
          />
        </div>
      </section>

      {/* Recent Users */}
      <section>
        <Card>
          <div className="mb-5">
            <h2 className="text-lg font-semibold">Recent Registrations</h2>
            <p className="mt-1 text-sm text-content-muted">
              Latest five registered users.
            </p>
          </div>

          {overview?.recentUsers?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-content-muted">
                    <th className="px-3 py-3">Name</th>
                    <th className="px-3 py-3">Email</th>
                    <th className="px-3 py-3">Role</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Joined</th>
                  </tr>
                </thead>

                <tbody>
                  {overview.recentUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="border-b border-line last:border-0"
                    >
                      <td className="px-3 py-4 font-medium">
                        {user.name}
                      </td>

                      <td className="px-3 py-4 text-content-muted">
                        {user.email}
                      </td>

                      <td className="px-3 py-4 capitalize">
                        {user.role}
                      </td>

                      <td className="px-3 py-4">
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            user.status === 'active'
                              ? 'bg-brand-500/10 text-brand-400'
                              : 'bg-red-500/10 text-red-400'
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>

                      <td className="px-3 py-4 text-content-muted">
                        {formatDate(user.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-content-muted">
              No registered users found.
            </p>
          )}
        </Card>
      </section>
    </div>
  );
}