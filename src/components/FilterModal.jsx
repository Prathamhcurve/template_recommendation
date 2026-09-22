"use client";

import { useSelector, useDispatch } from "react-redux";
import {
  setSelectedClients,
  setSelectedIndustryTags1,
  setSelectedKeywords,
  setSelectedPlatforms,
  setSelectedMarketingGoals,
} from "../features/filters/filterSlice";
import MultiSelect from "./MultiSelect";
import Button from "./Button";

// Static Platforms dataset with sub-options
const PLATFORM_OPTIONS_WITH_SUBS = [
  {
    id: "Google Ads",
    name: "Google Ads",
    subOptions: [
      "Google Play",
      "Discover",
      "Display Network",
      "Search",
    ],
  },
  {
    id: "Meta",
    name: "Meta",
    subOptions: [
      "Facebook Feed",
      "Instagram Stories",
      "Instagram Reels",
      "Audience Network",
    ],
  },
  {
    id: "YouTube",
    name: "YouTube",
    subOptions: [
      "In-Stream Ads",
      "YouTube Shorts",
      "Bumper Ads",
      "Masthead",
    ],
  },
  {
    id: "PhonePe",
    name: "PhonePe",
    subOptions: [
      "Home Banner",
      "Rewards Page",
      "Payment Success Screen",
    ],
  },
  {
    id: "Paytm",
    name: "Paytm",
    subOptions: [
      "App Homepage Interstitial",
      "Cashback & Offers Zone",
      "Post-Payment Screen",
    ],
  },
];

const FilterModal = ({ isOpen, onClose, onSubmit }) => {
  const dispatch = useDispatch();

  const { clients, industry_tag1, keywords, marketing_goals } = useSelector(
    (state) => state.filters.filters
  );

  const {
    clients: selectedClients,
    industry_tag1: selectedIndustryTags1,
    keywords: selectedKeywords,
    platforms: selectedPlatforms,
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
            options={keywords || []}
            selected={selectedKeywords}
            onSelectionChange={(item) => {
              dispatch(setSelectedKeywords(item));
            }}
            placeholder="DCOs..."
          />

          <MultiSelect
            options={industry_tag1 || []}
            selected={selectedIndustryTags1}
            onSelectionChange={(item) => {
              dispatch(setSelectedIndustryTags1(item));
            }}
            placeholder="Industry..."
          />

          <MultiSelect
            options={clients || []}
            selected={selectedClients}
            onSelectionChange={(item) => {
              dispatch(setSelectedClients(item));
            }}
            placeholder="Clients..."
          />

          {/* Platforms MultiSelect loaded with static sub-options */}
          <MultiSelect
            placeholder="Platforms..."
            options={PLATFORM_OPTIONS_WITH_SUBS}
            selected={selectedPlatforms || []}
            onSelectionChange={(item) => {
              dispatch(setSelectedPlatforms(item));
            }}
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