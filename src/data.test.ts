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

describe('Portfolio data integrity', () => {
  it('provides 8 AI projects and every specified infrastructure concept', () => {
    expect(projects).toHaveLength(8)
    expect(projects.map((p) => p.name)).toEqual([
      '36411-aura-brandiq',
      '36519-aura-trike',
      '32938-aura-order-intel',
      '32936-aura-reliability',
      '33155-photon',
      'cloud-platform-knowledge',
      'cloud-platform-analyzer',
      'cloud-platform-cost-investigator',
    ])
    expect(components.map((c) => c.name)).toEqual([
      'PostgreSQL Databases',
      'pgvector',
      'Redis',
      'Langfuse',
      'Databricks Schemas',
      'OpenShift',
      'ArgoCD',
      'GitHub Repository',
      'GitHub Teams',
      'NESGen Secrets',
      'Key Vaults',
      'SPNs',
      'SPNs Graph',
      'Backend SPNs',
      'Frontend SPNs (FE-SPNs)',
      'AAD Security Groups',
      'Persona Groups',
    ])
    expect(readiness).toHaveLength(8 * 17 * 3)
    expect(new Set(readiness.map((r) => r.id)).size).toBe(readiness.length)
  })
  it('has valid project, component, team, and infrastructure owner relationships', () => {
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
  it('keeps status, checklist completion, and blockers consistent', () => {
    for (const r of readiness) {
      if (r.status === 'Ready') expect(r.checks.every((c) => c.complete)).toBe(true)
      if (r.status === 'Not Started' || r.status === 'N/A')
        expect(r.checks.some((c) => c.complete)).toBe(false)
      if (r.status === 'Blocked') {
        expect(r.blocker?.ticket).toMatch(/^INFRA-\d+$/)
        expect(r.checks.some((c) => !c.complete)).toBe(true)
        expect(r.blocker?.createdAt).toBeTruthy()
      } else expect(r.blocker).toBeUndefined()
      if (r.status === 'In Progress') {
        expect(r.checks.some((c) => c.complete)).toBe(true)
        expect(r.checks.some((c) => !c.complete)).toBe(true)
      }
    }
  })
  it('uses distinct, component-specific checklists', () => {
    expect(new Set(components.map((c) => c.checks.map((c) => c.label).join('|'))).size).toBe(17)
    for (const r of readiness)
      expect(r.checks.map((c) => c.label)).toEqual(
        components.find((c) => c.id === r.componentId)!.checks.map((c) => c.label),
      )
  })
  it('provides varied statuses, non-applicable components, fully ready projects, and blockers in each environment', () => {
    for (const env of environments) {
      const counts = statusCounts(getRecords(undefined, env))
      for (const count of Object.values(counts)) expect(count).toBeGreaterThan(0)
      expect(projects.some((p) => readinessPercent(getRecords(p.id, env)) === 100)).toBe(true)
    }
    expect(getRecords('36519-aura-trike', 'DEV', 'redis')[0].status).toBe('Blocked')
    expect(getRecords('36519-aura-trike', 'DEV', 'redis')[0].blocker!.ticket).toBe('INFRA-2841')
    expect(getRecords('36411-aura-brandiq', 'DEV', 'pgvector')[0].status).toBe('N/A')
  })
})
describe('Readiness calculations and record scoping', () => {
  it('excludes N/A and counts only Ready, without awarding partial component credit', () => {
    const ready = readiness.find((r) => r.status === 'Ready')!
    const na = readiness.find((r) => r.status === 'N/A')!
    const progress = readiness.find((r) => r.status === 'In Progress')!
    expect(readinessPercent([ready, na])).toBe(100)
    expect(readinessPercent([ready, progress, na])).toBe(50)
    expect(readinessPercent([na])).toBe(0)
    expect(readinessPercent([])).toBe(0)
  })
  it('isolates an exact project × component × environment record', () => {
    expect(getRecords('36519-aura-trike', 'DEV', 'redis')).toHaveLength(1)
    expect(getRecords('36519-aura-trike', 'All', 'redis')).toHaveLength(3)
    expect(getRecords('36519-aura-trike', 'QA')).toHaveLength(17)
    expect(getRecords(undefined, 'PROD', 'argocd')).toHaveLength(8)
  })
  it('supports the matrix status predicate with exact component scope', () => {
    expect(matchesStatus(getRecords('36519-aura-trike', 'DEV', 'redis'), 'Blocked')).toBe(true)
    expect(matchesStatus(getRecords('36411-aura-brandiq', 'DEV'), 'Blocked')).toBe(false)
    expect(matchesStatus(getRecords('36411-aura-brandiq', 'DEV'), 'All')).toBe(true)
  })
})

describe('Combined matrix filters', () => {
  it('applies owner and status to the same component records, excluding unneeded owner records', () => {
    const records = getRecords('36519-aura-trike', 'DEV')
    expect(matchesStatus(filterMatrixRecords(records, 'redis', 'platform'), 'Blocked')).toBe(true)
    expect(matchesStatus(filterMatrixRecords(records, 'redis', 'identity'), 'Blocked')).toBe(false)
    expect(filterMatrixRecords(records, 'pgvector', 'data-platform')).toHaveLength(0)
    expect(filterMatrixRecords(records, 'pgvector', 'All')[0].status).toBe('N/A')
  })
})
