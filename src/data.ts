import type {
  InfrastructureComponent,
  Project,
  ComponentReadiness,
  Status,
  Environment,
  EnvironmentFilter,
  Team,
  Owner,
  InventoryDetail,
  Severity,
} from './types'
import inventoryFile from './inventory.json'

export const environments: Environment[] = ['DEV', 'TEST', 'PREPROD', 'PROD']
export const statuses: Status[] = ['Ready', 'In Progress', 'Blocked', 'Not Started', 'N/A']
export const inventoryDate = '2026-10-12T09:00:00'

export const components: InfrastructureComponent[] = [
  {
    id: 'vm',
    name: 'Virtual machines',
    shortName: 'VM',
    group: 'Platform',
    description: 'Host name for the project virtual machine, when one is required.',
  },
  {
    id: 'postgres',
    name: 'PostgreSQL',
    shortName: 'Postgres',
    group: 'Data & AI',
    description: 'Database name provisioned for the project.',
  },
  {
    id: 'pgvector',
    name: 'pgvector',
    shortName: 'pgvector',
    group: 'Data & AI',
    description: 'Whether the pgvector extension is enabled.',
  },
  {
    id: 'redis',
    name: 'Redis',
    shortName: 'Redis',
    group: 'Data & AI',
    description: 'Whether a Redis instance is in place.',
  },
  {
    id: 'langfuse',
    name: 'Langfuse',
    shortName: 'Langfuse',
    group: 'Data & AI',
    description: 'Langfuse project used for tracing.',
  },
  {
    id: 'databricks',
    name: 'Databricks groups',
    shortName: 'DBX',
    group: 'Data & AI',
    description: 'Databricks access groups recorded for the project.',
  },
  {
    id: 'openshift',
    name: 'OpenShift',
    shortName: 'OpenShift',
    group: 'Platform',
    description: 'OpenShift namespace for the environment.',
  },
  {
    id: 'argocd',
    name: 'ArgoCD',
    shortName: 'ArgoCD',
    group: 'Platform',
    description: 'ArgoCD application for the environment.',
  },
  {
    id: 'github-repo',
    name: 'GitHub repository',
    shortName: 'GH Repo',
    group: 'GitHub',
    description: 'Source repository name.',
  },
  {
    id: 'github-teams',
    name: 'GitHub teams',
    shortName: 'GH Teams',
    group: 'GitHub',
    description: 'Teams granted access to the repository, with role and membership.',
  },
  {
    id: 'nesgen',
    name: 'NESGen secrets',
    shortName: 'NESGen',
    group: 'Secrets & Security',
    description: 'NESGen secret names issued for the project.',
  },
  {
    id: 'keyvault',
    name: 'Key Vault',
    shortName: 'Key Vault',
    group: 'Secrets & Security',
    description: 'Key Vault that stores the project secrets.',
  },
  {
    id: 'keyvault-roles',
    name: 'Key Vault roles',
    shortName: 'KV roles',
    group: 'Secrets & Security',
    description: 'Role assignments on the Key Vault.',
  },
  {
    id: 'spns',
    name: 'Service principals',
    shortName: 'SPNs',
    group: 'Identity',
    description: 'Application service principal for the environment.',
  },
  {
    id: 'spns-graph',
    name: 'SPN Graph permissions',
    shortName: 'SPN Graph',
    group: 'Identity',
    description: 'Microsoft Graph permissions granted to the service principal.',
  },
  {
    id: 'frontend-spns',
    name: 'Frontend SPNs',
    shortName: 'FE SPNs',
    group: 'Identity',
    description: 'Frontend application registration.',
  },
  {
    id: 'fe-spn-graph',
    name: 'Frontend Graph permissions',
    shortName: 'FE Graph',
    group: 'Identity',
    description: 'Microsoft Graph permissions granted to the frontend registration.',
  },
  {
    id: 'aad-groups',
    name: 'AAD security groups',
    shortName: 'AAD groups',
    group: 'Access',
    description: 'Security groups created for the project.',
  },
  {
    id: 'persona-groups',
    name: 'Persona groups',
    shortName: 'Personas',
    group: 'Access',
    description: 'Persona groups used for application access.',
  },
]
export const groups = [...new Set(components.map((c) => c.group))]
export const teams: Team[] = [
  { id: 'aura', name: 'Aura' },
  { id: 'photon', name: 'Photon' },
  { id: 'cloud', name: 'Cloud Platform' },
]
export const owners: Owner[] = [{ id: 'aiops', name: 'AIOps team' }]

const projectMeta: Record<
  string,
  Pick<Project, 'teamId' | 'initials' | 'description' | 'color'>
> = {
  '36411-aura-brandiq': {
    teamId: 'aura',
    initials: 'BI',
    description: 'Aura brand intelligence.',
    color: 'sage',
  },
  '36519-aura-trike': {
    teamId: 'aura',
    initials: 'TR',
    description: 'Aura trike.',
    color: 'blue',
  },
  '32938-aura-order-intel': {
    teamId: 'aura',
    initials: 'OI',
    description: 'Aura order intelligence.',
    color: 'purple',
  },
  '32936-aura-reliability': {
    teamId: 'aura',
    initials: 'RE',
    description: 'Aura reliability.',
    color: 'amber',
  },
  '33155-photon': {
    teamId: 'photon',
    initials: 'PH',
    description: 'Photon. Inventory has not been recorded yet.',
    color: 'rose',
  },
  'cloud-platform-knowledge': {
    teamId: 'cloud',
    initials: 'KN',
    description: 'Cloud platform knowledge. Inventory has not been recorded yet.',
    color: 'sage',
  },
  'cloud-platform-analyzer': {
    teamId: 'cloud',
    initials: 'AN',
    description: 'Cloud platform analyzer. Inventory has not been recorded yet.',
    color: 'blue',
  },
  'cloud-platform-cost-investigator': {
    teamId: 'cloud',
    initials: 'CI',
    description: 'Cloud platform cost investigation. Inventory has not been recorded yet.',
    color: 'purple',
  },
}

interface InventoryCell {
  status: Status
  summary: string
  detail: InventoryDetail | null
  blocker: { severity: Severity; description: string } | null
}
interface InventoryProject {
  id: string
  name: string
  recorded: boolean
  cells: Record<string, Record<Environment, InventoryCell>>
}

const source = inventoryFile as { projects: InventoryProject[] }

export const projects: Project[] = source.projects.map((project) => {
  const meta = projectMeta[project.id]
  return {
    id: project.id,
    name: project.name,
    initials: meta.initials,
    description: meta.description,
    teamId: meta.teamId,
    ownerId: 'aiops',
    color: meta.color,
    inventoryRecorded: project.recorded,
  }
})

export const teamName = (id: string) => teams.find((t) => t.id === id)?.name ?? id
export const ownerName = (id: string) => owners.find((o) => o.id === id)?.name ?? id

const byId = new Map(source.projects.map((project) => [project.id, project]))

export const readiness: ComponentReadiness[] = projects.flatMap((project) =>
  environments.flatMap((environment) =>
    components.map((component) => {
      const cell = byId.get(project.id)!.cells[component.id][environment]
      const id = `${project.id}:${environment}:${component.id}`
      return {
        id,
        projectId: project.id,
        componentId: component.id,
        environment,
        status: cell.status,
        ownerId: 'aiops',
        summary: cell.summary,
        detail: cell.detail,
        updatedAt: inventoryDate,
        resource: cell.summary,
        blocker: cell.blocker
          ? {
              id: `gap-${id}`,
              description: cell.blocker.description,
              severity: cell.blocker.severity,
              createdAt: inventoryDate,
            }
          : undefined,
      }
    }),
  ),
)

export function getRecords(
  projectId?: string,
  environment: EnvironmentFilter = 'All',
  componentId?: string,
) {
  return readiness.filter(
    (r) =>
      (!projectId || r.projectId === projectId) &&
      (environment === 'All' || r.environment === environment) &&
      (!componentId || r.componentId === componentId),
  )
}
export function readinessPercent(records: ComponentReadiness[]) {
  const used = records.filter((r) => r.status !== 'N/A')
  return used.length
    ? Math.round((used.filter((r) => r.status === 'Ready').length / used.length) * 100)
    : 0
}
export function statusCounts(records: ComponentReadiness[]) {
  return Object.fromEntries(
    statuses.map((s) => [s, records.filter((r) => r.status === s).length]),
  ) as Record<Status, number>
}
export function matchesStatus(records: ComponentReadiness[], status: string) {
  return status === 'All' || records.some((r) => r.status === status)
}
export const shortDate = (date: string) =>
  new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
export const fullDate = (date: string) =>
  new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
export const ageDays = (date: string) =>
  Math.floor((new Date('2026-10-12T12:00:00').getTime() - new Date(date).getTime()) / 86400000)

export function filterMatrixRecords(
  records: ComponentReadiness[],
  componentId = 'All',
  ownerId = 'All',
) {
  return records.filter(
    (record) =>
      (componentId === 'All' || record.componentId === componentId) &&
      (ownerId === 'All' || (record.ownerId === ownerId && record.status !== 'N/A')),
  )
}
