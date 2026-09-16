import { useSelector, useDispatch } from "react-redux";
import {
  setSelectedClients,
  setSelectedIndustryTags1,
  setSelectedKeywords,
  setSelectedMarketingGoals, // 1. Added new action export
} from "../features/filters/filterSlice";
import MultiSelect from "./MultiSelect";
import Button from "./Button";

const FilterModal = ({ isOpen, onClose, onSubmit }) => {
  const dispatch = useDispatch();

  // 2. Extracted marketing_goals options from Redux state
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

  return (
    <>
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>Choose Filters</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="sidebar-content">
          <MultiSelect
            options={keywords}
            selected={selectedKeywords}
            onSelectionChange={(item) => {
              dispatch(setSelectedKeywords(item));
            }}
            placeholder="DCOs..."
          />

          <MultiSelect
            options={industry_tag1}
            selected={selectedIndustryTags1}
            onSelectionChange={(item) => {
              dispatch(setSelectedIndustryTags1(item));
            }}
            placeholder="Industry..."
          />

          <MultiSelect
            options={clients}
            selected={selectedClients}
            onSelectionChange={(item) => {
              dispatch(setSelectedClients(item));
            }}
            placeholder="Clients..."
          />

          {/* 4. Removed disabled & badge, added active handlers */}
          <MultiSelect
            placeholder="Marketing Goal"
            options={marketing_goals || []}
            selected={selectedMarketingGoals || []}
            onSelectionChange={(item) => {
              dispatch(setSelectedMarketingGoals(item));
            }}
          />

          <Button
            text="Apply Filters"
            btnType={"primary"}
            icon={false}
            onClick={onSubmit}
            width={"full"}
          />
        </div>
      </div>

      {isOpen && <div className="overlay" onClick={onClose} />}
    </>
  );
};

export default FilterModal;