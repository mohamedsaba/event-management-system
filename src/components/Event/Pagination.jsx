function Pagination({ page, totalPages, setPage }) {
  return (
    <div className="flex justify-center gap-2 pt-6">

      <button
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
        className="px-4 py-2 border rounded disabled:opacity-40"
      >
        Prev
      </button>

      <span className="px-4 py-2 text-sm">
        Page {page} of {totalPages}
      </span>

      <button
        disabled={page === totalPages}
        onClick={() => setPage(page + 1)}
        className="px-4 py-2 border rounded disabled:opacity-40"
      >
        Next
      </button>

    </div>
  );
}

export default Pagination;