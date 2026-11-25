import { useEffect, useState } from 'react';
import {
  MessageSquareText,
  Bug,
  Lightbulb,
  Star,
  Send,
  Clock,
  RefreshCw,
} from 'lucide-react';

import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/forms/Input';

import toast from 'react-hot-toast';
import { feedbackService } from '@/services/feedbackService';

const feedbackTypes = [
  { value: 'suggestion', label: 'Suggestion', icon: Lightbulb },
  { value: 'bug', label: 'Bug Report', icon: Bug },
  { value: 'feature', label: 'Feature Request', icon: MessageSquareText },
];

const statusStyles = {
  new: 'bg-blue-500/10 text-blue-400',
  in_progress: 'bg-warning/10 text-warning',
  resolved: 'bg-success/10 text-success',
};

const statusLabels = {
  new: 'New',
  in_progress: 'In Progress',
  resolved: 'Resolved',
};

export default function FeedbackPage() {
  const [form, setForm] = useState({
    type: 'suggestion',
    subject: '',
    description: '',
    rating: 5,
  });

  const [submitted, setSubmitted] = useState(false);

  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyError, setHistoryError] = useState(false);

  // Load user's feedback history
  async function loadFeedback() {
    setLoading(true);
    setHistoryError(false);

    try {
      const feedback = await feedbackService.listMine();
      setFeedbackList(feedback || []);
    } catch (error) {
      setHistoryError(true);
      toast.error('Unable to load feedback history.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFeedback();
  }, []);

  // Submit feedback
  async function handleSubmit(event) {
    event.preventDefault();

    try {
      await feedbackService.create(form);

      setSubmitted(true);

      toast.success('Feedback submitted successfully!');

      await loadFeedback();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        'Unable to submit feedback. Please try again.'
      );
    }
  }

  // Reset feedback form
  function resetForm() {
    setForm({
      type: 'suggestion',
      subject: '',
      description: '',
      rating: 5,
    });

    setSubmitted(false);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">

      {/* Page Header */}
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-400">
          Help us improve
        </p>

        <h1 className="mt-2 font-display text-3xl font-bold">
          Feedback & Support
        </h1>

        <p className="mt-2 text-content-muted">
          Your feedback helps us make VELTRIO better.
        </p>
      </div>

      {/* Feedback Form */}
      <Card>
        {submitted ? (
          <div className="py-10 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
              <MessageSquareText size={26} />
            </div>

            <h2 className="mt-4 text-xl font-semibold">
              Thank you for your feedback!
            </h2>

            <p className="mt-2 text-sm text-content-muted">
              Your feedback has been submitted successfully.
            </p>

            <Button
              className="mt-6"
              onClick={resetForm}
            >
              Submit another feedback
            </Button>

          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Feedback Type */}
            <div>
              <label className="mb-3 block text-sm font-medium">
                What would you like to share?
              </label>

              <div className="grid gap-3 sm:grid-cols-3">
                {feedbackTypes.map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() =>
                        setForm({ ...form, type: item.value })
                      }
                      className={`flex items-center gap-3 rounded-xl border p-4 text-sm transition ${
                        form.type === item.value
                          ? 'border-brand-500 bg-brand-500/10 text-brand-400'
                          : 'border-line bg-surface hover:border-brand-400'
                      }`}
                    >
                      <Icon size={20} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subject */}
            <Input
              label="Subject"
              value={form.subject}
              onChange={(event) =>
                setForm({ ...form, subject: event.target.value })
              }
              placeholder="Enter feedback subject"
              required
              minLength={3}
              maxLength={120}
            />

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Description
              </label>

              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
                placeholder="Tell us more about your experience..."
                rows={5}
                required
                minLength={10}
                maxLength={2000}
                className="w-full rounded-control border border-line bg-surface px-4 py-3 text-sm outline-none transition focus:border-brand-500"
              />

              <p className="mt-1 text-xs text-content-muted">
                Minimum 10 characters. Maximum 2000 characters.
              </p>
            </div>

            {/* Rating */}
            <div>
              <label className="mb-3 block text-sm font-medium">
                Rate your experience
              </label>

              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    aria-label={`Rate ${rating} out of 5`}
                    onClick={() =>
                      setForm({ ...form, rating })
                    }
                    className="transition hover:scale-110"
                  >
                    <Star
                      size={27}
                      className={
                        rating <= form.rating
                          ? 'fill-warning text-warning'
                          : 'text-content-subtle'
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full sm:w-auto">
              <Send size={16} className="mr-2" />
              Submit Feedback
            </Button>

          </form>
        )}
      </Card>

      {/* Feedback History */}
      <section className="space-y-5">

        <div className="flex flex-wrap items-center justify-between gap-3">

          <div>
            <h2 className="text-xl font-bold">
              My Feedback History
            </h2>

            <p className="mt-1 text-sm text-content-muted">
              Track your previously submitted feedback.
            </p>
          </div>

          <Button
            variant="secondary"
            onClick={loadFeedback}
            disabled={loading}
          >
            <RefreshCw
              size={15}
              className={`mr-2 ${loading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>

        </div>

        {/* Loading */}
        {loading ? (
          <Card>
            <div className="py-8 text-center text-sm text-content-muted">
              Loading your feedback history...
            </div>
          </Card>
        ) : historyError ? (
          <Card>
            <div className="py-8 text-center">

              <p className="text-sm text-content-muted">
                Unable to load your feedback history.
              </p>

              <Button
                className="mt-4"
                onClick={loadFeedback}
              >
                Try Again
              </Button>

            </div>
          </Card>
        ) : feedbackList.length === 0 ? (
          <Card>
            <div className="py-10 text-center">

              <MessageSquareText
                size={32}
                className="mx-auto text-content-subtle"
              />

              <h3 className="mt-4 font-semibold">
                No feedback submitted yet
              </h3>

              <p className="mt-2 text-sm text-content-muted">
                Your submitted feedback will appear here.
              </p>

            </div>
          </Card>
        ) : (
          <div className="space-y-4">

            {feedbackList.map((feedback) => (
              <Card key={feedback._id}>

                {/* Feedback Details */}
                <div className="flex flex-wrap items-start justify-between gap-4">

                  <div className="min-w-0 flex-1">

                    <div className="flex flex-wrap items-center gap-2">

                      <h3 className="font-semibold">
                        {feedback.subject}
                      </h3>

                      <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-medium capitalize text-brand-400">
                        {feedback.type}
                      </span>

                    </div>

                    <p className="mt-3 break-words text-sm text-content-muted">
                      {feedback.description}
                    </p>

                    {/* Rating and Date */}
                    <div className="mt-4 flex flex-wrap items-center gap-4">

                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            className={
                              star <= feedback.rating
                                ? 'fill-warning text-warning'
                                : 'text-content-subtle'
                            }
                          />
                        ))}
                      </div>

                      <span className="flex items-center gap-1 text-xs text-content-muted">
                        <Clock size={13} />

                        {new Date(feedback.createdAt).toLocaleDateString(
                          'en-IN',
                          {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          }
                        )}
                      </span>

                    </div>

                  </div>

                  {/* Feedback Status */}
                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      statusStyles[feedback.status] ||
                      'bg-surface text-content-muted'
                    }`}
                  >
                    {statusLabels[feedback.status] || feedback.status}
                  </span>

                </div>

                {/* Admin Response */}
                {feedback.response && (
                  <div className="mt-5 border-t border-line pt-5">

                    <div className="rounded-xl border border-success/20 bg-success/5 p-4">

                      <div className="flex items-center gap-2">

                        <MessageSquareText
                          size={18}
                          className="text-success"
                        />

                        <h4 className="font-semibold text-success">
                          Response from VELTRIO Support
                        </h4>

                      </div>

                      <p className="mt-3 break-words text-sm text-content-primary">
                        {feedback.response}
                      </p>

                      {feedback.respondedAt && (
                        <p className="mt-3 text-xs text-content-muted">
                          Responded on:{' '}
                          {new Date(feedback.respondedAt).toLocaleString('en-IN')}
                        </p>
                      )}

                    </div>

                  </div>
                )}

              </Card>
            ))}

          </div>
        )}

      </section>

    </div>
  );
}