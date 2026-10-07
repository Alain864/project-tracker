export type Environment = 'DEV' | 'QA' | 'PROD'
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
}
export interface InfrastructureComponent {
  id: string
  name: string
  shortName: string
  group: string
  description: string
  checks: { category: string; label: string }[]
}
export interface ReadinessCheck {
  id: string
  category: string
  label: string
  complete: boolean
}
export interface Blocker {
  id: string
  description: string
  severity: Severity
  ticket: string
  createdAt: string
}
export interface ComponentReadiness {
  id: string
  projectId: string
  componentId: string
  environment: Environment
  status: Status
  ownerId: string
  checks: ReadinessCheck[]
  blocker?: Blocker
  updatedAt: string
  resource: string
}
