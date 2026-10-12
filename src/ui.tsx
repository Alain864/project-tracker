import {
  Check,
  Clock3,
  AlertCircle,
  Circle,
  Minus,
  Database,
  Boxes,
  GitBranch,
  ShieldCheck,
  Fingerprint,
  Users,
  Bot,
  Layers,
  KeyRound,
  Workflow,
  Network,
  Github,
  Activity,
  SearchX,
  ArrowUpRight,
} from 'lucide-react'
import type { InfrastructureComponent, Project, Status, Environment } from './types'
export const statusLabel: Record<Status, string> = {
  Ready: 'Ready',
  'In Progress': 'Pending',
  Blocked: 'Missing',
  'Not Started': 'Not recorded',
  'N/A': 'N/A',
}
export const statusClass = (status: Status) =>
  status.toLowerCase().replaceAll(' ', '-').replace('/', '')
export function StatusIcon({ status, compact = false }: { status: Status; compact?: boolean }) {
  const Icon =
    status === 'Ready'
      ? Check
      : status === 'In Progress'
        ? Clock3
        : status === 'Blocked'
          ? AlertCircle
          : status === 'N/A'
            ? Minus
            : Circle
  return (
    <span className={`status-icon ${statusClass(status)} ${compact ? 'compact' : ''}`}>
      <Icon size={compact ? 13 : 15} strokeWidth={status === 'Ready' ? 2.8 : 2} />
    </span>
  )
}
export function Badge({ status }: { status: Status }) {
  return (
    <span className={`status-badge ${statusClass(status)}`}>
      <StatusIcon status={status} compact />
      {statusLabel[status]}
    </span>
  )
}
export function ComponentIcon({
  component,
  size = 19,
}: {
  component: InfrastructureComponent
  size?: number
}) {
  const map: Record<string, typeof Database> = {
    vm: Boxes,
    postgres: Database,
    pgvector: Boxes,
    redis: Layers,
    langfuse: Activity,
    databricks: Database,
    openshift: Boxes,
    argocd: Workflow,
    'github-repo': Github,
    'github-teams': Users,
    nesgen: KeyRound,
    keyvault: ShieldCheck,
    'keyvault-roles': ShieldCheck,
    spns: Fingerprint,
    'spns-graph': Network,
    'frontend-spns': Fingerprint,
    'fe-spn-graph': Network,
    'aad-groups': Users,
    'persona-groups': Users,
  }
  const Icon = map[component.id] ?? Bot
  return <Icon size={size} strokeWidth={1.7} />
}
export function GroupIcon({ group }: { group: string }) {
  const Icon =
    group === 'Data & AI'
      ? Database
      : group === 'Platform'
        ? Boxes
        : group === 'GitHub'
          ? GitBranch
          : group === 'Secrets & Security'
            ? ShieldCheck
            : group === 'Identity'
              ? Fingerprint
              : Users
  return <Icon size={16} />
}
export function ProjectAvatar({ project, small = false }: { project: Project; small?: boolean }) {
  return (
    <span className={`project-avatar ${project.color} ${small ? 'small' : ''}`}>
      {project.initials}
    </span>
  )
}
export function Progress({ value }: { value: number }) {
  return (
    <div
      className="progress"
      role="meter"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${value}% ready`}
    >
      <span style={{ width: `${value}%` }} />
    </div>
  )
}
export function EmptyState({
  reset,
  text = 'No results match your filters.',
}: {
  reset?: () => void
  text?: string
}) {
  return (
    <div className="empty-state">
      <SearchX size={28} />
      <h3>Nothing here just yet</h3>
      <p>{text}</p>
      {reset && (
        <button className="button" onClick={reset}>
          Clear filters
        </button>
      )}
    </div>
  )
}
export function SectionLink({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button className="text-link" onClick={onClick}>
      {children}
      <ArrowUpRight size={14} />
    </button>
  )
}
export function StatusLegend() {
  return (
    <div className="status-legend">
      {(['Ready', 'In Progress', 'Blocked', 'Not Started', 'N/A'] as Status[]).map((status) => (
        <span key={status}>
          <StatusIcon status={status} compact />
          {statusLabel[status]}
        </span>
      ))}
    </div>
  )
}

export function EnvBadge({ environment }: { environment: Environment }) {
  return <span className={`env-badge ${environment.toLowerCase()}`}>{environment}</span>
}
