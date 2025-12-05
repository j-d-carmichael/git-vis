import { useStore } from './store/useStore'
import { Sidebar } from './components/Sidebar/Sidebar'
import { CommitGraph } from './components/CommitGraph/CommitGraph'
import { StagingPanel } from './components/StagingPanel/StagingPanel'
import { Header } from './components/Header/Header'
import { WelcomeScreen } from './components/WelcomeScreen'

function App() {
  const repoPath = useStore((state) => state.repoPath)

  if (!repoPath) {
    return <WelcomeScreen />
  }

  return (
    <div className="h-screen flex flex-col bg-gv-bg">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <CommitGraph />
        <StagingPanel />
      </div>
    </div>
  )
}

export default App
