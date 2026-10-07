import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, useSearchParams, useLocation, Link } from 'react-router-dom'
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  ArrowUpDown,
  ArrowUpRight,
  ArrowLeft,
  CircleAlert,
  Check,
  X,
  MoveHorizontal,
  ChevronRight,
  RotateCcw,
  Clock3,
} from 'lucide-react'
import { useApp } from './context'
import { EnvBadge } from './ui'
import {
  projects,
  components,
  groups,
  teams,
  owners,
  environments,
  getRecords,
  readinessPercent,
  statusCounts,
  teamName,
  ownerName,
  matchesStatus,
  filterMatrixRecords,
  fullDate,
} from './data'
import {
  StatusIcon,
  StatusLegend,
  Progress,
  ProjectAvatar,
  ComponentIcon,
  GroupIcon,
  Badge,
  EmptyState,
} from './ui'
import type { Project, Environment, ComponentReadiness } from './types'
function readHidden(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem('readiness-hidden-columns') ?? '[]')
    return Array.isArray(value) ? value.filter((v) => typeof v === 'string') : []
  } catch {
    return []
  }
}
export function ProjectsView() {
  const { environment, openDrawer, setEnvironment, selectedRecordId } = useApp()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [hidden, setHidden] = useState<string[]>(readHidden)
  const [columnsOpen, setColumnsOpen] = useState(false)
  const [sort, setSort] = useState(() => sessionStorage.getItem('matrix-sort') ?? 'name')
  const menuRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    sessionStorage.setItem('matrix-filters', params.toString())
  }, [params])
  useEffect(() => {
    sessionStorage.setItem('matrix-sort', sort)
  }, [sort])
  const search = params.get('search') ?? ''
  const status = params.get('status') ?? 'All'
  const team = params.get('team') ?? 'All'
  const owner = params.get('owner') ?? 'All'
  const componentFilter = params.get('component') ?? 'All'
  const completion = params.get('completion')
  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value === 'All' || value === '') next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }
  const reset = () => {
    setParams({}, { replace: true })
  }
  const visible = components.filter((c) =>
    componentFilter !== 'All' ? c.id === componentFilter : !hidden.includes(c.id),
  )
  const visibleGroups = groups.filter((group) => visible.some((c) => c.group === group))
  useEffect(() => {
    try {
      localStorage.setItem('readiness-hidden-columns', JSON.stringify(hidden))
    } catch {}
  }, [hidden])
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setColumnsOpen(false)
    }
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setColumnsOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', key)
    }
  }, [])
  useEffect(() => {
    const saved = sessionStorage.getItem('matrix-scroll')
    if (saved && scrollRef.current) {
      const [left, top] = JSON.parse(saved)
      scrollRef.current.scrollLeft = left
      scrollRef.current.scrollTop = top
    }
  }, [])
  const rows = projects
    .flatMap((project) =>
      (environment === 'All' ? environments : [environment]).map((env) => ({
        project,
        env,
        records: getRecords(project.id, env),
      })),
    )
    .filter(({ project, records }) => {
      const filtered = filterMatrixRecords(records, componentFilter, owner)
      return (
        project.name.toLowerCase().includes(search.toLowerCase()) &&
        (team === 'All' || project.teamId === team) &&
        (owner === 'All' || filtered.length > 0) &&
        matchesStatus(filtered, status) &&
        (completion !== 'ready' ||
          records.filter((r) => r.status !== 'N/A').every((r) => r.status === 'Ready'))
      )
    })
    .sort((a, b) =>
      sort === 'readiness'
        ? readinessPercent(a.records) - readinessPercent(b.records)
        : sort === 'blockers'
          ? b.records.filter((r) => r.status === 'Blocked').length -
            a.records.filter((r) => r.status === 'Blocked').length
          : a.project.name.localeCompare(b.project.name) || a.env.localeCompare(b.env),
    )
  const hasFilters =
    search ||
    status !== 'All' ||
    team !== 'All' ||
    owner !== 'All' ||
    componentFilter !== 'All' ||
    completion
  const goProject = (project: Project, env: Environment) => {
    setEnvironment(env)
    navigate(`/projects/${project.id}`, { state: { matrixEnvironment: environment } })
  }
  return (
    <div className="page projects-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">PROJECT × INFRASTRUCTURE</div>
          <h1>
            Readiness matrix<span className="heading-dot">.</span>
          </h1>
          <p>Every project. Every dependency. One place to see what’s ready.</p>
        </div>
      </div>
      <div className="matrix-summary">
        <span>
          <FolderSummary />
          {projects.length} projects
        </span>
        <span>
          <ComponentSummary />
          {components.length} infrastructure components
        </span>
        <span>
          <span className={`env-dot ${environment.toLowerCase()}`} />
          {environment === 'All' ? 'All environments' : `${environment} environment`}
        </span>
        <div className="summary-spacer" />
        <span className="matrix-hint">
          <span className="hint-dot" />
          Click a cell to explore readiness
        </span>
      </div>
      <section className="panel matrix-panel">
        <div className="matrix-toolbar">
          <label className="search-field">
            <Search size={17} />
            <input
              placeholder="Search projects…"
              aria-label="Search projects"
              value={search}
              onChange={(e) => updateFilter('search', e.target.value)}
            />
            {search && (
              <button
                className="clear-search"
                aria-label="Clear search"
                onClick={() => updateFilter('search', '')}
              >
                <X size={14} />
              </button>
            )}
          </label>
          <div className="toolbar-filters">
            <select
              className="filter-select"
              aria-label="Status filter"
              value={status}
              onChange={(e) => updateFilter('status', e.target.value)}
            >
              <option value="All">All statuses</option>
              {['Ready', 'In Progress', 'Blocked', 'Not Started', 'N/A'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <select
              className="filter-select"
              aria-label="Team filter"
              value={team}
              onChange={(e) => updateFilter('team', e.target.value)}
            >
              <option value="All">All teams</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <select
              className="filter-select owner-filter"
              aria-label="Owner filter"
              value={owner}
              onChange={(e) => updateFilter('owner', e.target.value)}
            >
              <option value="All">All owners</option>
              {owners.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
            <select
              className="filter-select component-filter"
              aria-label="Component filter"
              value={componentFilter}
              onChange={(e) => updateFilter('component', e.target.value)}
            >
              <option value="All">All components</option>
              {components.map((c) => (
                <option value={c.id} key={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="column-menu-container" ref={menuRef}>
            <button
              className={`button columns-button ${columnsOpen ? 'is-active' : ''}`}
              onClick={() => setColumnsOpen(!columnsOpen)}
              aria-expanded={columnsOpen}
            >
              <SlidersHorizontal size={15} />
              <span>Columns</span>
              <ChevronDown size={13} />
            </button>
            {columnsOpen && (
              <div className="column-menu">
                <div className="column-menu-heading">
                  <strong>Visible components</strong>
                  <button onClick={() => setHidden([])}>Show all</button>
                </div>
                {groups.map((group) => (
                  <div key={group}>
                    <div className="column-menu-group">{group}</div>
                    {components
                      .filter((c) => c.group === group)
                      .map((c) => (
                        <label key={c.id}>
                          <input
                            type="checkbox"
                            checked={!hidden.includes(c.id)}
                            onChange={() =>
                              setHidden(
                                hidden.includes(c.id)
                                  ? hidden.filter((id) => id !== c.id)
                                  : [...hidden, c.id],
                              )
                            }
                          />
                          {c.name}
                        </label>
                      ))}
                  </div>
                ))}
                <p>Project and readiness columns stay pinned.</p>
              </div>
            )}
          </div>
        </div>
        <div className="matrix-subtoolbar">
          <div className="result-count">
            <strong>{new Set(rows.map((r) => r.project.id)).size}</strong> of {projects.length}{' '}
            projects{environment === 'All' && <span> · {rows.length} environment rows</span>}
            {hasFilters && (
              <button className="reset-button" onClick={reset}>
                <RotateCcw size={12} />
                Clear filters
              </button>
            )}
            {completion === 'ready' && <span className="subtle-pill">Fully ready</span>}
          </div>
          <label className="sort-control">
            <ArrowUpDown size={13} />
            <select
              aria-label="Sort projects"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="name">Project name</option>
              <option value="readiness">Lowest readiness</option>
              <option value="blockers">Most blockers</option>
            </select>
          </label>
        </div>
        {rows.length === 0 ? (
          <EmptyState reset={reset} />
        ) : (
          <div
            className="matrix-scroll"
            ref={scrollRef}
            onScroll={(e) => {
              const node = e.currentTarget
              sessionStorage.setItem(
                'matrix-scroll',
                JSON.stringify([node.scrollLeft, node.scrollTop]),
              )
            }}
            tabIndex={0}
            aria-label="Readiness matrix; scroll horizontally to see all components"
          >
            <table className="readiness-matrix">
              <thead>
                <tr className="group-header">
                  <th className="sticky-project" rowSpan={2}>
                    <span>PROJECT</span>
                    <small>Application / team</small>
                  </th>
                  <th className="sticky-readiness" rowSpan={2}>
                    <span>READY</span>
                    <small>Required only</small>
                  </th>
                  {visibleGroups.map((group) => (
                    <th
                      key={group}
                      colSpan={visible.filter((c) => c.group === group).length}
                      className={`group-${group.toLowerCase().replaceAll(' ', '-').replace('&', 'and')}`}
                    >
                      <span>
                        <GroupIcon group={group} />
                        {group}
                      </span>
                    </th>
                  ))}
                </tr>
                <tr className="component-header">
                  {visible.map((c) => (
                    <th key={c.id} title={c.name}>
                      <button
                        onClick={() => navigate(`/components/${c.id}`)}
                        aria-label={`View ${c.name} across projects`}
                      >
                        {c.shortName}
                        <ArrowUpRight size={10} />
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(({ project, env, records }) => (
                  <tr key={`${project.id}-${env}`}>
                    <td className="sticky-project">
                      <button className="matrix-project" onClick={() => goProject(project, env)}>
                        <ProjectAvatar project={project} small />
                        <span>
                          <strong>{project.name}</strong>
                          <small>
                            {teamName(project.teamId)}
                            {environment === 'All' && <EnvBadge environment={env} />}
                          </small>
                        </span>
                      </button>
                    </td>
                    <td className="sticky-readiness">
                      <div className="matrix-readiness">
                        <span className={readinessPercent(records) === 100 ? 'fully-ready' : ''}>
                          {readinessPercent(records)}
                          <small>%</small>
                        </span>
                        <Progress value={readinessPercent(records)} />
                      </div>
                    </td>
                    {visible.map((component) => {
                      const record = records.find((r) => r.componentId === component.id)!
                      return (
                        <td key={component.id} className="matrix-cell">
                          <button
                            className={`cell-button ${selectedRecordId === record.id ? 'selected' : ''}`}
                            aria-expanded={selectedRecordId === record.id}
                            onClick={() => openDrawer(record)}
                            aria-label={`${project.name}, ${component.name}, ${env}: ${record.status}`}
                            title={`${project.name} · ${component.name}\n${record.status} · ${env}\n${record.checks.filter((c) => c.complete).length}/${record.checks.length} checks complete`}
                          >
                            <StatusIcon status={record.status} />
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            {visible.length === 0 && (
              <div className="no-columns">
                <p>All component columns are hidden.</p>
                <button className="button" onClick={() => setHidden([])}>
                  Show all components
                </button>
              </div>
            )}
          </div>
        )}
        <div className="matrix-footer">
          <StatusLegend />
          <span className="scroll-hint">
            <MoveHorizontal size={15} />
            {visible.length} of 17 components · scroll to explore
          </span>
        </div>
      </section>
      <div className="matrix-bottom-note">
        <CircleAlert size={14} />
        <span>
          Status filters show projects with at least one matching component
          {componentFilter !== 'All' ? ' in the selected component' : ''}. N/A components are
          excluded from readiness.
        </span>
      </div>
    </div>
  )
}
function FolderSummary() {
  return (
    <span className="summary-icon">
      <span className="folder-outline" />
    </span>
  )
}
function ComponentSummary() {
  return (
    <span className="summary-icon">
      <SlidersHorizontal size={14} />
    </span>
  )
}
export function ProjectDetail() {
  const { projectId } = useParams()
  const location = useLocation()
  const { environment, setEnvironment, openDrawer } = useApp()
  const navigate = useNavigate()
  const project = projects.find((p) => p.id === projectId)
  if (!project)
    return (
      <div className="page">
        <EmptyState text="This project could not be found." />
        <Link className="button" to="/projects">
          Back to projects
        </Link>
      </div>
    )
  const records = getRecords(project.id, environment)
  const counts = statusCounts(records)
  const percent = readinessPercent(records)
  const blockers = records.filter((r) => r.blocker)
  const latest = records
    .map((r) => r.updatedAt)
    .sort()
    .at(-1)!
  const envs = environment === 'All' ? environments : [environment]
  const showRecord = (componentId: string, env: Environment) =>
    openDrawer(getRecords(project.id, env, componentId)[0])
  return (
    <div className="page detail-page">
      <Link
        to={`/projects${sessionStorage.getItem('matrix-filters') ? '?' + sessionStorage.getItem('matrix-filters') : ''}`}
        onClick={() => {
          if (location.state?.matrixEnvironment) setEnvironment(location.state.matrixEnvironment)
        }}
        className="back-link"
      >
        <ArrowLeft size={15} />
        Readiness matrix
      </Link>
      <div className="page-heading project-detail-heading">
        <div className="project-detail-title">
          <ProjectAvatar project={project} />
          <div>
            <div className="eyebrow">PROJECT READINESS</div>
            <h1>{project.name}</h1>
            <p>{project.description}</p>
          </div>
        </div>
        <span className={`readiness-big ${percent === 100 ? 'complete' : ''}`}>
          <strong>
            {percent}
            <small>%</small>
          </strong>
          <span>infrastructure ready</span>
        </span>
      </div>
      <div className="detail-metadata">
        <span>
          <b>Team</b>
          {teamName(project.teamId)}
        </span>
        <span>
          <b>Project owner</b>
          {ownerName(project.ownerId)}
        </span>
        <span>
          <Clock3 size={14} />
          <b>Updated</b>
          {fullDate(latest)}
        </span>
      </div>
      <div className="environment-tabs" role="group" aria-label="Project environment">
        {(['All', ...environments] as const).map((env) => (
          <button
            key={env}
            className={environment === env ? 'active' : ''}
            onClick={() => setEnvironment(env)}
          >
            {env === 'All' ? 'All environments' : env}
            <span>{readinessPercent(getRecords(project.id, env))}%</span>
          </button>
        ))}
      </div>
      <div className="project-status-summary">
        <span>
          <StatusIcon status="Ready" compact />
          <strong>{counts.Ready}</strong>Ready
        </span>
        <span>
          <StatusIcon status="In Progress" compact />
          <strong>{counts['In Progress']}</strong>In progress
        </span>
        <span>
          <StatusIcon status="Blocked" compact />
          <strong>{counts.Blocked}</strong>Blocked
        </span>
        <span>
          <StatusIcon status="Not Started" compact />
          <strong>{counts['Not Started']}</strong>Not started
        </span>
        <span className="na-summary">
          <strong>{counts['N/A']}</strong>Not applicable
        </span>
      </div>
      {blockers.length > 0 && (
        <section className="project-blockers">
          <div className="project-blockers-heading">
            <CircleAlert size={18} />
            <div>
              <h2>
                {blockers.length} infrastructure blocker{blockers.length === 1 ? '' : 's'}
              </h2>
              <p>These dependencies need attention to move this project forward.</p>
            </div>
            <button
              className="text-link"
              onClick={() => navigate(`/blockers?project=${project.id}`)}
            >
              View all
              <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="project-blocker-list">
            {blockers.slice(0, 3).map((r) => (
              <button key={r.id} onClick={() => openDrawer(r)}>
                <span>
                  <strong>{components.find((c) => c.id === r.componentId)!.name}</strong>
                  <EnvBadge environment={r.environment} />
                  <span className="ticket-label">{r.blocker!.ticket}</span>
                </span>
                <p>{r.blocker!.description}</p>
                <ChevronRight size={15} />
              </button>
            ))}
          </div>
        </section>
      )}
      <div className="section-intro">
        <h2>Infrastructure components</h2>
        <span>
          {components.length} components · {environment === 'All' ? '3 environments' : environment}
        </span>
      </div>
      <div className="project-component-grid">
        {groups.map((group) => (
          <section className="panel component-group" key={group}>
            <div className="component-group-heading">
              <span>
                <GroupIcon group={group} />
                <h3>{group}</h3>
              </span>
              <small>{components.filter((c) => c.group === group).length} components</small>
            </div>
            {environment === 'All' && (
              <div className="all-env-labels">
                <span />
                {envs.map((env) => (
                  <span key={env}>{env}</span>
                ))}
                <span />
              </div>
            )}
            {components
              .filter((c) => c.group === group)
              .map((component) => (
                <div className="project-component-row" key={component.id}>
                  <button
                    className="project-component-name"
                    onClick={() =>
                      showRecord(component.id, environment === 'All' ? 'DEV' : environment)
                    }
                  >
                    <ComponentIcon component={component} size={17} />
                    <span>{component.name}</span>
                  </button>
                  <div
                    className={`project-component-statuses ${environment === 'All' ? 'multi-env' : ''}`}
                  >
                    {envs.map((env) => {
                      const record = records.find(
                        (r) => r.componentId === component.id && r.environment === env,
                      ) as ComponentReadiness
                      return (
                        <button
                          key={env}
                          onClick={() => openDrawer(record)}
                          aria-label={`${component.name} ${env} ${record.status}`}
                          title={`Inspect ${component.name} · ${env}`}
                        >
                          {environment === 'All' ? (
                            <StatusIcon status={record.status} />
                          ) : (
                            <Badge status={record.status} />
                          )}
                        </button>
                      )
                    })}
                  </div>
                  <button
                    className="component-portfolio-link"
                    aria-label={`View ${component.name} across all projects`}
                    title="View component portfolio"
                    onClick={() => navigate(`/components/${component.id}`)}
                  >
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              ))}
          </section>
        ))}
      </div>
      <div className="matrix-bottom-note">
        <Check size={14} />
        <span>
          Click a component to inspect readiness. Use the arrow to explore that component across the
          portfolio.
        </span>
      </div>
    </div>
  )
}
