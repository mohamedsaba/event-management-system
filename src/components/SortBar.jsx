function SortBar({ sortBy, setSortBy }) {
  return (
    <div className="flex justify-between items-center">

      

      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="border rounded-lg px-3 py-2 text-sm"
      >
        <option value="date">Sort by Date</option>
        <option value="price">Sort by Price</option>
      </select>

    </div>
  );
}

export default SortBar;