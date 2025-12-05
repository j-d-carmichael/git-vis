import { useStore } from '../store/useStore'

export function WelcomeScreen() {
  const openRepository = useStore((state) => state.openRepository)
  const error = useStore((state) => state.error)
  const isLoading = useStore((state) => state.isLoading)

  const handleOpenRepo = async () => {
    const path = await window.gitApi.openFolderDialog()
    if (path) {
      await openRepository(path)
    }
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gv-bg">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gv-text mb-2">GitViz</h1>
        <p className="text-gv-text-muted mb-8">A simple, visual Git client</p>

        <button
          onClick={handleOpenRepo}
          disabled={isLoading}
          className="px-6 py-3 bg-gv-accent hover:bg-gv-accent-hover text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Opening...' : 'Open Repository'}
        </button>

        {error && (
          <p className="mt-4 text-gv-danger text-sm">{error}</p>
        )}
      </div>

      <div className="absolute bottom-8 text-gv-text-muted text-sm">
        <p>Select a Git repository folder to get started</p>
      </div>
    </div>
  )
}
