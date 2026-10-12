import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Search,
  CircleAlert,
  ChevronRight,
  ArrowUpDown,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react'
import { useApp } from './context'
import { EnvBadge } from './ui'
import {
  projects,
  components,
  teams,
  owners,
  getRecords,
  ownerName,
  teamName,
  shortDate,
} from './data'
import { ProjectAvatar, ComponentIcon, EmptyState } from './ui'
export function BlockersView() {
  const { environment, openDrawer } = useApp()
  const [params, setParams] = useSearchParams()
  const [sort, setSort] = useState('severity')
  const records = getRecords(undefined, environment).filter((r) => r.blocker)
  const ownerTeams = new Set(records.map((r) => r.ownerId)).size
  const search = params.get('search') ?? ''
  const projectFilter = params.get('project') ?? 'All'
  const componentFilter = params.get('component') ?? 'All'
  const team = params.get('team') ?? 'All'
  const owner = params.get('owner') ?? 'All'
  const severity = params.get('severity') ?? 'All'
  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value === 'All' || !value) next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }
  const filtered = records
    .filter((r) => {
      const p = projects.find((p) => p.id === r.projectId)!
      const c = components.find((c) => c.id === r.componentId)!
      return (
        (projectFilter === 'All' || r.projectId === projectFilter) &&
        (componentFilter === 'All' || r.componentId === componentFilter) &&
        (team === 'All' || p.teamId === team) &&
        (owner === 'All' || r.ownerId === owner) &&
        (severity === 'All' || r.blocker!.severity === severity) &&
        `${p.name} ${c.name} ${r.summary} ${r.blocker!.description}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    })
    .sort((a, b) => {
      const priority = { Critical: 0, High: 1, Medium: 2 }
      return sort === 'updated'
        ? b.updatedAt.localeCompare(a.updatedAt)
        : priority[a.blocker!.severity] - priority[b.blocker!.severity] ||
            a.summary.localeCompare(b.summary)
    })
  return (
    <div className="page blockers-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">MAKE THE NEXT MOVE</div>
          <h1>
            Infrastructure blockers<span className="heading-dot">.</span>
          </h1>
          <p>Missing resources and permissions that are still pending consent.</p>
        </div>
        <span className="blocker-heading-count">
          <CircleAlert size={17} />
          {records.length} open gaps
        </span>
      </div>
      <div className="blocker-summary">
        {(['Critical', 'High', 'Medium'] as const).map((s) => (
          <button
            key={s}
            className={`blocker-summary-item ${s.toLowerCase()} ${severity === s ? 'active' : ''}`}
            onClick={() => setFilter('severity', severity === s ? 'All' : s)}
          >
            <ShieldAlert size={19} />
            <div>
              <strong>{records.filter((r) => r.blocker!.severity === s).length}</strong>
              <span>{s} severity</span>
            </div>
            <ChevronRight size={16} />
          </button>
        ))}
        <div className="blocker-summary-note">
          <span className="eyebrow">SHARED OWNERSHIP</span>
          <strong>
            {ownerTeams} infrastructure team{ownerTeams === 1 ? '' : 's'}
          </strong>
          <span>Working to unblock {new Set(records.map((r) => r.projectId)).size} projects.</span>
        </div>
      </div>
      <section className="panel blockers-panel">
        <div className="matrix-toolbar">
          <label className="search-field">
            <Search size={16} />
            <input
              aria-label="Search blockers"
              placeholder="Search gaps…"
              value={search}
              onChange={(e) => setFilter('search', e.target.value)}
            />
          </label>
          <select
            className="filter-select"
            aria-label="Blocker project filter"
            value={projectFilter}
            onChange={(e) => setFilter('project', e.target.value)}
          >
            <option value="All">All projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select
            className="filter-select"
            aria-label="Blocker component filter"
            value={componentFilter}
            onChange={(e) => setFilter('component', e.target.value)}
          >
            <option value="All">All components</option>
            {components.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            className="filter-select"
            aria-label="Blocker severity filter"
            value={severity}
            onChange={(e) => setFilter('severity', e.target.value)}
          >
            <option value="All">All severities</option>
            {['Critical', 'High', 'Medium'].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="blockers-secondary-filters">
          <select
            className="filter-select"
            aria-label="Blocker owner filter"
            value={owner}
            onChange={(e) => setFilter('owner', e.target.value)}
          >
            <option value="All">All owners</option>
            {owners.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
          <select
            className="filter-select"
            aria-label="Blocker team filter"
            value={team}
            onChange={(e) => setFilter('team', e.target.value)}
          >
            <option value="All">All application teams</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <span className="filter-result">
            {filtered.length} of {records.length} blockers
          </span>
          {params.size > 0 && (
            <button className="reset-button" onClick={() => setParams({})}>
              <RotateCcw size={12} />
              Clear filters
            </button>
          )}
          <label className="sort-control">
            <ArrowUpDown size={13} />
            <select
              aria-label="Sort blockers"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="severity">Highest severity</option>
              <option value="updated">Recently updated</option>
            </select>
          </label>
        </div>
        {filtered.length === 0 ? (
          <EmptyState reset={() => setParams({})} text="No active blockers match this selection." />
        ) : (
          <div className="data-table-scroll blockers-table-scroll">
            <table className="data-table blockers-table">
              <thead>
                <tr>
                  <th>SEVERITY</th>
                  <th>PROJECT / ENV</th>
                  <th>COMPONENT</th>
                  <th>DETAIL</th>
                  <th>OWNER</th>
                  <th>UPDATED</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((record) => {
                  const project = projects.find((p) => p.id === record.projectId)!
                  const component = components.find((c) => c.id === record.componentId)!
                  const blocker = record.blocker!
                  return (
                    <tr
                      key={record.id}
                      tabIndex={0}
                      onClick={() => openDrawer(record)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          openDrawer(record)
                        }
                      }}
                      aria-label={`Inspect ${record.summary} for ${project.name} ${component.name} ${record.environment}`}
                    >
                      <td>
                        <span className={`severity ${blocker.severity.toLowerCase()}`}>
                          <span />
                          {blocker.severity}
                        </span>
                      </td>
                      <td>
                        <div className="project-inline">
                          <ProjectAvatar project={project} small />
                          <span>
                            <strong>{project.name}</strong>
                            <small>
                              {teamName(project.teamId)}
                              <EnvBadge environment={record.environment} />
                            </small>
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="blocker-component">
                          <ComponentIcon component={component} size={15} />
                          {component.name}
                        </span>
                      </td>
                      <td className="blocker-description">
                        <span title={blocker.description}>{blocker.description}</span>
                      </td>
                      <td className="blocker-owner">{ownerName(record.ownerId)}</td>
                      <td className="muted-text">{shortDate(record.updatedAt)}</td>
                      <td>
                        <ChevronRight size={15} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="table-footer">
          <span>Click a row to see the recorded inventory.</span>
          <span>Inventory dated Oct 12, 2026</span>
        </div>
      </section>
    </div>
  )
}
