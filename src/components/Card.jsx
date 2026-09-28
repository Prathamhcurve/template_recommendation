"use client";

import Link from "next/link";
import { useSelector } from "react-redux";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import Button from "./Button";

const Card = ({ template }) => {
  const { id, title, desc, thumbnail, meta_tags, videos_images } = template;

  // 1. Fetch available platforms
  const reduxPlatforms = useSelector(
    (state) => state.filters?.filters?.platforms || []
  );

  // 2. Fetch all applied filter states from Redux
  const filtersApplied = useSelector((state) => state.filters?.applied) || {};
  const filtersSelected = useSelector((state) => state.filters?.selected) || {};

  // Extract all active filter values across potential state slices (platforms, subOptions, campaignTypes, etc.)
  const flattenAllFilters = (...sources) => {
    const set = new Set();
    const extract = (item) => {
      if (!item) return;
      if (typeof item === "string" || typeof item === "number") {
        set.add(String(item).trim().toLowerCase());
      } else if (Array.isArray(item)) {
        item.forEach(extract);
      } else if (typeof item === "object") {
        Object.values(item).forEach((val) => {
          if (typeof val === "string" || typeof val === "number") {
            set.add(String(val).trim().toLowerCase());
          } else if (Array.isArray(val) || typeof val === "object") {
            extract(val);
          }
        });
      }
    };
    sources.forEach(extract);
    return set;
  };

  const activeFilterSet = flattenAllFilters(filtersApplied, filtersSelected);

  const imageLink =
    videos_images !== undefined
      ? JSON.parse(videos_images.replace(/'/g, '"'))[1]
      : thumbnail;

  // 3. Parser: Parse meta_tags and build precise platform-to-subOption mappings
  const parseMetaTags = (rawMeta) => {
    let mainPlatforms = [];
    let subOptions = [];
    let platformSubMap = {}; // Key: lowercase platform name -> Set of lowercase subOptions

    if (!rawMeta) return { mainPlatforms, subOptions, platformSubMap };

    const str = typeof rawMeta === "object" ? JSON.stringify(rawMeta) : String(rawMeta).trim();

    if (str.startsWith("{") || str.startsWith("[")) {
      try {
        const jsonString = str.startsWith("{") && !str.endsWith("]") ? `[${str}]` : str;
        const parsed = JSON.parse(jsonString);
        const items = Array.isArray(parsed) ? parsed : [parsed];

        items.forEach((item) => {
          if (typeof item === "object" && item !== null) {
            const name = item.name || item.id;
            if (name) {
              mainPlatforms.push(name);
              const pLower = name.toLowerCase();
              if (!platformSubMap[pLower]) platformSubMap[pLower] = new Set();

              if (Array.isArray(item.subOptions)) {
                item.subOptions.forEach((sub) => {
                  if (sub) {
                    subOptions.push(sub);
                    platformSubMap[pLower].add(String(sub).trim().toLowerCase());
                  }
                });
              }
            }
          } else if (typeof item === "string") {
            mainPlatforms.push(item);
          }
        });

        return {
          mainPlatforms: Array.from(new Set(mainPlatforms)),
          subOptions: Array.from(new Set(subOptions)),
          platformSubMap,
        };
      } catch (e) {
        const matches = [...str.matchAll(/"(?:name|id)":\s*"([^"]+)"/g)];
        if (matches.length > 0) {
          const names = Array.from(new Set(matches.map((m) => m[1])));
          return { mainPlatforms: names, subOptions: [], platformSubMap: {} };
        }
      }
    }

    const knownMainNames = new Set(
      reduxPlatforms.map((p) =>
        (typeof p === "object" ? p.name || p.id : String(p)).toLowerCase()
      )
    );

    const tags = str.split(",").map((t) => t.trim()).filter(Boolean);

    tags.forEach((tag) => {
      if (knownMainNames.size === 0 || knownMainNames.has(tag.toLowerCase())) {
        mainPlatforms.push(tag);
      } else {
        subOptions.push(tag);
      }
    });

    return {
      mainPlatforms: Array.from(new Set(mainPlatforms)),
      subOptions: Array.from(new Set(subOptions)),
      platformSubMap,
    };
  };

  const { mainPlatforms, subOptions, platformSubMap } = parseMetaTags(meta_tags);

  // 4. Sub-options Filter Logic:
  // Hide sub-option if it matches any active filter
  const displaySubOptions = subOptions.filter((sub) => {
    return !activeFilterSet.has(sub.toLowerCase());
  });

  // 5. Main Platforms Filter Logic:
  // Hide parent platform IF:
  //  a) The platform itself was directly selected
  //  b) OR it has sub-options assigned to it, AND EVERY single sub-option has been filtered out
  const displayPlatforms = mainPlatforms.filter((platform) => {
    const pLower = platform.toLowerCase();

    // Direct platform match check
    if (activeFilterSet.has(pLower)) return false;

    const childSubs = platformSubMap[pLower] || new Set();

    if (childSubs.size > 0) {
      // Find sub-options that are NOT currently selected in the filter
      const unselectedChildSubs = Array.from(childSubs).filter(
        (sub) => !activeFilterSet.has(sub)
      );

      // If 0 unselected sub-options remain (meaning all sub-options were selected), hide main platform
      if (unselectedChildSubs.length === 0) {
        return false;
      }
    }

    return true;
  });

  const hasAnyFilterApplied = activeFilterSet.size > 0;
  const hasRemainingTags = displayPlatforms.length > 0 || displaySubOptions.length > 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": title,
    "description": desc,
    "image": imageLink,
    "identifier": id,
    "keywords": mainPlatforms.join(", ") || meta_tags,
  };

  return (
    <div className="template-card">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="card-image-container">
        <img
          src={imageLink || null}
          alt={title}
          className="card-image"
          loading="lazy"
        />
      </div>

      <div className="card-header">
        <div className="card-title-row">
          <h3 className="card-title">{title}</h3>
        </div>
        <p className="card-description">{desc}</p>
      </div>

      <div className="card-content">
        {hasRemainingTags && (
          <div
            className="tags-wrapper"
            style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "12px" }}
          >
            {/* Dynamic Label Copy */}
            <span
              className="available-label"
              style={{ fontSize: "12px", color: "#6b7280", fontWeight: 500 }}
            >
              {hasAnyFilterApplied
                ? "Available for:"
                : "Available for Platforms:"}
            </span>

            {/* Main Platforms Row (Blue Tags) */}
            {displayPlatforms.length > 0 && (
              <div className="tags main-tags" style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {displayPlatforms.map((platform, idx) => (
                  <span
                    key={`${platform}-${idx}`}
                    className="tag main-tag"
                    style={{
                      backgroundColor: "#eff6ff",
                      color: "#1d4ed8",
                      borderColor: "#bfdbfe",
                      fontWeight: 600,
                    }}
                  >
                    {platform}
                  </span>
                ))}
              </div>
            )}

            {/* Remaining Sub-options Row (Grey Tags) */}
            {displaySubOptions.length > 0 && (
              <div className="tags sub-tags" style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {displaySubOptions.map((subTag, idx) => (
                  <span key={`${subTag}-${idx}`} className="tag sub-tag">
                    {subTag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <Link href={`/template/${id}`}>
          <Button
            text="View Details"
            icon={faEye}
            type={"button"}
            width={"full"}
            btnType={"primary"}
          />
        </Link>
      </div>
    </div>
  );
};

export default Card;