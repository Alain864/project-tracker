export type Environment = 'DEV' | 'TEST' | 'PREPROD' | 'PROD'
export type EnvironmentFilter = Environment | 'All'
export type Status = 'Ready' | 'In Progress' | 'Blocked' | 'Not Started' | 'N/A'
export type Severity = 'Critical' | 'High' | 'Medium'
export interface Team {
  id: string
  name: string
}
export interface Owner {
  id: string
  name: string
}
export interface Project {
  id: string
  name: string
  initials: string
  description: string
  teamId: string
  ownerId: string
  color: string
  inventoryRecorded: boolean
}
export interface InfrastructureComponent {
  id: string
  name: string
  shortName: string
  group: string
  description: string
}
export interface Blocker {
  id: string
  description: string
  severity: Severity
  createdAt: string
  ticket?: string
}
export interface InventoryItem {
  label: string
  deprecated?: boolean
}
export interface TeamAccess {
  name: string
  role: string
  members?: string
}
export interface PermissionGrant {
  scope: string
  state: 'Granted' | 'Pending'
  tenant?: string
}
export interface RoleAssignment {
  section: string
  name: string
  id?: string
  type: string
  role: string
}
export type InventoryDetail =
  | { kind: 'text'; value: string }
  | { kind: 'list'; items: InventoryItem[] }
  | { kind: 'teams'; rows: TeamAccess[] }
  | { kind: 'permissions'; principal?: string; rows: PermissionGrant[] }
  | { kind: 'roles'; rows: RoleAssignment[] }
export interface ComponentReadiness {
  id: string
  projectId: string
  componentId: string
  environment: Environment
  status: Status
  ownerId: string
  summary: string
  detail: InventoryDetail | null
  blocker?: Blocker
  updatedAt: string
  resource: string
}
