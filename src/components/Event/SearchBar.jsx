function SearchBar({ search, setSearch }) {
  return (
    <div className="mb-6">

      <input
        type="text"
        placeholder="Search events..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="
        w-full
        border border-slate-300
        rounded-lg
        px-4 py-2
        text-sm
        focus:outline-none
        focus:ring-2
        focus:ring-primary
        "
      />

    </div>
  )
}

export default SearchBar