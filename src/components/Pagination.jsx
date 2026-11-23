"use client";

const Pagination = ({ page, pageSize, totalItems, setPage }) => {
  const totalPages = Math.ceil(totalItems / pageSize);

  const handlePageChange = (newPage) => {
    setPage(newPage);

    const showcaseElement = document.getElementById("showcase");
    if (showcaseElement) {
      const yOffset = -90;
      const y = showcaseElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  if (totalPages <= 1) return null;

  return (
    <section className="netflix-pagination-container">
      <div className="netflix-pagination-bar">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => handlePageChange(page - 1)}
          disabled={page <= 1}
          className={`net-page-btn ${page <= 1 ? "disabled" : ""}`}
          aria-label="Previous page"
        >
          <svg className="net-btn-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
          <span>Prev</span>
        </button>

        {/* Center Page Pill */}
        <div className="net-page-indicator">
          <span className="net-page-current">{page}</span>
          <span className="net-page-divider">/</span>
          <span className="net-page-total">{totalPages}</span>
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= totalPages}
          className={`net-page-btn net-next-btn ${page >= totalPages ? "disabled" : ""}`}
          aria-label="Next page"
        >
          <span>Next</span>
          <svg className="net-btn-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
          </svg>
        </button>
      </div>
    </section>
  );
};

export default Pagination;