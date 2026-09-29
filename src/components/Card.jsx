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

  // 2. Fetch applied filter states
  const filtersApplied = useSelector((state) => state.filters?.applied) || {};
  const filtersSelected = useSelector((state) => state.filters?.selected) || {};

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

  // 3. Parser: Parse meta_tags to extract main platforms and sub-options
  const parseMetaTags = (rawMeta) => {
    let mainPlatforms = [];
    let subOptions = [];

    if (!rawMeta) return { mainPlatforms, subOptions };

    const str = typeof rawMeta === "object" ? JSON.stringify(rawMeta) : String(rawMeta).trim();

    if (str.startsWith("{") || str.startsWith("[")) {
      try {
        const jsonString = str.startsWith("{") && !str.endsWith("]") ? `[${str}]` : str;
        const parsed = JSON.parse(jsonString);
        const items = Array.isArray(parsed) ? parsed : [parsed];

        items.forEach((item) => {
          if (typeof item === "object" && item !== null) {
            const name = item.name || item.id;
            if (name) mainPlatforms.push(name);
            if (Array.isArray(item.subOptions)) {
              subOptions.push(...item.subOptions);
            }
          } else if (typeof item === "string") {
            mainPlatforms.push(item);
          }
        });

        return {
          mainPlatforms: Array.from(new Set(mainPlatforms)),
          subOptions: Array.from(new Set(subOptions)),
        };
      } catch (e) {
        const matches = [...str.matchAll(/"(?:name|id)":\s*"([^"]+)"/g)];
        if (matches.length > 0) {
          const names = Array.from(new Set(matches.map((m) => m[1])));
          return { mainPlatforms: names, subOptions: [] };
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
    };
  };

  const { mainPlatforms, subOptions } = parseMetaTags(meta_tags);

  // 4. Sort Main Platforms: Filtered tags FIRST -> "Google Ads" SECOND -> Remaining
  const sortedPlatforms = [...mainPlatforms].sort((a, b) => {
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();

    const aIsSelected = activeFilterSet.has(aLower);
    const bIsSelected = activeFilterSet.has(bLower);

    if (aIsSelected && !bIsSelected) return -1;
    if (!aIsSelected && bIsSelected) return 1;

    // Fallback: Google Ads priority
    if (aLower === "google ads") return -1;
    if (bLower === "google ads") return 1;

    return 0;
  });

  // 5. Sort Sub-options: Filtered sub-options FIRST -> Remaining
  const sortedSubOptions = [...subOptions].sort((a, b) => {
    const aIsSelected = activeFilterSet.has(a.toLowerCase());
    const bIsSelected = activeFilterSet.has(b.toLowerCase());

    if (aIsSelected && !bIsSelected) return -1;
    if (!aIsSelected && bIsSelected) return 1;
    return 0;
  });

  const hasAnyFilterApplied = activeFilterSet.size > 0;
  const hasRemainingTags = sortedPlatforms.length > 0 || sortedSubOptions.length > 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": title,
    "description": desc,
    "image": imageLink,
    "identifier": id,
    "keywords": sortedPlatforms.join(", ") || meta_tags,
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

            {/* Main Platforms Row (Blue Tags) - Selected Filtered First */}
            {sortedPlatforms.length > 0 && (
              <div className="tags main-tags" style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {sortedPlatforms.map((platform, idx) => (
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

            {/* Sub-options Row (Grey Tags) - Selected Filtered First */}
            {sortedSubOptions.length > 0 && (
              <div className="tags sub-tags" style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {sortedSubOptions.map((subTag, idx) => (
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