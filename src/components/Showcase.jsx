"use client";

import { useState, useEffect } from "react";
import { usePathname, useParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { setError, setPage } from "@/features/ui/uiSlice";
import {
  setSelectedClients,
  setSelectedIndustryTags1,
  setSelectedKeywords,
  setSelectedPlatforms,
  setSelectedMarketingGoals,
  enableFilters,
} from "@/features/filters/filterSlice";
import Card from "./Card";
import Pagination from "./Pagination";
import Loader from "./Loader";

const Showcase = ({ isRecommended = false }) => {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const params = useParams();

  const [localPage, setLocalPage] = useState(1);

  const { enabled, searchQuery } = useSelector((state) => state.filters);

  const {
    list: data,
    numberOfTemps,
    loading,
  } = useSelector((state) => state.templates);

  const { filtered, total } = numberOfTemps;

  const globalPage = useSelector((state) => state.ui.page);
  const page = isRecommended ? localPage : globalPage;

  // Hydrate Redux state from URL base64 params on refresh/mount
  useEffect(() => {
    if (params?.filters) {
      try {
        const cleanBase64 = decodeURIComponent(params.filters);
        const decodedString = atob(cleanBase64);
        const parsedQuery = JSON.parse(decodedString);

        console.log("SUCCESSFULLY HYDRATING FROM URL:", parsedQuery);

        if (parsedQuery.clients) dispatch(setSelectedClients(parsedQuery.clients));
        if (parsedQuery.industryTags1 || parsedQuery.industry_tag1) {
          dispatch(setSelectedIndustryTags1(parsedQuery.industryTags1 || parsedQuery.industry_tag1));
        }
        if (parsedQuery.keywords) dispatch(setSelectedKeywords(parsedQuery.keywords));
        if (parsedQuery.platforms) dispatch(setSelectedPlatforms(parsedQuery.platforms));
        if (parsedQuery.marketingGoals || parsedQuery.marketing_goals) {
          dispatch(setSelectedMarketingGoals(parsedQuery.marketingGoals || parsedQuery.marketing_goals));
        }

        dispatch(enableFilters(true));
      } catch (error) {
        console.error("Error decoding filter query from URL:", error);
      }
    }
  }, [params?.filters, dispatch]);

  const handleSetPage = (p) => {
    if (isRecommended) {
      setLocalPage(p);
    } else {
      dispatch(setPage(p));
    }
  };

  if (loading) {
    return <Loader size="lg" color="#f97316" />;
  }

  if (!loading && !data) {
    dispatch(setError("Error loading data!"));
    return null;
  }

  // Frontend exclusion for templates marked as "to be deleted" in description
  const validData = data
    ? data.filter(
        (template) =>
          !template?.desc?.toLowerCase().includes("to be deleted")
      )
    : [];

  const pageSize = 15;
  const totalItems = validData.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const currentData = validData.slice(startIndex, endIndex);

  // Dynamic count calculation based on valid templates
  const displayFilteredCount = enabled ? totalItems : filtered;
  const displayTotalCount = enabled ? total : totalItems;

  return (
    <>
      <section id="showcase">
        {searchQuery && (
          <h2 className="template-header">
            Showing results for &quot;{searchQuery}&quot;
          </h2>
        )}

        {validData && enabled ? (
          <h2 className="template-header">
            Showing filtered results: {displayFilteredCount} / {displayTotalCount}
          </h2>
        ) : (
          <h2 className="template-header">
            {pathname === "/" ? "Unique templates" : "Showing results"}: {displayTotalCount}
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