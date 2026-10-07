import { useState } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import {
  Search,
  ArrowUpRight,
  ArrowLeft,
  ChevronRight,
  CircleAlert,
  Layers,
  X,
  Check,
  ListChecks,
} from 'lucide-react'
import { useApp } from './context'
import { EnvBadge } from './ui'
import {
  components,
  groups,
  projects,
  teams,
  owners,
  getRecords,
  statusCounts,
  readinessPercent,
  ownerName,
  teamName,
  shortDate,
} from './data'
import { ComponentIcon, Progress, ProjectAvatar, Badge, EmptyState, StatusIcon } from './ui'
export function ComponentsView() {
  const { environment } = useApp()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [group, setGroup] = useState('All')
  const [status, setStatus] = useState('All')
  const [sort, setSort] = useState('group')
  const cards = components
    .map((component) => ({
      component,
      records: getRecords(undefined, environment, component.id).filter((r) => r.status !== 'N/A'),
    }))
    .filter(
      ({ component, records }) =>
        component.name.toLowerCase().includes(search.toLowerCase()) &&
        (group === 'All' || component.group === group) &&
        (status === 'All' || records.some((r) => r.status === status)),
    )
    .sort((a, b) =>
      sort === 'blockers'
        ? statusCounts(b.records).Blocked - statusCounts(a.records).Blocked
        : sort === 'readiness'
          ? readinessPercent(a.records) - readinessPercent(b.records)
          : 0,
    )
  const reset = () => {
    setSearch('')
    setGroup('All')
    setStatus('All')
    setSort('group')
  }
  return (
    <div className="page components-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">THE COMPONENT PERSPECTIVE</div>
          <h1>
            Infrastructure components<span className="heading-dot">.</span>
          </h1>
          <p>See how each platform dependency is doing across your portfolio.</p>
        </div>
        <span className="heading-counter">
          <Layers size={17} />
          {components.length} component types
        </span>
      </div>
      <div className="components-toolbar">
        <label className="search-field">
          <Search size={17} />
          <input
            aria-label="Search components"
            placeholder="Search components…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="clear-search"
              aria-label="Clear component search"
              onClick={() => setSearch('')}
            >
              <X size={14} />
            </button>
          )}
        </label>
        <select
          className="filter-select"
          aria-label="Component status filter"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="All">All statuses</option>
          {['Ready', 'In Progress', 'Blocked', 'Not Started'].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <div className="toolbar-spacer" />
        <select
          className="filter-select"
          aria-label="Sort components"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="group">Grouped by category</option>
          <option value="blockers">Most blockers first</option>
          <option value="readiness">Lowest readiness first</option>
        </select>
      </div>
      <div className="category-tabs">
        {['All', ...groups].map((g) => (
          <button className={group === g ? 'active' : ''} key={g} onClick={() => setGroup(g)}>
            {g === 'All' ? 'All components' : g}
            {g === 'All' && <span>17</span>}
          </button>
        ))}
      </div>
      <div className="component-results">
        <span>{cards.length} component types</span>
        <span>
          {environment === 'All'
            ? 'Counts include component records in all 3 environments.'
            : `Readiness in ${environment}`}{' '}
          · N/A excluded
        </span>
      </div>
      {cards.length === 0 ? (
        <EmptyState reset={reset} />
      ) : (
        <div className="component-cards">
          {cards.map(({ component, records }) => {
            const counts = statusCounts(records)
            const value = readinessPercent(records)
            const usedProjects = new Set(records.map((r) => r.projectId)).size
            return (
              <button
                className="panel component-card"
                key={component.id}
                onClick={() => navigate(`/components/${component.id}`)}
              >
                <div className="component-card-top">
                  <span
                    className={`component-card-icon category-${component.group.split(' ')[0].toLowerCase()}`}
                  >
                    <ComponentIcon component={component} size={22} />
                  </span>
                  <span className="component-card-group">{component.group}</span>
                  <ArrowUpRight size={16} />
                </div>
                <h2>{component.name}</h2>
                <p className="component-card-description">{component.description}</p>
                <div className="component-card-progress">
                  <span>
                    <strong>{value}%</strong> ready
                  </span>
                  <span>{usedProjects} projects</span>
                </div>
                <Progress value={value} />
                <div className="component-card-counts">
                  <span>
                    <StatusIcon status="Ready" compact />
                    <b>{counts.Ready}</b>Ready
                  </span>
                  <span>
                    <StatusIcon status="In Progress" compact />
                    <b>{counts['In Progress']}</b>In progress
                  </span>
                  <span className={counts.Blocked ? 'has-blockers' : ''}>
                    <StatusIcon status="Blocked" compact />
                    <b>{counts.Blocked}</b>Blocked
                  </span>
                </div>
                {counts['Not Started'] > 0 && (
                  <div className="component-not-started">{counts['Not Started']} not started</div>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
export function ComponentDetail() {
  const { componentId } = useParams()
  const { environment, setEnvironment, openDrawer } = useApp()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const component = components.find((c) => c.id === componentId)
  const [criteriaOpen, setCriteriaOpen] = useState(false)
  if (!component)
    return (
      <div className="page">
        <EmptyState text="This component could not be found." />
        <Link className="button" to="/components">
          Back to components
        </Link>
      </div>
    )
  const records = getRecords(undefined, environment, component.id).filter((r) => r.status !== 'N/A')
  const counts = statusCounts(records)
  const usedProjects = new Set(records.map((r) => r.projectId)).size
  const status = params.get('status') ?? 'All'
  const search = params.get('search') ?? ''
  const team = params.get('team') ?? 'All'
  const owner = params.get('owner') ?? 'All'
  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value === 'All' || !value) next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }
  const filtered = records
    .filter((r) => {
      const project = projects.find((p) => p.id === r.projectId)!
      return (
        (status === 'All' || r.status === status) &&
        project.name.toLowerCase().includes(search.toLowerCase()) &&
        (team === 'All' || team === project.teamId) &&
        (owner === 'All' || owner === r.ownerId)
      )
    })
    .sort((a, b) => {
      const priority: Record<string, number> = {
        Blocked: 0,
        'Not Started': 1,
        'In Progress': 2,
        Ready: 3,
      }
      return priority[a.status] - priority[b.status] || a.projectId.localeCompare(b.projectId)
    })
  return (
    <div className="page detail-page">
      <Link className="back-link" to="/components">
        <ArrowLeft size={15} />
        All components
      </Link>
      <div className="page-heading component-detail-heading">
        <div className="project-detail-title">
          <span className="large-component-icon">
            <ComponentIcon component={component} size={29} />
          </span>
          <div>
            <div className="eyebrow">{component.group.toUpperCase()} / COMPONENT READINESS</div>
            <h1>{component.name}</h1>
            <p>{component.description}</p>
          </div>
        </div>
        <span className="readiness-big">
          <strong>
            {readinessPercent(records)}
            <small>%</small>
          </strong>
          <span>infrastructure ready</span>
        </span>
      </div>
      <div className="component-detail-meta">
        <span>
          <Layers size={15} />
          Used by <strong>{usedProjects} projects</strong>
        </span>
        <span>
          {records.length} required records in{' '}
          {environment === 'All' ? 'all environments' : environment}
        </span>
      </div>
      <div className="component-detail-stats">
        {(['Ready', 'In Progress', 'Blocked', 'Not Started'] as const).map((s) => (
          <button
            key={s}
            className={status === s ? 'active' : ''}
            onClick={() => setFilter('status', status === s ? 'All' : s)}
          >
            <StatusIcon status={s} />
            <span>
              <strong>{counts[s]}</strong>
              <small>{s}</small>
            </span>
            <ArrowUpRight size={15} />
          </button>
        ))}
      </div>
      <section className="panel criteria-panel">
        <button aria-expanded={criteriaOpen} onClick={() => setCriteriaOpen(!criteriaOpen)}>
          <ListChecks size={18} />
          <span>
            <strong>What does “Ready” mean for {component.shortName}?</strong>
            <small>{component.checks.length} component-specific checks</small>
          </span>
          <ChevronRight size={17} className={criteriaOpen ? 'rotated' : ''} />
        </button>
        {criteriaOpen && (
          <div className="criteria-list">
            {component.checks.map((c) => (
              <div key={c.label}>
                <Check size={14} />
                <span>
                  <small>{c.category}</small>
                  {c.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
      <section className="panel component-projects">
        <div className="panel-heading">
          <div>
            <h2>Project readiness</h2>
            <p>Inspect a status to see the checklist and any active blocker.</p>
          </div>
          {counts.Blocked > 0 && (
            <button
              className="text-link"
              onClick={() => navigate(`/blockers?component=${component.id}`)}
            >
              <CircleAlert size={14} />
              Inspect blockers
              <ArrowUpRight size={14} />
            </button>
          )}
        </div>
        <div className="matrix-toolbar">
          <label className="search-field">
            <Search size={16} />
            <input
              placeholder="Search projects…"
              aria-label="Search component projects"
              value={search}
              onChange={(e) => setFilter('search', e.target.value)}
            />
          </label>
          <select
            className="filter-select"
            value={status}
            aria-label="Project component status filter"
            onChange={(e) => setFilter('status', e.target.value)}
          >
            <option value="All">All statuses</option>
            {['Ready', 'In Progress', 'Blocked', 'Not Started'].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            className="filter-select"
            aria-label="Component project team filter"
            value={team}
            onChange={(e) => setFilter('team', e.target.value)}
          >
            <option value="All">All teams</option>
            {teams.map((t) => (
              <option value={t.id} key={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <select
            className="filter-select"
            aria-label="Component project owner filter"
            value={owner}
            onChange={(e) => setFilter('owner', e.target.value)}
          >
            <option value="All">All owners</option>
            {owners.map((o) => (
              <option value={o.id} key={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
        {filtered.length === 0 ? (
          <EmptyState reset={() => setParams({})} />
        ) : (
          <div className="data-table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>PROJECT</th>
                  <th>ENVIRONMENT</th>
                  <th>STATUS</th>
                  <th>INFRASTRUCTURE OWNER</th>
                  <th>LAST UPDATED</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((record) => {
                  const project = projects.find((p) => p.id === record.projectId)!
                  return (
                    <tr key={record.id}>
                      <td>
                        <button
                          className="project-inline"
                          onClick={() => {
                            setEnvironment(record.environment)
                            navigate(`/projects/${project.id}`)
                          }}
                        >
                          <ProjectAvatar project={project} small />
                          <span>
                            <strong>{project.name}</strong>
                            <small>{teamName(project.teamId)}</small>
                          </span>
                        </button>
                      </td>
                      <td>
                        <EnvBadge environment={record.environment} />
                      </td>
                      <td>
                        <button
                          className="table-status-button"
                          onClick={() => openDrawer(record)}
                          aria-label={`${project.name} ${record.environment} ${record.status} details`}
                        >
                          <Badge status={record.status} />
                        </button>
                      </td>
                      <td>{ownerName(record.ownerId)}</td>
                      <td className="muted-text">{shortDate(record.updatedAt)}, 2026</td>
                      <td>
                        <button
                          className="icon-button"
                          onClick={() => openDrawer(record)}
                          aria-label={`Inspect ${project.name} ${component.name} ${record.environment}`}
                        >
                          <ChevronRight size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="table-footer">
          <span>
            {filtered.length} of {records.length} required records
          </span>
          <span>N/A projects are excluded</span>
        </div>
      </section>
    </div>
  )
}
