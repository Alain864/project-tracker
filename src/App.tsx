import { useState, useEffect, useRef } from 'react'
import { NavLink, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderKanban,
  Boxes,
  CircleAlert,
  ChevronDown,
  ChevronRight,
  ArrowUpRight,
  X,
  Check,
  CircleHelp,
  PanelLeftClose,
  PanelLeftOpen,
  Command,
  ShieldCheck,
} from 'lucide-react'
import type { ComponentReadiness, EnvironmentFilter } from './types'
import { components, projects, readiness, ownerName, teamName, fullDate } from './data'
import { Badge, ComponentIcon, StatusIcon, statusLabel } from './ui'
import { InventoryDetail } from './InventoryDetail'
import { Overview } from './Overview'
import { ProjectsView, ProjectDetail } from './Projects'
import { ComponentsView, ComponentDetail } from './Components'
import { BlockersView } from './Blockers'
import { AppContext } from './context'
function storedEnvironment(): EnvironmentFilter {
  try {
    const val = localStorage.getItem('readiness-environment')
    const stored = val === 'QA' ? 'TEST' : val
    if (['DEV', 'TEST', 'PREPROD', 'PROD', 'All'].includes(stored ?? ''))
      return stored as EnvironmentFilter
  } catch {}
  return 'DEV'
}
export default function App() {
  const [environment, setEnv] = useState<EnvironmentFilter>(storedEnvironment)
  const [drawer, setDrawer] = useState<ComponentReadiness | null>(null)
  const [guide, setGuide] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const setEnvironment = (value: EnvironmentFilter) => {
    setEnv(value)
    try {
      localStorage.setItem('readiness-environment', value)
    } catch {}
  }
  useEffect(() => {
    setDrawer(null)
    setSidebarOpen(false)
    window.scrollTo(0, 0)
  }, [location.pathname])
  const section = location.pathname.startsWith('/projects')
    ? 'Projects'
    : location.pathname.startsWith('/components')
      ? 'Components'
      : location.pathname.startsWith('/blockers')
        ? 'Blockers'
        : 'Overview'
  const blockerCount = readiness.filter(
    (r) => r.status === 'Blocked' && (environment === 'All' || r.environment === environment),
  ).length
  return (
    <AppContext.Provider
      value={{ environment, setEnvironment, openDrawer: setDrawer, selectedRecordId: drawer?.id }}
    >
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      {sidebarOpen && (
        <button
          className="sidebar-scrim"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside className={`sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
        <NavLink to="/" className="brand">
          AIOps
        </NavLink>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="main-nav" aria-label="Primary navigation">
          <NavLink to="/" end>
            <LayoutDashboard size={18} />
            Overview
          </NavLink>
          <NavLink to="/projects">
            <FolderKanban size={18} />
            Projects<span className="nav-count">{projects.length}</span>
          </NavLink>
          <NavLink to="/components">
            <Boxes size={18} />
            Components<span className="nav-count">{components.length}</span>
          </NavLink>
          <NavLink to="/blockers">
            <CircleAlert size={18} />
            Blockers<span className="nav-count blocker">{blockerCount}</span>
          </NavLink>
        </nav>
        <div className="sidebar-bottom">
          <div className="workspace-card">
            <span className="workspace-card-icon">
              <ShieldCheck size={18} />
            </span>
            <strong>
              One shared view.
              <br />
              Every environment.
            </strong>
            <p>
              Infrastructure readiness,
              <br />
              from provision to production.
            </p>
            <button onClick={() => setGuide(true)}>
              Explore the readiness guide
              <ArrowUpRight size={14} />
            </button>
          </div>
          <button className="help-button" onClick={() => setGuide(true)}>
            <CircleHelp size={17} />
            Readiness guide
          </button>
        </div>
      </aside>
      <div className="app-body">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-toggle"
              aria-label="Open navigation"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <PanelLeftClose size={19} /> : <PanelLeftOpen size={19} />}
            </button>
            <span>Workspace</span>
            <ChevronRight size={13} />
            <strong>{section}</strong>
          </div>
          <div className="topbar-right">
            <span className="demo-label">
              <span />
              Demo workspace
            </span>
            <span className="topbar-divider" />
            <label className="environment-picker">
              <span className={`env-dot ${environment.toLowerCase()}`} />
              <select
                aria-label="Environment"
                value={environment}
                onChange={(e) => setEnvironment(e.target.value as EnvironmentFilter)}
              >
                <option value="All">All environments</option>
                <option value="DEV">Development</option>
                <option value="TEST">Test</option>
                <option value="PREPROD">Pre-production</option>
                <option value="PROD">Production</option>
              </select>
              <ChevronDown size={14} />
            </label>
          </div>
        </header>
        <main id="main-content">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/projects" element={<ProjectsView />} />
            <Route path="/projects/:projectId" element={<ProjectDetail />} />
            <Route path="/components" element={<ComponentsView />} />
            <Route path="/components/:componentId" element={<ComponentDetail />} />
            <Route path="/blockers" element={<BlockersView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer className="app-footer">
          <span>
            <span className="live-dot" />
            Local prototype · Mock data
          </span>
          <span>
            Infrastructure Readiness Dashboard <span className="footer-separator">/</span> Inventory
            October 2026
          </span>
        </footer>
      </div>
      {drawer && (
        <ReadinessDrawer
          record={drawer}
          close={() => setDrawer(null)}
          viewProject={() => {
            setEnvironment(drawer.environment)
            navigate(`/projects/${drawer.projectId}`, { state: { matrixEnvironment: environment } })
            setDrawer(null)
          }}
          viewComponent={() => {
            setEnvironment(drawer.environment)
            navigate(`/components/${drawer.componentId}`)
            setDrawer(null)
          }}
        />
      )}
      {guide && <Guide close={() => setGuide(false)} />}
    </AppContext.Provider>
  )
}
function useDialog(close: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  const closeRef = useRef(close)
  closeRef.current = close
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const dialog = ref.current
    dialog?.querySelector<HTMLElement>('button')?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current()
      if (event.key === 'Tab' && dialog) {
        const elements = [
          ...dialog.querySelectorAll<HTMLElement>('button,a[href],input,select,[tabindex="0"]'),
        ].filter((el) => !el.hasAttribute('disabled'))
        const first = elements[0],
          last = elements[elements.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = overflow
      document.removeEventListener('keydown', onKey)
      previous?.focus()
    }
  }, [])
  return ref
}
function ReadinessDrawer({
  record,
  close,
  viewProject,
  viewComponent,
}: {
  record: ComponentReadiness
  close: () => void
  viewProject: () => void
  viewComponent: () => void
}) {
  const ref = useDialog(close)
  const project = projects.find((p) => p.id === record.projectId)!
  const component = components.find((c) => c.id === record.componentId)!
  return (
    <div className="modal-layer">
      <button className="drawer-backdrop" aria-label="Close readiness detail" onClick={close} />
      <div
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        ref={ref}
      >
        <div className="drawer-top">
          <span>COMPONENT READINESS</span>
          <button className="icon-button" aria-label="Close drawer" onClick={close}>
            <X size={20} />
          </button>
        </div>
        <div className="drawer-heading">
          <button className="eyebrow project-link" onClick={viewProject}>
            {project.name}
            <ArrowUpRight size={13} />
          </button>
          <h2 id="drawer-title">
            <ComponentIcon component={component} size={28} />
            {component.name}
          </h2>
          <div className="drawer-meta">
            <span className={`env-badge ${record.environment.toLowerCase()}`}>
              {record.environment}
            </span>
            <span>{teamName(project.teamId)}</span>
            <span>·</span>
            <span>{record.summary}</span>
          </div>
        </div>
        <div className="drawer-content">
          <div className="drawer-status">
            <span className="eyebrow">CURRENT STATUS</span>
            <Badge status={record.status} />
          </div>
          {record.status === 'N/A' ? (
            <div className="na-notice">
              <h3>Not required</h3>
              <p>
                {project.name} does not use {component.name} in {record.environment}. It is excluded
                from the readiness calculation.
              </p>
            </div>
          ) : record.detail ? (
            <InventoryDetail detail={record.detail} />
          ) : (
            <div className="na-notice">
              <h3>{record.summary}</h3>
              <p>
                {project.inventoryRecorded
                  ? `No ${component.name} value was recorded for ${record.environment}.`
                  : `${project.name} does not have inventory yet.`}
              </p>
            </div>
          )}
          {record.blocker && (
            <div className="blocker-callout">
              <div>
                <CircleAlert size={17} />
                <h3>{record.status === 'Blocked' ? 'Missing' : 'Pending'}</h3>
                <span className={`severity ${record.blocker.severity.toLowerCase()}`}>
                  {record.blocker.severity}
                </span>
              </div>
              <p>{record.blocker.description}</p>
            </div>
          )}
          <dl className="drawer-details">
            <div>
              <dt>Infrastructure owner</dt>
              <dd>{ownerName(record.ownerId)}</dd>
            </div>
            <div>
              <dt>Inventory date</dt>
              <dd>{fullDate(record.updatedAt)}</dd>
            </div>
            <div>
              <dt>Summary</dt>
              <dd className="resource-name">{record.summary}</dd>
            </div>
          </dl>
          <p className="drawer-note">{component.description}</p>
        </div>
        <div className="drawer-footer">
          <button className="button" onClick={viewComponent}>
            View component
            <ArrowUpRight size={15} />
          </button>
          <button className="button primary" onClick={viewProject}>
            View project
            <ArrowUpRight size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
function Guide({ close }: { close: () => void }) {
  const ref = useDialog(close)
  return (
    <div className="modal-layer">
      <button className="drawer-backdrop" aria-label="Close guide" onClick={close} />
      <div
        className="guide-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-title"
        ref={ref}
      >
        <button className="icon-button guide-close" aria-label="Close guide" onClick={close}>
          <X size={20} />
        </button>
        <h2 id="guide-title">Readiness, at a glance.</h2>
        <p>
          Start with a project or a component. Every cell opens the resource name, group list, or
          role table recorded for that environment.
        </p>
        <div className="guide-statuses">
          {(['Ready', 'In Progress', 'Blocked', 'Not Started', 'N/A'] as const).map((status, i) => (
            <div key={status}>
              <StatusIcon status={status} />
              <strong>{statusLabel[status]}</strong>
              <span>
                {
                  [
                    'A resource, group, or permission set is recorded.',
                    'Graph consent is still pending.',
                    'The inventory marks this component missing.',
                    'Nothing has been recorded for this cell yet.',
                    'This component is not required by the project.',
                  ][i]
                }
              </span>
            </div>
          ))}
        </div>
        <h3>How readiness is calculated</h3>
        <p>
          Readiness is the share of required component records marked Ready. N/A records are
          excluded. Pending consent and missing values do not count as ready. Environments are DEV,
          TEST, PREPROD, and PROD.
        </p>
        <div className="guide-tip">
          <Command size={17} />
          <span>
            Click any matrix cell to inspect its inventory. Press <kbd>Esc</kbd> to close the drawer
            and return to your place.
          </span>
        </div>
        <p className="guide-demo">
          Four projects still have no inventory. Their cells stay “Not recorded” until that data is
          added.
        </p>
        <button className="button primary" onClick={close}>
          Got it
          <Check size={16} />
        </button>
      </div>
    </div>
  )
}
