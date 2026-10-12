import { describe, it, expect } from 'vitest'
import {
  projects,
  components,
  teams,
  owners,
  readiness,
  environments,
  readinessPercent,
  statusCounts,
  getRecords,
  matchesStatus,
  filterMatrixRecords,
} from './data'

describe('Inventory data', () => {
  it('loads the eight AI projects and the workbook components', () => {
    expect(projects.map((p) => p.name)).toEqual([
      '36411-aura-brandiq',
      '32938-aura-order-intel',
      '36519-aura-trike',
      '32936-aura-reliability',
      '33155-photon',
      'cloud-platform-knowledge',
      'cloud-platform-analyzer',
      'cloud-platform-cost-investigator',
    ])
    expect(projects.filter((p) => p.inventoryRecorded)).toHaveLength(4)
    expect(projects.filter((p) => !p.inventoryRecorded)).toHaveLength(4)
    expect(components).toHaveLength(19)
    expect(environments).toEqual(['DEV', 'TEST', 'PREPROD', 'PROD'])
    expect(readiness).toHaveLength(8 * 19 * 4)
    expect(new Set(readiness.map((r) => r.id)).size).toBe(readiness.length)
  })
  it('keeps project, component, team, and owner relationships valid', () => {
    for (const p of projects) {
      expect(teams.some((t) => t.id === p.teamId)).toBe(true)
      expect(owners.some((o) => o.id === p.ownerId)).toBe(true)
    }
    for (const r of readiness) {
      expect(projects.some((p) => p.id === r.projectId)).toBe(true)
      expect(components.some((c) => c.id === r.componentId)).toBe(true)
      expect(owners.some((o) => o.id === r.ownerId)).toBe(true)
      expect(environments).toContain(r.environment)
    }
  })
  it('turns workbook cells into statuses, lists, and tables', () => {
    const brandiq = '36411-aura-brandiq'
    expect(getRecords(brandiq, 'DEV', 'vm')[0].status).toBe('N/A')
    expect(getRecords(brandiq, 'DEV', 'postgres')[0].summary).toBe('aura_brandiq_db')
    expect(getRecords(brandiq, 'PROD', 'nesgen')[0].status).toBe('Blocked')
    expect(getRecords(brandiq, 'PROD', 'nesgen')[0].blocker?.severity).toBe('High')
    const teamsCell = getRecords(brandiq, 'DEV', 'github-teams')[0]
    expect(teamsCell.detail?.kind).toBe('teams')
    if (teamsCell.detail?.kind === 'teams') expect(teamsCell.detail.rows).toHaveLength(5)
    const roles = getRecords(brandiq, 'PREPROD', 'keyvault-roles')[0]
    expect(roles.detail?.kind).toBe('roles')
    if (roles.detail?.kind === 'roles') expect(roles.detail.rows[0].id).toBeTruthy()
    const pending = getRecords(brandiq, 'PREPROD', 'spns-graph')[0]
    expect(pending.status).toBe('In Progress')
    expect(pending.detail?.kind).toBe('permissions')
    const borrowed = getRecords(brandiq, 'DEV', 'spns-graph')[0]
    expect(borrowed.status).toBe('Blocked')
    expect(borrowed.summary).toBe('32938-aura-order-intel')
    expect(borrowed.detail?.kind).toBe('permissions')
    if (borrowed.detail?.kind === 'permissions')
      expect(borrowed.detail.principal).toContain('32938-aura-order-intel')
    expect(getRecords(brandiq, 'TEST', 'spns-graph')[0].status).toBe('Blocked')
    expect(readinessPercent(getRecords(brandiq, 'DEV'))).toBe(94)
    const groups = getRecords('32938-aura-order-intel', 'DEV', 'aad-groups')[0]
    expect(groups.detail?.kind).toBe('list')
    if (groups.detail?.kind === 'list')
      expect(groups.detail.items.some((item) => item.deprecated)).toBe(true)
    expect(getRecords('33155-photon', 'DEV', 'postgres')[0].summary).toBe('Awaiting data')
    expect(getRecords('33155-photon', 'DEV', 'postgres')[0].blocker).toBeUndefined()
  })
  it('keeps every status represented and excludes N/A from readiness', () => {
    for (const env of environments) {
      const counts = statusCounts(getRecords(undefined, env))
      for (const count of Object.values(counts)) expect(count).toBeGreaterThan(0)
    }
    const ready = readiness.find((r) => r.status === 'Ready')!
    const na = readiness.find((r) => r.status === 'N/A')!
    const pending = readiness.find((r) => r.status === 'In Progress')!
    expect(readinessPercent([ready, na])).toBe(100)
    expect(readinessPercent([ready, pending, na])).toBe(50)
    expect(readinessPercent([na])).toBe(0)
  })
  it('scopes records and matrix filters to the recorded inventory', () => {
    expect(getRecords('36411-aura-brandiq', 'DEV', 'postgres')).toHaveLength(1)
    expect(getRecords('36411-aura-brandiq', 'All', 'redis')).toHaveLength(4)
    expect(getRecords('36519-aura-trike', 'TEST')).toHaveLength(19)
    expect(getRecords(undefined, 'PROD', 'argocd')).toHaveLength(8)
    const records = getRecords('36411-aura-brandiq', 'DEV')
    expect(matchesStatus(filterMatrixRecords(records, 'nesgen', 'aiops'), 'Ready')).toBe(true)
    expect(filterMatrixRecords(records, 'vm', 'aiops')).toHaveLength(0)
    expect(filterMatrixRecords(records, 'vm', 'All')[0].status).toBe('N/A')
  })
})
