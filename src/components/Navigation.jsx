"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setSelectedClients,
  setSelectedIndustryTags1,
  setSelectedKeywords,
  setSelectedPlatforms,
  setSelectedMarketingGoals,
  setSearchQuery,
  enableFilters,
  resetFilters,
} from "@/features/filters/filterSlice";
import { applyFilters, fetchTemplates } from "@/features/templates/templateSlice";
import { setPage } from "@/features/ui/uiSlice";
import FilterModal from "./FilterModal";
import MultiSelect from "./MultiSelect";
import Loader from "./Loader";

const Navigation = () => {
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const dispatch = useDispatch();

  const { clients, industry_tag1, keywords, marketing_goals, platforms } = useSelector(
    (state) => state.filters.filters || {}
  );
  const { loading, searchQuery } = useSelector((state) => state.filters);
  const { numberOfTemps } = useSelector((state) => state.templates || {});

  const selectedClients = useSelector((state) => state.filters.selected?.clients || []);
  const selectedIndustryTags1 = useSelector((state) => state.filters.selected?.industry_tag1 || []);
  const selectedKeywords = useSelector((state) => state.filters.selected?.keywords || []);
  const selectedPlatforms = useSelector((state) => state.filters.selected?.platforms || []);
  const selectedMarketingGoals = useSelector((state) => state.filters.selected?.marketing_goals || []);

  // Total and Filtered Count Resolution
  const totalTemplates = numberOfTemps?.total || 358;
  const filteredTemplates = numberOfTemps?.filtered || 0;

  const handleSearchChange = (e) => {
    dispatch(setSearchQuery(e.target.value));
    dispatch(setPage(1));
  };

  const submitFilters = async (e) => {
    if (e) e.preventDefault();

    const currentScrollY = window.scrollY;

    const hasActiveFilters =
      selectedClients.length > 0 ||
      selectedIndustryTags1.length > 0 ||
      selectedKeywords.length > 0 ||
      selectedPlatforms.length > 0 ||
      selectedMarketingGoals.length > 0;

    if (hasActiveFilters) {
      const platformNames = selectedPlatforms.map((p) =>
        typeof p === "object" ? p.name || p.id : p
      );

      const filterPayload = {
        clients: selectedClients,
        industryTags1: selectedIndustryTags1,
        keywords: selectedKeywords,
        platforms: platformNames,
        marketingGoals: selectedMarketingGoals,
      };

      dispatch(enableFilters(true));
      dispatch(setPage(1));

      await dispatch(applyFilters(filterPayload));
    } else {
      dispatch(resetFilters());
      dispatch(setPage(1));

      await dispatch(fetchTemplates());
    }

    requestAnimationFrame(() => {
      window.scrollTo({
        top: currentScrollY,
        behavior: "instant",
      });
    });

    if (isFiltersModalOpen) setIsFiltersModalOpen(false);
  };

  if (loading) {
    return <Loader size="md" color="#f97316" />;
  }

  return (
    <section id="library" className="library-navigation-section">
      <div className="container">
        
        {/* Top Header Row */}
        <div className="nav-top-row">
          <div className="library-heading-group">
            <span className="library-subtitle">YOUR LIBRARY</span>
            <h2 className="library-main-title">
              Unique templates: {totalTemplates}
            </h2>
          </div>

          <div className="library-search-box">
            <svg 
              className="search-icon" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" strokeLinejoin="round" d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="text"
              placeholder="Search your library"
              value={searchQuery || ""}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>
        </div>

        {/* Bottom Horizontal Filter Controls */}
        <div className="nav-bottom-row">
          <div className="filter-pills-group">
            <MultiSelect
              options={keywords || []}
              selected={selectedKeywords}
              onSelectionChange={(item) => dispatch(setSelectedKeywords(item))}
              placeholder={selectedKeywords.length ? `DCOs (${selectedKeywords.length})` : "All DCOs"}
              position="absolute"
            />

            <MultiSelect
              options={industry_tag1 || []}
              selected={selectedIndustryTags1}
              onSelectionChange={(item) => dispatch(setSelectedIndustryTags1(item))}
              placeholder={selectedIndustryTags1.length ? `Categories (${selectedIndustryTags1.length})` : "All categories"}
              position="absolute"
            />

            <MultiSelect
              options={clients || []}
              selected={selectedClients}
              onSelectionChange={(item) => dispatch(setSelectedClients(item))}
              placeholder={selectedClients.length ? `Clients (${selectedClients.length})` : "All clients"}
              position="absolute"
            />

            <MultiSelect
              options={platforms || []}
              selected={selectedPlatforms}
              onSelectionChange={(item) => dispatch(setSelectedPlatforms(item))}
              placeholder={selectedPlatforms.length ? `Platforms (${selectedPlatforms.length})` : "All platforms"}
              position="absolute"
            />

            <MultiSelect
              options={marketing_goals || []}
              selected={selectedMarketingGoals}
              onSelectionChange={(item) => dispatch(setSelectedMarketingGoals(item))}
              placeholder={selectedMarketingGoals.length ? `Goals (${selectedMarketingGoals.length})` : "All goals"}
              position="absolute"
            />
          </div>

          {/* Right Red Action Filter Button */}
          <div className="filter-action-group">
            <button 
              type="button" 
              onClick={submitFilters} 
              className="red-filter-btn"
            >
              <svg 
                className="btn-chevron" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
              <span>Filter</span>
            </button>

            <span className="titles-count-text">
              {filteredTemplates > 0 ? filteredTemplates : totalTemplates} titles
            </span>
          </div>
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