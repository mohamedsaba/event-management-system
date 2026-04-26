function SidebarFilters({ priceFilter, setPriceFilter }) {
  return (
    <div className="border rounded-xl p-4 space-y-4 h-fit">

      <h2 className="font-semibold text-lg">
        Filters
      </h2>

      <div className="space-y-2">

        <button
          onClick={() => setPriceFilter("all")}
          className={`block w-full text-left px-3 py-2 rounded
          ${priceFilter === "all" ? "bg-slate-200" : "hover:bg-slate-100"}`}
        >
          All Events
        </button>

        <button
          onClick={() => setPriceFilter("free")}
          className={`block w-full text-left px-3 py-2 rounded
          ${priceFilter === "free" ? "bg-slate-200" : "hover:bg-slate-100"}`}
        >
          Free Events
        </button>

        <button
          onClick={() => setPriceFilter("paid")}
          className={`block w-full text-left px-3 py-2 rounded
          ${priceFilter === "paid" ? "bg-slate-200" : "hover:bg-slate-100"}`}
        >
          Paid Events
        </button>

      </div>

    </div>
  );
}

export default SidebarFilters;