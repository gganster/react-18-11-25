const SuspenseFallback = () => (
  <div className="flex items-center justify-center h-full min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mr-4"></div>
    <span>Chargement…</span>
  </div>
)

export default SuspenseFallback
