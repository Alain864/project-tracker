import { useNavigate } from 'react-router-dom'
import {
  ArrowUpRight,
  ArrowRight,
  FolderKanban,
  CheckCheck,
  CircleAlert,
  CalendarDays,
  Activity,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { useApp } from './context'
import { EnvBadge } from './ui'
import {
  projects,
  components,
  getRecords,
  readinessPercent,
  statusCounts,
  environments,
  teams,
  teamName,
  shortDate,
} from './data'
import { Progress, ProjectAvatar, ComponentIcon, SectionLink, Badge } from './ui'
import type { Environment } from './types'
export function Overview() {
  const { environment, setEnvironment, openDrawer } = useApp()
  const navigate = useNavigate()
  const records = getRecords(undefined, environment)
  const overall = readinessPercent(records)
  const readyProjects = projects.filter((p) => {
    const r = records.filter((r) => r.projectId === p.id && r.status !== 'N/A')
    return r.length && r.every((r) => r.status === 'Ready')
  })
  const blockedProjects = projects.filter((p) =>
    records.some((r) => r.projectId === p.id && r.status === 'Blocked'),
  )
  const counts = statusCounts(records)
  const hotComponents = components
    .map((c) => ({ component: c, records: records.filter((r) => r.componentId === c.id) }))
    .map((c) => ({ ...c, count: c.records.filter((r) => r.status === 'Blocked').length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
  const attention = blockedProjects
    .map((project) => ({ project, records: records.filter((r) => r.projectId === project.id) }))
    .sort(
      (a, b) =>
        b.records.filter((r) => r.status === 'Blocked').length -
        a.records.filter((r) => r.status === 'Blocked').length,
    )
    .slice(0, 5)
  const updates = [...records]
    .filter((r) => r.status !== 'N/A')
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5)
  const goProjects = (status?: string) =>
    navigate(`/projects${status ? `?status=${encodeURIComponent(status)}` : ''}`)
  const goEnv = (env: Environment) => {
    setEnvironment(env)
    navigate('/projects')
  }
  return (
    <div className="page overview-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">YOUR PLATFORM, AT A GLANCE</div>
          <h1>
            Infrastructure readiness<span className="heading-dot">.</span>
          </h1>
          <p>A shared view of what’s ready, what’s moving, and what needs attention.</p>
        </div>
        <div className="heading-actions">
          <span className="date-label">
            <CalendarDays size={14} />
            Oct 7, 2026
          </span>
          <button className="button primary" onClick={() => goProjects()}>
            Explore matrix
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>
      <div className="metrics-grid">
        <button className="metric" onClick={() => goProjects()}>
          <div className="metric-label">
            Total projects
            <FolderKanban size={17} />
          </div>
          <div className="metric-value">
            {projects.length}
            <span className="metric-chip neutral">5 teams</span>
          </div>
          <span className="metric-caption">
            Across your project portfolio
            <ArrowUpRight size={14} />
          </span>
        </button>
        <button className="metric" onClick={() => goProjects('Ready')}>
          <div className="metric-label">
            Overall readiness
            <Activity size={17} />
          </div>
          <div className="metric-value">
            {overall}
            <span className="value-unit">%</span>
            <span className="metric-chip positive">{counts.Ready} ready</span>
          </div>
          <span className="metric-caption">
            Of {records.filter((r) => r.status !== 'N/A').length} required component records
            <ArrowUpRight size={14} />
          </span>
        </button>
        <button className="metric" onClick={() => navigate('/projects?completion=ready')}>
          <div className="metric-label">
            Ready projects
            <CheckCheck size={18} />
          </div>
          <div className="metric-value">
            {readyProjects.length}
            <span className="value-total">/ {projects.length}</span>
          </div>
          <span className="metric-caption">
            Every required component is ready
            <ArrowUpRight size={14} />
          </span>
        </button>
        <button className="metric" onClick={() => goProjects('Blocked')}>
          <div className="metric-label">
            Projects with blockers
            <CircleAlert size={17} />
          </div>
          <div className="metric-value">
            {blockedProjects.length}
            <span className="metric-chip attention">Needs attention</span>
          </div>
          <span className="metric-caption">
            {counts.Blocked} component blockers to resolve
            <ArrowUpRight size={14} />
          </span>
        </button>
      </div>
      <div className="overview-mid">
        <section className="panel environment-panel">
          <div className="panel-heading">
            <div>
              <h2>Readiness by environment</h2>
              <p>From development to production.</p>
            </div>
            <span className="subtle-pill">Portfolio-wide</span>
          </div>
          <div className="environment-bars">
            {environments.map((env) => {
              const envRecords = getRecords(undefined, env).filter((r) => r.status !== 'N/A')
              const envCounts = statusCounts(envRecords)
              const value = readinessPercent(envRecords)
              return (
                <div className="environment-row" key={env}>
                  <button className="environment-row-label" onClick={() => goEnv(env)}>
                    <EnvBadge environment={env} />
                    <span>
                      {env === 'DEV'
                        ? 'Development'
                        : env === 'QA'
                          ? 'Quality assurance'
                          : 'Production'}
                    </span>
                    <ArrowUpRight size={13} />
                  </button>
                  <button
                    className="stacked-bar"
                    aria-label={`${env} readiness ${value}%, open projects`}
                    onClick={() => goEnv(env)}
                  >
                    {(['Ready', 'In Progress', 'Blocked', 'Not Started'] as const).map((status) => (
                      <span
                        title={`${status}: ${envCounts[status]}`}
                        className={status.toLowerCase().replace(' ', '-')}
                        style={{ width: `${(envCounts[status] / envRecords.length) * 100}%` }}
                        key={status}
                      />
                    ))}
                  </button>
                  <strong>
                    {value}
                    <small>%</small>
                  </strong>
                </div>
              )
            })}
          </div>
          <div className="bar-legend">
            <span>
              <i className="ready" />
              Ready
            </span>
            <span>
              <i className="in-progress" />
              In progress
            </span>
            <span>
              <i className="blocked" />
              Blocked
            </span>
            <span>
              <i className="not-started" />
              Not started
            </span>
          </div>
          <div className="environment-note">
            <Sparkles size={15} />
            <span>Readiness excludes components marked N/A.</span>
          </div>
        </section>
        <section className="panel hot-components">
          <div className="panel-heading">
            <div>
              <h2>Where work is held up</h2>
              <p>Components with the most active blockers.</p>
            </div>
            <SectionLink onClick={() => navigate('/blockers')}>All blockers</SectionLink>
          </div>
          <div>
            {hotComponents.map(({ component, count }, index) => (
              <button
                className="hot-component-row"
                key={component.id}
                onClick={() => navigate(`/components/${component.id}?status=Blocked`)}
              >
                <span className="rank">{String(index + 1).padStart(2, '0')}</span>
                <span className="component-mini-icon">
                  <ComponentIcon component={component} size={16} />
                </span>
                <span className="hot-name">{component.name}</span>
                <span className="mini-blocker-bar">
                  <span
                    style={{ width: `${(count / Math.max(hotComponents[0].count, 1)) * 100}%` }}
                  />
                </span>
                <span className="blocked-count">{count}</span>
                <ChevronRight size={14} />
              </button>
            ))}
          </div>
        </section>
      </div>
      <div className="overview-bottom">
        <section className="panel attention-panel">
          <div className="panel-heading">
            <div>
              <h2>
                Projects needing attention
                <span className="count-pill">{blockedProjects.length}</span>
              </h2>
              <p>A little focus here goes a long way.</p>
            </div>
            <SectionLink onClick={() => goProjects('Blocked')}>View projects</SectionLink>
          </div>
          <div className="attention-table">
            <div className="attention-table-head">
              <span>PROJECT</span>
              <span>READINESS</span>
              <span>BLOCKERS</span>
              <span />
            </div>
            {attention.map(({ project, records }) => (
              <button
                className="attention-row"
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <span className="project-inline">
                  <ProjectAvatar project={project} small />
                  <span>
                    <strong>{project.name}</strong>
                    <small>{teamName(project.teamId)}</small>
                  </span>
                </span>
                <span className="attention-progress">
                  <Progress value={readinessPercent(records)} />
                  <strong>{readinessPercent(records)}%</strong>
                </span>
                <span className="attention-count">
                  <CircleAlert size={13} />
                  {records.filter((r) => r.status === 'Blocked').length} blocked
                </span>
                <ChevronRight size={15} />
              </button>
            ))}
          </div>
        </section>
        <section className="panel updates-panel">
          <div className="panel-heading">
            <div>
              <h2>Latest activity</h2>
              <p>Recent component updates.</p>
            </div>
            <span className="activity-dot" />
          </div>
          <div className="activity-feed">
            {updates.map((record) => {
              const project = projects.find((p) => p.id === record.projectId)!
              const component = components.find((c) => c.id === record.componentId)!
              return (
                <button key={record.id} className="activity-row" onClick={() => openDrawer(record)}>
                  <span className="activity-icon">
                    <ComponentIcon component={component} size={16} />
                  </span>
                  <span className="activity-info">
                    <strong>{project.name}</strong>
                    <span>
                      {component.shortName}
                      <span className="activity-env">{record.environment}</span>
                    </span>
                    <Badge status={record.status} />
                  </span>
                  <time>{shortDate(record.updatedAt)}</time>
                </button>
              )
            })}
          </div>
        </section>
      </div>
      <section className="panel team-panel">
        <div className="panel-heading">
          <div>
            <h2>Readiness by team</h2>
            <p>Shared progress across application teams.</p>
          </div>
          <span className="subtle-pill">
            {environment === 'All' ? 'All environments' : environment}
          </span>
        </div>
        <div className="team-readiness">
          {teams.map((team, index) => {
            const teamProjects = projects.filter((p) => p.teamId === team.id)
            const value = readinessPercent(
              records.filter((r) => teamProjects.some((p) => p.id === r.projectId)),
            )
            return (
              <button
                className="team-readiness-item"
                key={team.id}
                onClick={() => navigate(`/projects?team=${team.id}`)}
              >
                <div>
                  <span
                    className={`team-avatar ${['sage', 'blue', 'purple', 'amber', 'rose'][index]}`}
                  >
                    {team.name
                      .split(' ')
                      .map((t) => t[0])
                      .join('')
                      .slice(0, 2)}
                  </span>
                  <ArrowUpRight size={14} />
                </div>
                <strong>{team.name}</strong>
                <span>{teamProjects.length} projects</span>
                <div className="team-progress">
                  <Progress value={value} />
                  <b>{value}%</b>
                </div>
              </button>
            )
          })}
        </div>
      </section>
      <div className="overview-tail">
        <span>Good infrastructure is a team effort.</span>
        <button onClick={() => navigate('/components')}>
          Explore all 17 components
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  )
}
