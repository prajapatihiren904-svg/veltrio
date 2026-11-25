import { useState } from 'react';
import toast from 'react-hot-toast';
import { Mail, Plus, Search, Trash2, TrendingUp } from 'lucide-react';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Card, { CardHeader } from '@/components/common/Card';
import Modal from '@/components/common/Modal';
import PageHeader from '@/components/common/PageHeader';
import ProgressBar from '@/components/common/ProgressBar';
import Spinner from '@/components/common/Spinner';
import EmptyState from '@/components/feedback/EmptyState';
import Skeleton from '@/components/feedback/Skeleton';
import Input from '@/components/forms/Input';
import Select from '@/components/forms/Select';
import { useDisclosure } from '@/hooks/useDisclosure';
import { formatCurrency, formatDate, formatPercent } from '@/utils/formatters';

const surfaceSwatches = [
  { name: 'canvas', className: 'bg-canvas' },
  { name: 'surface', className: 'bg-surface' },
  { name: 'surface-raised', className: 'bg-surface-raised' },
  { name: 'surface-overlay', className: 'bg-surface-overlay' },
  { name: 'line', className: 'bg-line' },
  { name: 'line-strong', className: 'bg-line-strong' },
];

const brandSwatches = [
  { name: 'brand-300', className: 'bg-brand-300' },
  { name: 'brand-400', className: 'bg-brand-400' },
  { name: 'brand-500', className: 'bg-brand-500' },
  { name: 'brand-600', className: 'bg-brand-600' },
  { name: 'success', className: 'bg-success' },
  { name: 'warning', className: 'bg-warning' },
  { name: 'danger', className: 'bg-danger' },
  { name: 'info', className: 'bg-info' },
];

function Section({ title, description, children }) {
  return (
    <Card>
      <CardHeader title={title} description={description} />
      {children}
    </Card>
  );
}

function Swatches({ items }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
      {items.map((item) => (
        <div key={item.name}>
          <div className={`h-14 rounded-control border border-line ${item.className}`} />
          <p className="mt-1.5 text-xs text-content-muted">{item.name}</p>
        </div>
      ))}
    </div>
  );
}

/** Developer-only gallery of every reusable component and token. Not included in production builds. */
export default function DesignSystemPage() {
  const modal = useDisclosure();
  const [loading, setLoading] = useState(false);

  const simulateLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="mx-auto w-full max-w-content space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Design system"
        description="Every token and reusable component in one place. Change colors in styles/tokens.css and watch this page update."
      />

      <Section title="Color tokens" description="Defined in src/styles/tokens.css and exposed as semantic Tailwind classes.">
        <div className="space-y-5">
          <Swatches items={surfaceSwatches} />
          <Swatches items={brandSwatches} />
        </div>
      </Section>

      <Section title="Typography" description="Sora for headings, Inter for interface text.">
        <div className="space-y-3">
          <p className="font-display text-4xl font-bold">Heading display 4xl</p>
          <p className="font-display text-2xl font-semibold">Heading 2xl semibold</p>
          <p className="text-base">Body text: manage your money with calm and clarity.</p>
          <p className="text-sm text-content-muted">Muted text for secondary information.</p>
          <p className="text-xs text-content-subtle">Subtle text for captions and hints.</p>
          <p className="text-gradient font-display text-2xl font-bold">Gradient accent text</p>
        </div>
      </Section>

      <Section title="Buttons" description="Interactive variants, sizes, icons, loading and disabled states.">
  <div className="space-y-4">

    {/* Button Variants */}
    <div className="flex flex-wrap items-center gap-3">
      <Button onClick={() => toast.success('Primary button clicked!')}>
        Primary
      </Button>

      <Button
        variant="secondary"
        onClick={() => toast.success('Secondary button clicked!')}
      >
        Secondary
      </Button>

      <Button
        variant="ghost"
        onClick={() => toast('Ghost button clicked!')}
      >
        Ghost
      </Button>

      <Button
        variant="danger"
        onClick={() => toast.error('Danger action triggered!')}
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        Danger
      </Button>
    </div>

    {/* Button Sizes */}
    <div className="flex flex-wrap items-center gap-3">
      <Button
        size="sm"
        onClick={() => toast.success('Small button clicked!')}
      >
        Small
      </Button>

      <Button
        size="md"
        onClick={() => toast.success('Medium button clicked!')}
      >
        Medium
      </Button>

      <Button
        size="lg"
        onClick={() => toast.success('Large button clicked!')}
      >
        Large
      </Button>

      <Button
        size="icon"
        variant="secondary"
        aria-label="Add"
        onClick={() => toast.success('Add button clicked!')}
      >
        <Plus className="h-5 w-5" aria-hidden="true" />
      </Button>
    </div>

    {/* Loading and Disabled */}
    <div className="flex flex-wrap items-center gap-3">
      <Button loading={loading} onClick={simulateLoading}>
        {loading ? 'Saving' : 'Click to load'}
      </Button>

      <Button disabled>
        Disabled
      </Button>
    </div>

  </div>
</Section>

      <Section title="Form controls" description="Labels, hints, errors, icons and native selects.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Email" type="email" placeholder="you@example.com" icon={Mail} hint="We never share your email." />
          <Input label="Search" placeholder="Search transactions" icon={Search} />
          <Input label="Amount" type="number" defaultValue="-5" error="Amount must be greater than zero" required />
          <Select label="Category" defaultValue="food" hint="Used for budgets and analytics">
            <option value="food">Food and dining</option>
            <option value="transport">Transport</option>
            <option value="rent">Rent</option>
          </Select>
          <Input label="Disabled field" defaultValue="Read only" disabled />
        </div>
      </Section>

      <Section title="Badges, progress and formatting">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Badge>Neutral</Badge>
            <Badge tone="brand" dot>
              Brand
            </Badge>
            <Badge tone="success">Success</Badge>
            <Badge tone="warning">Warning</Badge>
            <Badge tone="danger">Danger</Badge>
            <Badge tone="info">Info</Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="mb-2 text-sm text-content-muted">Goal (brand): 45%</p>
              <ProgressBar value={45} label="Goal progress" />
            </div>
            <div>
              <p className="mb-2 text-sm text-content-muted">Budget warning: 85%</p>
              <ProgressBar value={85} tone="auto" label="Budget used" />
            </div>
            <div>
              <p className="mb-2 text-sm text-content-muted">Budget exceeded: 112%</p>
              <ProgressBar value={112} tone="auto" label="Budget exceeded" />
            </div>
          </div>
          <dl className="grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-content-subtle">Currency</dt>
              <dd className="mt-1 font-display text-xl font-semibold">{formatCurrency(1234567.5, 'INR')}</dd>
            </div>
            <div>
              <dt className="text-content-subtle">Percent</dt>
              <dd className="mt-1 font-display text-xl font-semibold">{formatPercent(72.456, 1)}</dd>
            </div>
            <div>
              <dt className="text-content-subtle">Date</dt>
              <dd className="mt-1 font-display text-xl font-semibold">{formatDate(new Date(2026, 2, 5))}</dd>
            </div>
          </dl>
        </div>
      </Section>

      <Section title="Cards" description="Static and interactive (hover) surfaces.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <p className="text-sm text-content-muted">Static card</p>
            <p className="mt-2 font-display text-2xl font-semibold">{formatCurrency(48250)}</p>
          </Card>
          <Card interactive>
            <div className="flex items-center justify-between">
              <p className="text-sm text-content-muted">Interactive card</p>
              <TrendingUp className="h-5 w-5 text-brand-400" aria-hidden="true" />
            </div>
            <p className="mt-2 font-display text-2xl font-semibold">{formatCurrency(12400)}</p>
          </Card>
        </div>
      </Section>

      <Section title="Feedback" description="Loading, empty, modal and toast patterns.">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <Spinner size="sm" />
            <Spinner />
            <Spinner size="lg" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={modal.open}>
              Open modal
            </Button>
            <Button variant="secondary" onClick={() => toast.success('Transaction saved')}>
              Success toast
            </Button>
            <Button variant="secondary" onClick={() => toast.error('Something went wrong')}>
              Error toast
            </Button>
          </div>
          <div className="rounded-card border border-dashed border-line">
            <EmptyState
              title="No transactions yet"
              description="Add your first income or expense to see it here."
              action={<Button size="sm">Add transaction</Button>}
            />
          </div>
        </div>
      </Section>

      <Modal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title="Add a category"
        description="Press Escape, click outside, or use the buttons to close."
        footer={
          <>
            <Button variant="ghost" onClick={modal.close}>
              Cancel
            </Button>
            <Button onClick={modal.close}>Save</Button>
          </>
        }
      >
        <Input label="Category name" placeholder="e.g. Subscriptions" />
      </Modal>
    </div>
  );
}
