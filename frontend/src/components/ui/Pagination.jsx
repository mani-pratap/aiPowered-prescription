const Pagination = ({ pages, page, changePage }) => {
  if (pages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-1 mt-8">
      <button
        onClick={() => changePage(page - 1)}
        disabled={page === 1}
        className="px-3 py-1 rounded-md bg-slate-800 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
      >
        Prev
      </button>

      {[...Array(pages).keys()].map((x) => (
        <button
          key={x + 1}
          onClick={() => changePage(x + 1)}
          className={`px-3 py-1 rounded-md transition-colors ${
            x + 1 === page
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          {x + 1}
        </button>
      ))}

      <button
        onClick={() => changePage(page + 1)}
        disabled={page === pages}
        className="px-3 py-1 rounded-md bg-slate-800 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
