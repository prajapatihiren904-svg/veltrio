import { CheckCircle2, Database, RefreshCw, Server, XCircle } from 'lucide-react';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Card, { CardHeader } from '@/components/common/Card';
import Skeleton from '@/components/feedback/Skeleton';
import { useHealth } from '@/hooks/useHealth';

function StatusRow({ icon: Icon, label, detail, state }) {
  return (
    <li className="flex items-center justify-between gap-4 rounded-control border border-line bg-surface px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <Icon className="h-5 w-5 shrink-0 text-content-muted" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-sm font-medium">{label}</p>
          <p className="truncate text-xs text-content-subtle">{detail}</p>
        </div>
      </div>
      {state === 'loading' && <Skeleton className="h-5 w-5 rounded-full" />}
      {state === 'ok' && <CheckCircle2 className="h-5 w-5 shrink-0 text-success" aria-label="Healthy" />}
      {state === 'down' && <XCircle className="h-5 w-5 shrink-0 text-danger" aria-label="Unavailable" />}
    </li>
  );
}

/** Live check of frontend -> API -> MongoDB communication. */
export default function SystemStatus() {
  const { status, data, error, isLoading, refresh } = useHealth();

  const apiState = isLoading ? 'loading' : status === 'success' ? 'ok' : 'down';
  const dbState = isLoading ? 'loading' : data?.database === 'connected' ? 'ok' : 'down';

  const apiDetail = isLoading ? 'Checking...' : status === 'success' ? `Responding, up for ${data.uptime}s` : error?.message;
  const dbDetail = isLoading ? 'Checking...' : data?.database === 'connected' ? 'MongoDB Atlas connected' : 'Not connected';

  return (
    <Card className="w-full max-w-md text-left">
      <CardHeader
        title="System status"
        description="Live check of the full stack"
        action={
          <Badge tone={apiState === 'ok' && dbState === 'ok' ? 'success' : isLoading ? 'neutral' : 'danger'} dot>
            {isLoading ? 'Checking' : apiState === 'ok' && dbState === 'ok' ? 'All systems go' : 'Attention'}
          </Badge>
        }
      />
      <ul className="space-y-2.5">
        <StatusRow icon={Server} label="API server" detail={apiDetail} state={apiState} />
        <StatusRow icon={Database} label="Database" detail={dbDetail} state={dbState} />
      </ul>
      <Button variant="secondary" size="sm" className="mt-4 w-full" onClick={refresh} loading={isLoading}>
        {!isLoading && <RefreshCw className="h-4 w-4" aria-hidden="true" />}
        Re-check
      </Button>
    </Card>
  );
}
