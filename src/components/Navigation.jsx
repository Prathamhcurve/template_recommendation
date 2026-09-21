"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import {
  setSelectedClients,
  setSelectedIndustryTags1,
  setSelectedKeywords,
  setSelectedPlatforms,
  setSelectedMarketingGoals,
  resetFilters,
} from "@/features/filters/filterSlice";
import { setPage } from "@/features/ui/uiSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import FilterModal from "./FilterModal";
import MultiSelect from "./MultiSelect";
import Button from "./Button";
import Loader from "./Loader";

const Navigation = () => {
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const { clients, industry_tag1, keywords, platforms, marketing_goals } = useSelector(
    (state) => state.filters.filters,
  );

  const { loading } = useSelector((state) => state.filters);

  // Read selected items safely with fallbacks
  const selectedClients = useSelector((state) => state.filters.selected.clients || []);
  const selectedIndustryTags1 = useSelector((state) => state.filters.selected.industry_tag1 || []);
  const selectedKeywords = useSelector((state) => state.filters.selected.keywords || []);
  const selectedPlatforms = useSelector((state) => state.filters.selected.platforms || []);
  const selectedMarketingGoals = useSelector((state) => state.filters.selected.marketing_goals || []);

  const submitFilters = () => {
    if (
      selectedClients.length > 0 ||
      selectedIndustryTags1.length > 0 ||
      selectedKeywords.length > 0 ||
      selectedPlatforms.length > 0 ||
      selectedMarketingGoals.length > 0
    ) {
      const query = {
        clients: selectedClients,
        industryTags1: selectedIndustryTags1,
        keywords: selectedKeywords,
        platforms: selectedPlatforms,
        marketingGoals: selectedMarketingGoals,
      };

      const encodedQuery = btoa(JSON.stringify(query));

      dispatch(setPage(1));
      router.push(`/filter/${encodedQuery}`);
    } else {
      dispatch(resetFilters());
      router.push(`/`);
    }

    if (isFiltersModalOpen) setIsFiltersModalOpen(false);
  };

  if (loading) {
    return <Loader size="md" color="#f97316" />;
  }

  return (
    <section className="navigation">
      <div className="container">
        <div className="nav-content filter-drops">
          <MultiSelect
            options={keywords || []}
            selected={selectedKeywords}
            onSelectionChange={(item) => dispatch(setSelectedKeywords(item))}
            placeholder="DCOs..."
            position="absolute"
          />

          <MultiSelect
            options={industry_tag1 || []}
            selected={selectedIndustryTags1}
            onSelectionChange={(item) => dispatch(setSelectedIndustryTags1(item))}
            placeholder="Category..."
            position="absolute"
          />

          <MultiSelect
            options={clients || []}
            selected={selectedClients}
            onSelectionChange={(item) => dispatch(setSelectedClients(item))}
            placeholder="Clients..."
            position="absolute"
          />

          <MultiSelect
            options={platforms || []}
            selected={selectedPlatforms}
            onSelectionChange={(item) => dispatch(setSelectedPlatforms(item))}
            placeholder="Platforms..."
            position="absolute"
          />

          <MultiSelect
            options={marketing_goals || []}
            selected={selectedMarketingGoals}
            onSelectionChange={(item) => dispatch(setSelectedMarketingGoals(item))}
            placeholder="Marketing Goal"
            // badge="Beta"
            position="absolute"
          />

          <Button
            text="Filter"
            icon={faFilter}
            onClick={submitFilters}
            btnType={"primary"}
          />
        </div>

        <div className="nav-right">
          <button
            className="filter-btn"
            onClick={() => setIsFiltersModalOpen(true)}
          >
            <FontAwesomeIcon icon={faFilter} />
            Filters
          </button>
        </div>
      </div>

      <FilterModal
        isOpen={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
        onSubmit={submitFilters}
      />
    </section>
  );
};

export default Navigation;