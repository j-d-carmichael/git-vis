import { BranchList } from './BranchList'
import { RemoteList } from './RemoteList'

export function Sidebar() {
  return (
    <aside className="w-60 bg-gv-bg-secondary border-r border-gv-border flex flex-col overflow-hidden no-select">
      <BranchList />
      <RemoteList />
    </aside>
  )
}
