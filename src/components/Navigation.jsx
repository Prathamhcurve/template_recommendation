import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  setSelectedClients,
  setSelectedIndustryTags1,
  setSelectedKeywords,
  setSelectedMarketingGoals, // 1. Imported new action creator
  resetFilters,
} from "../features/filters/filterSlice";
import { setPage } from "../features/ui/uiSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import FilterModal from "./FilterModal";
import MultiSelect from "./MultiSelect";
import Button from "./Button";

const Navigation = () => {
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 2. Extracted marketing_goals from Redux state options
  const { clients, industry_tag1, keywords, marketing_goals } = useSelector(
    (state) => state.filters.filters
  );

  // 3. Extracted selected marketing_goals from Redux state
  const {
    clients: selectedClients,
    industry_tag1: selectedIndustryTags1,
    keywords: selectedKeywords,
    marketing_goals: selectedMarketingGoals,
  } = useSelector((state) => state.filters.selected);

  const submitFilters = () => {
    if (
      (selectedClients && selectedClients.length > 0) ||
      (selectedIndustryTags1 && selectedIndustryTags1.length > 0) ||
      (selectedKeywords && selectedKeywords.length > 0) ||
      (selectedMarketingGoals && selectedMarketingGoals.length > 0) // 4. Included marketing_goals check
    ) {
      const query = {
        clients: selectedClients,
        industryTags1: selectedIndustryTags1,
        keywords: selectedKeywords,
        marketingGoals: selectedMarketingGoals, // 5. Added to filter payload
      };

      const encodedQuery = btoa(JSON.stringify(query));

      dispatch(setPage(1));
      navigate(`/filter/${encodedQuery}`);
    } else {
      dispatch(resetFilters());
      navigate(`/`);
    }

    if (isFiltersModalOpen) setIsFiltersModalOpen(false);
  };

  return (
    <section className="navigation">
      <div className="container">
        <div className="nav-content filter-drops">
          <MultiSelect
            options={keywords}
            selected={selectedKeywords}
            onSelectionChange={(item) => {
              dispatch(setSelectedKeywords(item));
            }}
            placeholder="DCOs..."
            position="absolute"
          />

          <MultiSelect
            options={industry_tag1}
            selected={selectedIndustryTags1}
            onSelectionChange={(item) => {
              dispatch(setSelectedIndustryTags1(item));
            }}
            placeholder="Category..."
            position="absolute"
          />

          <MultiSelect
            options={clients}
            selected={selectedClients}
            onSelectionChange={(item) => {
              dispatch(setSelectedClients(item));
            }}
            placeholder="Clients..."
            position="absolute"
          />

          {/* 6. Enabled Marketing Goal MultiSelect */}
          <MultiSelect
            options={marketing_goals || []}
            selected={selectedMarketingGoals || []}
            onSelectionChange={(item) => {
              dispatch(setSelectedMarketingGoals(item));
            }}
            placeholder="Marketing Goal"
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