import { useCallback, useEffect, useState } from 'react';
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  X,
} from 'lucide-react';

import Card from '@/components/common/Card';
import PageHeader from '@/components/common/PageHeader';
import Button from '@/components/common/Button';
import { adminService } from '@/services/adminService';

const formatDate = (value) => {
  if (!value) return '—';

  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
  });

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState('');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const result = await adminService.getUsers({
        page,
        limit: 10,
        search,
        ...(status ? { status } : {}),
      });

      setUsers(result.users || []);
      setPagination(result.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalUsers: 0,
      });
    } catch (err) {
      setError(err.message || 'Unable to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    const timer = setTimeout(loadUsers, 350);
    return () => clearTimeout(timer);
  }, [loadUsers]);

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusFilter = (value) => {
    setStatus(value);
    setPage(1);
  };

  const handleUserStatus = async (user) => {
    const nextStatus =
      user.status === 'active' ? 'suspended' : 'active';

    const confirmed = window.confirm(
      `Are you sure you want to ${nextStatus} ${user.name}'s account?`
    );

    if (!confirmed) return;

    setUpdatingId(user._id || user.id);

    try {
      await adminService.updateUserStatus(
        user._id || user.id,
        nextStatus
      );

      await loadUsers();

      if (selectedUser) {
        const updated = await adminService.getUser(
          user._id || user.id
        );
        setSelectedUser(updated);
      }
    } catch (err) {
      setError(err.message || 'Could not update user status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleViewUser = async (id) => {
    try {
      const result = await adminService.getUser(id);
      setSelectedUser(result);
    } catch (err) {
      setError(err.message || 'Could not load user details');
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">

      <PageHeader
        title="User Management"
        description="View, search and manage VELTRIO accounts."
        action={
          <Button onClick={loadUsers}>
            <RefreshCw size={15} className="mr-2" />
            Refresh
          </Button>
        }
      />

      {/* Search and Filters */}
      <Card className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_200px]">

          <div className="relative">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted"
            />

            <input
              type="search"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full rounded-control border border-line bg-canvas py-3 pl-10 pr-4 text-sm text-content outline-none focus:border-brand-500"
            />
          </div>

          <select
            value={status}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="rounded-control border border-line bg-canvas px-3 py-3 text-sm text-content outline-none focus:border-brand-500"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>

        </div>

        <p className="text-sm text-content-muted">
          Total registered users: {pagination.totalUsers}
        </p>
      </Card>

      {/* Error */}
      {error && (
        <Card className="flex items-center justify-between gap-3 border-red-500/30">
          <p className="text-sm text-red-400">{error}</p>
          <button onClick={() => setError('')}>
            <X size={18} />
          </button>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <div className="mb-5">
          <h2 className="font-semibold">Registered Users</h2>
          <p className="mt-1 text-sm text-content-muted">
            Manage registered accounts and their status.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <RefreshCw
              size={25}
              className="animate-spin text-brand-400"
            />
          </div>
        ) : users.length === 0 ? (
          <p className="py-12 text-center text-sm text-content-muted">
            No users found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">

              <thead>
                <tr className="border-b border-line text-content-muted">
                  <th className="px-3 py-3">User</th>
                  <th className="px-3 py-3">Role</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Joined</th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr
                    key={user._id || user.id}
                    className="border-b border-line last:border-0"
                  >
                    <td className="px-3 py-4">
                      <p className="font-medium">{user.name}</p>
                      <p className="mt-1 text-xs text-content-muted">
                        {user.email}
                      </p>
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

                    <td className="px-3 py-4">
                      <div className="flex items-center gap-2">

                        <button
                          onClick={() =>
                            handleViewUser(user._id || user.id)
                          }
                          className="rounded-control border border-line px-3 py-2 text-xs hover:border-brand-500 hover:text-brand-400"
                        >
                          View
                        </button>

                        {user.role !== 'admin' && (
                          <button
                            disabled={
                              updatingId === (user._id || user.id)
                            }
                            onClick={() => handleUserStatus(user)}
                            className={`rounded-control border px-3 py-2 text-xs disabled:opacity-50 ${
                              user.status === 'active'
                                ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                                : 'border-brand-500/30 text-brand-400 hover:bg-brand-500/10'
                            }`}
                          >
                            {user.status === 'active' ? (
                              <>
                                <UserX size={13} className="mr-1 inline" />
                                Suspend
                              </>
                            ) : (
                              <>
                                <UserCheck size={13} className="mr-1 inline" />
                                Activate
                              </>
                            )}
                          </button>
                        )}

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="mt-5 flex items-center justify-between border-t border-line pt-4">

          <p className="text-xs text-content-muted">
            Page {pagination.currentPage || page} of {pagination.totalPages || 1}
          </p>

          <div className="flex gap-2">
            <button
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => current - 1)}
              className="rounded-control border border-line p-2 disabled:opacity-30"
            >
              <ChevronLeft size={17} />
            </button>

            <button
              disabled={
                page >= (pagination.totalPages || 1) || loading
              }
              onClick={() => setPage((current) => current + 1)}
              className="rounded-control border border-line p-2 disabled:opacity-30"
            >
              <ChevronRight size={17} />
            </button>
          </div>

        </div>
      </Card>

      {/* User Details */}
      {selectedUser && (
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">User Details</h2>

            <button onClick={() => setSelectedUser(null)}>
              <X size={19} className="text-content-muted" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-content-muted">Name</p>
              <p className="mt-1 text-sm">
                {selectedUser.user?.name}
              </p>
            </div>

            <div>
              <p className="text-xs text-content-muted">Email</p>
              <p className="mt-1 text-sm">
                {selectedUser.user?.email}
              </p>
            </div>

            <div>
              <p className="text-xs text-content-muted">Role</p>
              <p className="mt-1 text-sm capitalize">
                {selectedUser.user?.role}
              </p>
            </div>

            <div>
              <p className="text-xs text-content-muted">Status</p>
              <p className="mt-1 text-sm capitalize">
                {selectedUser.user?.status}
              </p>
            </div>

            <div>
              <p className="text-xs text-content-muted">
                Total Transactions
              </p>
              <p className="mt-1 text-sm">
                {selectedUser.transactions?.total ?? 0}
              </p>
            </div>

            <div>
              <p className="text-xs text-content-muted">Total Income</p>
              <p className="mt-1 text-sm">
                ₹{Number(selectedUser.transactions?.income || 0).toLocaleString('en-IN')}
              </p>
            </div>

            <div>
              <p className="text-xs text-content-muted">Total Expenses</p>
              <p className="mt-1 text-sm">
                ₹{Number(selectedUser.transactions?.expenses || 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </Card>
      )}

    </div>
  );
}