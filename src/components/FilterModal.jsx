"use client";

import { useSelector, useDispatch } from "react-redux";
import {
  setSelectedClients,
  setSelectedIndustryTags1,
  setSelectedKeywords,
  setSelectedPlatforms,
} from "../features/filters/filterSlice";
import MultiSelect from "./MultiSelect";
import Button from "./Button";

const FilterModal = ({ isOpen, onClose, onSubmit }) => {
  const dispatch = useDispatch();

  const { clients, industry_tag1, keywords, platforms } = useSelector(
    (state) => state.filters.filters
  );

  const {
    clients: selectedClients,
    industry_tag1: selectedIndustryTags1,
    keywords: selectedKeywords,
    platforms: selectedPlatforms,
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
            placeholder="Platforms..."
            options={platforms || []}
            selected={selectedPlatforms || []}
            onSelectionChange={(item) => {
              dispatch(setSelectedPlatforms(item));
            }}
          />

          <MultiSelect
            placeholder="Marketing Goal"
            options={[]}
            selected={[]}
            onSelectionChange={(item) => {
              console.log(item);
            }}
            badge="Beta"
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