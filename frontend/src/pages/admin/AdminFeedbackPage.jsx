import { useEffect, useState } from 'react';

import {
  MessageSquareText,
  Bug,
  Lightbulb,
  CheckCircle,
  Clock,
  RefreshCw,
  Star,
  Send,
} from 'lucide-react';

import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import toast from 'react-hot-toast';

import { adminFeedbackService } from '@/services/adminFeedbackService';

const statusOptions = [
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
];

const typeLabels = {
  suggestion: 'Suggestion',
  bug: 'Bug Report',
  feature: 'Feature Request',
};

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState([]);
  const [stats, setStats] = useState(null);

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const [responseDrafts, setResponseDrafts] = useState({});
  const [respondingId, setRespondingId] = useState(null);

  const [filters, setFilters] = useState({
    type: '',
    status: '',
    search: '',
  });

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Load feedback and statistics
  async function loadData() {
    setLoading(true);

    try {
      const [feedbackResult, statsResult] = await Promise.all([
        adminFeedbackService.list({
          ...filters,
          page,
          limit: 10,
        }),
        adminFeedbackService.getStats(),
      ]);

      setFeedback(feedbackResult.feedback || []);
      setPagination(feedbackResult.pagination || null);
      setStats(statsResult);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        'Unable to load feedback management data.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [filters.type, filters.status, filters.search, page]);

  // Update feedback status
  async function handleStatusChange(id, status) {
    setUpdatingId(id);

    try {
      await adminFeedbackService.updateStatus(id, status);

      toast.success('Feedback status updated successfully.');

      await loadData();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        'Unable to update feedback status.'
      );
    } finally {
      setUpdatingId(null);
    }
  }

  // Update filters
  function updateFilter(key, value) {
    setPage(1);

    setFilters((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  // Submit admin response
  async function handleResponseSubmit(id) {
    const response = responseDrafts[id]?.trim();

    if (!response || response.length < 5) {
      toast.error('Response must contain at least 5 characters.');
      return;
    }

    if (response.length > 2000) {
      toast.error('Response cannot exceed 2000 characters.');
      return;
    }

    setRespondingId(id);

    try {
      await adminFeedbackService.respond(id, response);

      toast.success('Response sent successfully!');

      setResponseDrafts((previous) => ({
        ...previous,
        [id]: '',
      }));

      await loadData();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        'Unable to send response.'
      );
    } finally {
      setRespondingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">

        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-400">
            Administration
          </p>

          <h1 className="mt-2 font-display text-3xl font-bold">
            Feedback Management
          </h1>

          <p className="mt-2 text-content-muted">
            Manage and respond to user feedback.
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={loadData}
          disabled={loading}
        >
          <RefreshCw
            size={16}
            className={`mr-2 ${loading ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>

      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-content-muted">
                Total Feedback
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                {stats?.total ?? 0}
              </h2>
            </div>

            <MessageSquareText
              className="text-brand-400"
              size={28}
            />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-content-muted">
                New
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                {stats?.new ?? 0}
              </h2>
            </div>

            <Clock className="text-blue-400" size={28} />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-content-muted">
                In Progress
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                {stats?.inProgress ?? 0}
              </h2>
            </div>

            <Bug className="text-warning" size={28} />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-content-muted">
                Resolved
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                {stats?.resolved ?? 0}
              </h2>
            </div>

            <CheckCircle className="text-success" size={28} />
          </div>
        </Card>

      </div>

      {/* Feedback Type Statistics */}
      <div className="grid gap-4 sm:grid-cols-3">

        {[
          {
            key: 'suggestion',
            label: 'Suggestions',
            icon: Lightbulb,
          },
          {
            key: 'bug',
            label: 'Bug Reports',
            icon: Bug,
          },
          {
            key: 'feature',
            label: 'Feature Requests',
            icon: MessageSquareText,
          },
        ].map((item) => {
          const Icon = item.icon;

          const count =
            stats?.byType?.find(
              (entry) => entry._id === item.key
            )?.count || 0;

          return (
            <Card key={item.key}>
              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-content-muted">
                    {item.label}
                  </p>

                  <h3 className="mt-2 text-2xl font-bold">
                    {count}
                  </h3>
                </div>

                <Icon
                  size={25}
                  className="text-brand-400"
                />

              </div>
            </Card>
          );
        })}

      </div>

      {/* Filters */}
      <Card>
        <div className="grid gap-4 md:grid-cols-3">

          <div>
            <label className="mb-2 block text-sm font-medium">
              Search Subject
            </label>

            <input
              type="search"
              value={filters.search}
              onChange={(event) =>
                updateFilter('search', event.target.value)
              }
              placeholder="Search feedback..."
              className="w-full rounded-control border border-line bg-surface px-4 py-3 text-sm outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Feedback Type
            </label>

            <select
              value={filters.type}
              onChange={(event) =>
                updateFilter('type', event.target.value)
              }
              className="w-full rounded-control border border-line bg-surface px-4 py-3 text-sm outline-none focus:border-brand-500"
            >
              <option value="">All Types</option>
              <option value="suggestion">Suggestion</option>
              <option value="bug">Bug Report</option>
              <option value="feature">Feature Request</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Status
            </label>

            <select
              value={filters.status}
              onChange={(event) =>
                updateFilter('status', event.target.value)
              }
              className="w-full rounded-control border border-line bg-surface px-4 py-3 text-sm outline-none focus:border-brand-500"
            >
              <option value="">All Statuses</option>

              {statusOptions.map((status) => (
                <option
                  key={status.value}
                  value={status.value}
                >
                  {status.label}
                </option>
              ))}

            </select>
          </div>

        </div>
      </Card>

      {/* All Feedback */}
      <div>

        <h2 className="mb-4 text-xl font-bold">
          All User Feedback
        </h2>

        {loading ? (
          <Card>
            <p className="py-8 text-center text-sm text-content-muted">
              Loading feedback...
            </p>
          </Card>
        ) : feedback.length === 0 ? (
          <Card>
            <div className="py-10 text-center">

              <MessageSquareText
                size={32}
                className="mx-auto text-content-subtle"
              />

              <h3 className="mt-4 font-semibold">
                No feedback found
              </h3>

              <p className="mt-2 text-sm text-content-muted">
                Try changing your search or filters.
              </p>

            </div>
          </Card>
        ) : (
          <div className="space-y-4">

            {feedback.map((item) => (
              <Card key={item._id}>

                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                  {/* Feedback Details */}
                  <div className="min-w-0 flex-1">

                    <div className="flex flex-wrap items-center gap-2">

                      <h3 className="font-semibold">
                        {item.subject}
                      </h3>

                      <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-400">
                        {typeLabels[item.type] || item.type}
                      </span>

                    </div>

                    <p className="mt-3 break-words text-sm text-content-muted">
                      {item.description}
                    </p>

                    {/* User Details */}
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-content-muted">

                      <span>
                        User: {item.user?.name || 'Unknown'}
                      </span>

                      <span>
                        {item.user?.email || 'No email'}
                      </span>

                      <span>
                        {new Date(item.createdAt).toLocaleDateString('en-IN')}
                      </span>

                    </div>

                    {/* Rating */}
                    <div className="mt-3 flex items-center gap-1">

                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={15}
                          className={
                            star <= item.rating
                              ? 'fill-warning text-warning'
                              : 'text-content-subtle'
                          }
                        />
                      ))}

                    </div>

                  </div>

                  {/* Status Update */}
                  <div className="w-full lg:w-48">

                    <label className="mb-2 block text-xs font-medium text-content-muted">
                      Update Status
                    </label>

                    <select
                      value={item.status}
                      disabled={updatingId === item._id}
                      onChange={(event) =>
                        handleStatusChange(item._id, event.target.value)
                      }
                      className="w-full rounded-control border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-brand-500 disabled:opacity-50"
                    >
                      {statusOptions.map((status) => (
                        <option
                          key={status.value}
                          value={status.value}
                        >
                          {status.label}
                        </option>
                      ))}
                    </select>

                    {updatingId === item._id && (
                      <p className="mt-2 text-xs text-content-muted">
                        Updating...
                      </p>
                    )}

                  </div>

                </div>

                {/* Admin Response */}
                <div className="mt-5 border-t border-line pt-5">

                  <label className="mb-2 block text-sm font-semibold">
                    Admin Response
                  </label>

                  {item.response && (
                    <div className="mb-3 rounded-xl border border-success/20 bg-success/5 p-3">

                      <p className="break-words text-sm text-content-primary">
                        {item.response}
                      </p>

                      {item.respondedAt && (
                        <p className="mt-2 text-xs text-content-muted">
                          Responded on:{' '}
                          {new Date(item.respondedAt).toLocaleString('en-IN')}
                        </p>
                      )}

                    </div>
                  )}

                  <textarea
                    value={responseDrafts[item._id] ?? ''}
                    onChange={(event) =>
                      setResponseDrafts((previous) => ({
                        ...previous,
                        [item._id]: event.target.value,
                      }))
                    }
                    placeholder="Write your response to this user..."
                    rows={3}
                    maxLength={2000}
                    className="w-full rounded-control border border-line bg-surface px-4 py-3 text-sm outline-none focus:border-brand-500"
                  />

                  <div className="mt-3 flex justify-end">

                    <Button
                      disabled={respondingId === item._id}
                      onClick={() => handleResponseSubmit(item._id)}
                    >
                      <Send size={15} className="mr-2" />

                      {respondingId === item._id
                        ? 'Sending...'
                        : item.response
                          ? 'Update Response'
                          : 'Send Response'}

                    </Button>

                  </div>

                </div>

              </Card>
            ))}

          </div>
        )}

      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3">

          <p className="text-sm text-content-muted">
            Page {pagination.currentPage} of {pagination.totalPages}
            {' '}({pagination.totalFeedback} feedback records)
          </p>

          <div className="flex gap-2">

            <Button
              variant="secondary"
              disabled={page <= 1 || loading}
              onClick={() => setPage((previous) => previous - 1)}
            >
              Previous
            </Button>

            <Button
              variant="secondary"
              disabled={page >= pagination.totalPages || loading}
              onClick={() => setPage((previous) => previous + 1)}
            >
              Next
            </Button>

          </div>

        </div>
      )}

    </div>
  );
}