import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setError, setPage } from "../features/ui/uiSlice";
import Card from "./Card";
import Pagination from "./Pagination";
import Loader from "./Loader";

const Showcase = ({ isRecommended = false }) => {
  const dispatch = useDispatch();
  const { pathname } = useLocation();

  const [localPage, setLocalPage] = useState(1);

  const { enabled, searchQuery } = useSelector((state) => state.filters);

  const {
    list: data,
    numberOfTemps,
    loading,
  } = useSelector((state) => state.templates);

  // Safely fallback to defaults if numberOfTemps structure is missing
  const filtered = numberOfTemps?.filtered_temps ?? numberOfTemps?.filtered ?? 0;
  const total = numberOfTemps?.total_temps ?? numberOfTemps?.total ?? 0;

  const globalPage = useSelector((state) => state.ui.page);
  const page = isRecommended ? localPage : globalPage;

  const handleSetPage = (p) => {
    if (isRecommended) {
      setLocalPage(p);
    } else {
      dispatch(setPage(p));
    }
  };

  if (!data) {
    dispatch(setError("Error loading data!"));
    return null;
  }

  const pageSize = 15;
  const totalItems = data.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const currentData = data.slice(startIndex, endIndex);

  if (loading) {
    return <Loader size="lg" color="#f97316" />;
  }

  return (
    <>
      <section id="showcase">
        {searchQuery && (
          <h2 className="template-header">
            Showing results for "{searchQuery}"
          </h2>
        )}

        {enabled ? (
          <h2 className="template-header">
            Showing filtered results: {filtered > 0 ? filtered : totalItems} / {total}
          </h2>
        ) : (
          <h2 className="template-header">
            {pathname === "/" ? "Unique templates" : "Showing results"}: {totalItems > 0 ? totalItems : total}
          </h2>
        )}

        <div className="template-grid">
          {currentData.length !== 0 ? (
            currentData.map((template) => {
              return <Card key={template.id} template={template} />;
            })
          ) : (
            <h2>No templates found</h2>
          )}
        </div>
      </section>

      <Pagination
        page={page}
        pageSize={pageSize}
        totalItems={totalItems}
        setPage={handleSetPage}
      />
    </>
  );
};

export default Showcase;