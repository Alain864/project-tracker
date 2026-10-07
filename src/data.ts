import type {
  InfrastructureComponent,
  Project,
  ComponentReadiness,
  Status,
  Environment,
  EnvironmentFilter,
  Team,
  Owner,
} from './types'
export const environments: Environment[] = ['DEV', 'QA', 'PROD']
export const statuses: Status[] = ['Ready', 'In Progress', 'Blocked', 'Not Started', 'N/A']
const checks = (rows: [string, string][]) => rows.map(([category, label]) => ({ category, label }))
export const components: InfrastructureComponent[] = [
  {
    id: 'postgres',
    name: 'PostgreSQL Databases',
    shortName: 'Postgres',
    group: 'Data & AI',
    description: 'Managed relational databases, access, and application connectivity.',
    checks: checks([
      ['Provisioning', 'Database provisioned'],
      ['Configuration', 'Database and application user configured'],
      ['Networking', 'Private endpoint and network connectivity available'],
      ['Secrets', 'Database credentials available in Key Vault'],
      ['Validation', 'Application connectivity validated'],
    ]),
  },
  {
    id: 'pgvector',
    name: 'pgvector',
    shortName: 'pgvector',
    group: 'Data & AI',
    description: 'Vector search extension and workload validation in PostgreSQL.',
    checks: checks([
      ['Requirements', 'Vector extension requirement confirmed'],
      ['Provisioning', 'pgvector extension enabled'],
      ['Configuration', 'Correct database and vector indexes configured'],
      ['Validation', 'Application similarity search validated'],
    ]),
  },
  {
    id: 'redis',
    name: 'Redis',
    shortName: 'Redis',
    group: 'Data & AI',
    description: 'Application caching with secure endpoints and validated connectivity.',
    checks: checks([
      ['Provisioning', 'Redis instance created'],
      ['Configuration', 'Required configuration completed'],
      ['Networking', 'Private endpoint available'],
      ['Networking', 'Application connectivity established'],
      ['Secrets', 'Credentials generated'],
      ['Secrets', 'Secret available in Key Vault'],
      ['Validation', 'Application connectivity test passed'],
    ]),
  },
  {
    id: 'langfuse',
    name: 'Langfuse',
    shortName: 'Langfuse',
    group: 'Data & AI',
    description: 'LLM tracing, evaluation, and observability integration.',
    checks: checks([
      ['Provisioning', 'Langfuse project configured'],
      ['Secrets', 'API credentials generated'],
      ['Secrets', 'Secrets available to application'],
      ['Configuration', 'Application tracing integration configured'],
      ['Validation', 'Trace ingestion and connectivity validated'],
    ]),
  },
  {
    id: 'databricks',
    name: 'Databricks Schemas',
    shortName: 'Databricks',
    group: 'Data & AI',
    description: 'Governed data schemas and workload access in Unity Catalog.',
    checks: checks([
      ['Provisioning', 'Schema created in the correct catalog'],
      ['Configuration', 'Schema permissions configured'],
      ['Identity', 'Required workload identities granted access'],
      ['Validation', 'Application and workload access validated'],
    ]),
  },
  {
    id: 'openshift',
    name: 'OpenShift',
    shortName: 'OpenShift',
    group: 'Platform',
    description: 'Application namespaces, resource quotas, and deployment readiness.',
    checks: checks([
      ['Provisioning', 'Namespace created'],
      ['Configuration', 'Resource configuration completed'],
      ['Access', 'Service account and RBAC configured'],
      ['Configuration', 'Resource quotas and limits configured'],
      ['Validation', 'Application deployment validated'],
    ]),
  },
  {
    id: 'argocd',
    name: 'ArgoCD',
    shortName: 'ArgoCD',
    group: 'Platform',
    description: 'GitOps application configuration, synchronization, and health.',
    checks: checks([
      ['Provisioning', 'ArgoCD application configured'],
      ['Configuration', 'GitHub repository connected'],
      ['Configuration', 'Target cluster and namespace configured'],
      ['Validation', 'Application sync successful'],
      ['Validation', 'Application health checks passing'],
    ]),
  },
  {
    id: 'github-repo',
    name: 'GitHub Repository',
    shortName: 'GH Repo',
    group: 'GitHub',
    description: 'Source repositories with team permissions and protected branches.',
    checks: checks([
      ['Provisioning', 'Repository created'],
      ['Access', 'Required teams granted access'],
      ['Configuration', 'Branch strategy and protection rules configured'],
      ['Configuration', 'Required workflow and CODEOWNERS configuration present'],
    ]),
  },
  {
    id: 'github-teams',
    name: 'GitHub Teams',
    shortName: 'GH Teams',
    group: 'GitHub',
    description: 'Team membership and repository permission assignments.',
    checks: checks([
      ['Provisioning', 'Required GitHub team exists'],
      ['Access', 'Members and access levels configured'],
      ['Access', 'Repository permissions assigned'],
    ]),
  },
  {
    id: 'nesgen',
    name: 'NESGen Secrets',
    shortName: 'NESGen',
    group: 'Secrets & Security',
    description: 'Application secret generation, references, and access validation.',
    checks: checks([
      ['Requirements', 'Required application secrets identified'],
      ['Provisioning', 'Secrets created in NESGen'],
      ['Configuration', 'Application secret references configured'],
      ['Validation', 'Secret access and rotation policy validated'],
    ]),
  },
  {
    id: 'keyvault',
    name: 'Key Vaults',
    shortName: 'Key Vaults',
    group: 'Secrets & Security',
    description: 'Secure secret storage and workload identity access.',
    checks: checks([
      ['Provisioning', 'Key Vault available'],
      ['Secrets', 'Required secrets created'],
      ['Access', 'Workload identity access policy configured'],
      ['Validation', 'Application secret retrieval validated'],
    ]),
  },
  {
    id: 'spns',
    name: 'SPNs',
    shortName: 'SPNs',
    group: 'Identity',
    description: 'Service principal identities and resource permissions.',
    checks: checks([
      ['Provisioning', 'Service principal created'],
      ['Access', 'Required resource permissions configured'],
      ['Secrets', 'Credentials or certificate configured'],
      ['Validation', 'Service principal access validated'],
    ]),
  },
  {
    id: 'spns-graph',
    name: 'SPNs Graph',
    shortName: 'SPNs Graph',
    group: 'Identity',
    description: 'Microsoft Graph permissions, admin consent, and API access.',
    checks: checks([
      ['Provisioning', 'Graph service principal available'],
      ['Access', 'Required Microsoft Graph permissions configured'],
      ['Approval', 'Admin consent and security approval completed'],
      ['Validation', 'Microsoft Graph API access validated'],
    ]),
  },
  {
    id: 'backend-spns',
    name: 'Backend SPNs',
    shortName: 'BE SPNs',
    group: 'Identity',
    description: 'Backend application identities and API integration.',
    checks: checks([
      ['Provisioning', 'Backend service principal created'],
      ['Access', 'Required API permissions assigned'],
      ['Secrets', 'Backend credentials configured'],
      ['Validation', 'Backend identity integration validated'],
    ]),
  },
  {
    id: 'frontend-spns',
    name: 'Frontend SPNs (FE-SPNs)',
    shortName: 'FE SPNs',
    group: 'Identity',
    description: 'Frontend authentication, redirect URIs, and app registration.',
    checks: checks([
      ['Provisioning', 'Frontend service principal created'],
      ['Access', 'Required permissions configured'],
      ['Configuration', 'Redirect URIs and application configuration completed'],
      ['Validation', 'Frontend authentication flow validated'],
    ]),
  },
  {
    id: 'aad-groups',
    name: 'AAD Security Groups',
    shortName: 'AAD Groups',
    group: 'Access',
    description: 'Security group membership and application/resource access.',
    checks: checks([
      ['Provisioning', 'AAD security group created'],
      ['Access', 'Required group membership configured'],
      ['Access', 'Application and resource access assigned'],
    ]),
  },
  {
    id: 'persona-groups',
    name: 'Persona Groups',
    shortName: 'Personas',
    group: 'Access',
    description: 'Persona-based membership and application role mappings.',
    checks: checks([
      ['Requirements', 'Required application personas identified'],
      ['Provisioning', 'Persona groups created'],
      ['Access', 'Group membership configured'],
      ['Configuration', 'Application roles and access mapped'],
      ['Validation', 'Persona access validated'],
    ]),
  },
]
export const groups = [...new Set(components.map((c) => c.group))]
export const teams: Team[] = [
  { id: 'commerce', name: 'Commerce' },
  { id: 'experience', name: 'Digital Experience' },
  { id: 'data', name: 'Data & AI' },
  { id: 'core', name: 'Core Services' },
  { id: 'operations', name: 'Operations' },
]
export const owners: Owner[] = [
  { id: 'platform', name: 'Platform Team' },
  { id: 'data-platform', name: 'Data Platform' },
  { id: 'identity', name: 'Identity & Access' },
  { id: 'security', name: 'Security Engineering' },
  { id: 'devex', name: 'Developer Experience' },
]
const seeds: [string, string, string][] = [
  ['Payments', 'commerce', 'Secure payment orchestration and transaction processing.'],
  ['Orders', 'commerce', 'Order lifecycle services for the commerce platform.'],
  ['Customer Portal', 'experience', 'Self-service account management and customer experience.'],
  ['Reporting', 'data', 'Operational reporting and business intelligence.'],
  ['Billing', 'commerce', 'Subscription billing, invoicing, and reconciliation.'],
  ['Identity', 'core', 'Authentication and identity federation services.'],
  ['Notifications', 'core', 'Email, push, and event notification delivery.'],
  ['Analytics', 'data', 'Product analytics and governed data insights.'],
  ['Document Service', 'core', 'Document storage, generation, and processing.'],
  ['Integration Gateway', 'core', 'Secure API integration with external systems.'],
  ['Search Service', 'experience', 'Product and content search across applications.'],
  ['AI Assistant', 'data', 'Internal AI assistant with retrieval and grounded responses.'],
  ['Data Processing', 'data', 'Batch and streaming data transformation workloads.'],
  ['Customer API', 'experience', 'Unified customer profile and account API.'],
  ['Operations Portal', 'operations', 'Tools and visibility for daily platform operations.'],
  ['Inventory', 'commerce', 'Real-time inventory availability and reservations.'],
  ['Recommendations', 'data', 'Personalized product recommendations and ranking.'],
  ['Audit Service', 'core', 'Centralized audit event capture and compliance reporting.'],
  ['Partner Connect', 'experience', 'Partner onboarding and integration management.'],
  ['Fraud Detection', 'data', 'Transaction risk scoring and fraud detection.'],
  ['Fulfillment', 'commerce', 'Warehouse fulfillment and shipment orchestration.'],
  ['Knowledge Hub', 'experience', 'Internal documentation and semantic knowledge search.'],
  ['Pricing Engine', 'commerce', 'Pricing rules, promotions, and offer calculation.'],
  ['Workforce Portal', 'operations', 'Employee services and workforce administration.'],
  ['Telemetry', 'operations', 'Application telemetry ingestion and observability.'],
  ['Asset Management', 'operations', 'Lifecycle management for enterprise assets.'],
  ['Consent Service', 'core', 'Customer privacy and consent preference management.'],
  ['Data Catalog', 'data', 'Discovery and governance for enterprise data assets.'],
]
const colors = ['sage', 'blue', 'purple', 'amber', 'rose']
export const projects: Project[] = seeds.map(([name, teamId, description], i) => ({
  id: name.toLowerCase().replaceAll(' ', '-'),
  name,
  initials: name
    .split(' ')
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .padEnd(2, name[1].toUpperCase()),
  description,
  teamId,
  ownerId: i % 5 === 3 ? 'data-platform' : 'platform',
  color: colors[i % colors.length],
}))
export const teamName = (id: string) => teams.find((t) => t.id === id)?.name ?? id
export const ownerName = (id: string) => owners.find((o) => o.id === id)?.name ?? id
const blockerText: Record<string, string> = {
  postgres:
    'Database firewall policy is preventing application access from the OpenShift namespace.',
  pgvector:
    'The required pgvector version has not been approved for the managed PostgreSQL instance.',
  redis:
    'Application cannot currently connect to the Redis instance. The namespace egress policy needs to allow the private endpoint.',
  langfuse:
    'Trace ingestion fails because the application API credentials have not been added to Key Vault.',
  databricks: 'Workload identity is missing USE SCHEMA permissions in the target Unity Catalog.',
  openshift:
    'Namespace resource quota is below the requested memory allocation. Platform capacity approval is pending.',
  argocd: 'Application sync is failing due to an unresolved destination namespace access policy.',
  'github-repo':
    'Branch protection and required CI checks are awaiting repository administrator configuration.',
  'github-teams':
    'The application team has not been granted write access to the GitHub repository.',
  nesgen: 'Secret generation is pending approval for the requested application credential scope.',
  keyvault: 'Application identity does not have permission to retrieve secrets from the Key Vault.',
  spns: 'Service principal role assignment is awaiting security approval for the target resource.',
  'spns-graph':
    'Microsoft Graph admin consent is pending for the required application permissions.',
  'backend-spns':
    'Backend token validation is failing because the expected API audience is not configured.',
  'frontend-spns':
    'The environment redirect URI is missing from the frontend application registration.',
  'aad-groups':
    'Required members have not been added to the AAD Security Group. Access review is pending.',
  'persona-groups':
    'Application role mapping is incomplete for the Support and Administrator persona groups.',
}
const componentOwner = (c: InfrastructureComponent) =>
  c.group === 'Identity' || c.group === 'Access'
    ? 'identity'
    : c.group === 'GitHub'
      ? 'devex'
      : c.group === 'Secrets & Security'
        ? 'security'
        : c.id === 'databricks' || c.id === 'pgvector'
          ? 'data-platform'
          : 'platform'
function required(project: Project, pi: number, component: InfrastructureComponent) {
  if (component.id === 'pgvector')
    return project.teamId === 'data' || ['search-service', 'knowledge-hub'].includes(project.id)
  if (component.id === 'langfuse')
    return [
      'ai-assistant',
      'recommendations',
      'fraud-detection',
      'knowledge-hub',
      'analytics',
      'search-service',
    ].includes(project.id)
  if (component.id === 'databricks')
    return (
      project.teamId === 'data' || ['reporting', 'telemetry', 'audit-service'].includes(project.id)
    )
  if (component.id === 'frontend-spns')
    return !['core', 'data'].includes(project.teamId) || project.id === 'ai-assistant'
  if (component.id === 'spns-graph')
    return pi % 3 === 1 || ['identity', 'operations-portal', 'ai-assistant'].includes(project.id)
  if (component.id === 'redis') return pi % 7 !== 6
  if (component.id === 'persona-groups') return pi % 5 !== 3
  return true
}
export const readiness: ComponentReadiness[] = projects.flatMap((project, pi) =>
  environments.flatMap((environment, ei) =>
    components.map((component, ci) => {
      const hash = (pi * 37 + ci * 19 + ei * 11 + pi * ci * 7) % 100
      let status: Status = !required(project, pi, component)
        ? 'N/A'
        : hash < 67
          ? 'Ready'
          : hash < 84
            ? 'In Progress'
            : hash < 94
              ? 'Blocked'
              : 'Not Started'
      // A few fully ready projects make portfolio completion meaningful; Orders Redis is the reference blocker.
      if ([0, 7, 17].includes(pi) && status !== 'N/A') status = 'Ready'
      if (pi === 1 && component.id === 'redis')
        status = environment === 'PROD' ? 'In Progress' : 'Blocked'
      if (pi === 1 && component.id === 'spns-graph' && environment === 'DEV') status = 'In Progress'
      const doneCount =
        status === 'Ready'
          ? component.checks.length
          : status === 'N/A' || status === 'Not Started'
            ? 0
            : Math.max(1, Math.floor(component.checks.length * (status === 'Blocked' ? 0.65 : 0.5)))
      const checkRows = component.checks.map((check, k) => ({
        id: `${component.id}-${k}`,
        ...check,
        complete: k < doneCount,
      }))
      if (pi === 1 && component.id === 'redis' && status === 'Blocked')
        checkRows.forEach((c, k) => {
          c.complete = ![3, 6].includes(k)
        })
      const day = 7 - ((pi + ci + ei) % 6)
      const id = `${project.id}:${environment}:${component.id}`
      return {
        id,
        projectId: project.id,
        componentId: component.id,
        environment,
        status,
        ownerId: componentOwner(component),
        checks: checkRows,
        updatedAt: `2026-10-${String(day).padStart(2, '0')}T${String(9 + ((pi + ci) % 9)).padStart(2, '0')}:00:00`,
        resource: `${project.id}-${environment.toLowerCase()}-${component.id}`,
        blocker:
          status === 'Blocked'
            ? {
                id: `blocker-${id}`,
                description: blockerText[component.id],
                severity: environment === 'PROD' ? 'Critical' : ci % 3 === 0 ? 'High' : 'Medium',
                ticket:
                  pi === 1 && component.id === 'redis'
                    ? 'INFRA-2841'
                    : `INFRA-${2800 + pi * 17 + ci * 3 + ei}`,
                createdAt: `2026-09-${String(22 + ((pi + ci) % 9)).padStart(2, '0')}T09:00:00`,
              }
            : undefined,
      } satisfies ComponentReadiness
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
  Math.floor((new Date('2026-10-07T12:00:00').getTime() - new Date(date).getTime()) / 86400000)

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
