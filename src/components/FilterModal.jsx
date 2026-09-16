"use client";

import { useSelector, useDispatch } from "react-redux";
import {
  setSelectedClients,
  setSelectedIndustryTags1,
  setSelectedKeywords,
  setSelectedMarketingGoals,
} from "../features/filters/filterSlice";
import MultiSelect from "./MultiSelect";
import Button from "./Button";

const FilterModal = ({ isOpen, onClose, onSubmit }) => {
  const dispatch = useDispatch();

  const { clients, industry_tag1, keywords, marketing_goals } = useSelector(
    (state) => state.filters.filters
  );

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