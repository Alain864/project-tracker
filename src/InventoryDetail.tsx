import type { InventoryDetail as Detail, RoleAssignment } from './types'

export function InventoryDetail({ detail }: { detail: Detail }) {
  if (detail.kind === 'text') {
    return detail.value === 'Present' ? (
      <p className="inventory-note">Present in this environment.</p>
    ) : (
      <p className="resource-name inventory-value">{detail.value}</p>
    )
  }
  if (detail.kind === 'list') {
    return (
      <ul className="inventory-list">
        {detail.items.map((item) => (
          <li key={item.label}>
            <span>{item.label}</span>
            {item.deprecated && <em>Deprecated</em>}
          </li>
        ))}
      </ul>
    )
  }
  if (detail.kind === 'teams') {
    return (
      <table className="inventory-table">
        <thead>
          <tr>
            <th>Team</th>
            <th>Role</th>
            {detail.rows.some((row) => row.members) && <th>Members</th>}
          </tr>
        </thead>
        <tbody>
          {detail.rows.map((row) => (
            <tr key={row.name}>
              <td>{row.name}</td>
              <td>{row.role}</td>
              {detail.rows.some((item) => item.members) && <td>{row.members ?? '—'}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    )
  }
  if (detail.kind === 'permissions') {
    return (
      <div className="inventory-permissions">
        {detail.principal && <p className="resource-name">{detail.principal}</p>}
        <ul>
          {detail.rows.map((row) => (
            <li key={row.scope}>
              <span>{row.scope}</span>
              <em className={row.state === 'Pending' ? 'pending' : 'granted'}>{row.state}</em>
              {row.tenant && <small>{row.tenant}</small>}
            </li>
          ))}
        </ul>
      </div>
    )
  }
  const sections = groupRoles(detail.rows)
  return (
    <div className="inventory-roles">
      {sections.map((section) => (
        <section key={section.name}>
          {section.name && <h4>{section.name}</h4>}
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {section.rows.map((row) => (
                <tr key={`${row.name}-${row.role}-${row.id ?? ''}`}>
                  <td>
                    <span>{row.name}</span>
                    {row.id && <small>{row.id}</small>}
                  </td>
                  <td>{row.type}</td>
                  <td>{row.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  )
}

function groupRoles(rows: RoleAssignment[]) {
  const sections: { name: string; rows: RoleAssignment[] }[] = []
  for (const row of rows) {
    const current = sections.at(-1)
    if (!current || current.name !== row.section) sections.push({ name: row.section, rows: [row] })
    else current.rows.push(row)
  }
  return sections
}
