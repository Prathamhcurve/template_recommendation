"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";

const Card = ({ template }) => {
  const { id, title, desc, thumbnail, meta_tags, videos_images, client_name } = template;

  const [aspectRatioClass, setAspectRatioClass] = useState("aspect-square");

  const reduxPlatforms = useSelector(
    (state) => state.filters?.filters?.platforms || []
  );

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

  const activeFilterSet = useMemo(
    () => flattenAllFilters(filtersApplied, filtersSelected),
    [filtersApplied, filtersSelected]
  );

  const imageLink =
    videos_images !== undefined && videos_images !== null && videos_images !== ""
      ? (() => {
          try {
            const parsed = JSON.parse(videos_images.replace(/'/g, '"'));
            return parsed[1] || thumbnail;
          } catch {
            return thumbnail;
          }
        })()
      : thumbnail;

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    if (naturalHeight > naturalWidth * 1.3) {
      setAspectRatioClass("aspect-portrait");
    } else {
      setAspectRatioClass("aspect-square");
    }
  };

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

  const sortedPlatforms = [...mainPlatforms].sort((a, b) => {
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();

    const aIsSelected = activeFilterSet.has(aLower);
    const bIsSelected = activeFilterSet.has(bLower);

    if (aIsSelected && !bIsSelected) return -1;
    if (!aIsSelected && bIsSelected) return 1;

    if (aLower === "google ads") return -1;
    if (bLower === "google ads") return 1;

    return 0;
  });

  const sortedSubOptions = [...subOptions].sort((a, b) => {
    const aIsSelected = activeFilterSet.has(a.toLowerCase());
    const bIsSelected = activeFilterSet.has(b.toLowerCase());

    if (aIsSelected && !bIsSelected) return -1;
    if (!aIsSelected && bIsSelected) return 1;
    return 0;
  });

  const hasAnyFilterApplied = activeFilterSet.size > 0;

  return (
    <div className={`ref-template-card ${aspectRatioClass}`}>
      {/* Thumbnail Stage with Blur & Hover Overlay */}
      <div className="ref-card-media-stage">
        <img
          src={imageLink || null}
          alt={title}
          className="ref-card-img"
          onLoad={handleImageLoad}
          loading="lazy"
        />

        {/* Hover View Details Trigger */}
        <div className="ref-card-hover-overlay">
          <Link href={`/template/${id}`} className="ref-hover-view-btn">
            <svg className="btn-eye-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
            </svg>
            <span>View Details</span>
          </Link>
        </div>
      </div>

      {/* Content Stage */}
      <div className="ref-card-body">
        <div className="ref-title-group">
          <h3 className="ref-card-title">{title}</h3>
          {client_name && <span className="ref-client-subtitle">{client_name}</span>}
          {desc && <p className="ref-card-desc">{desc}</p>}
        </div>

        {/* Separate Rows for Main Platforms and Sub-Options */}
        {(sortedPlatforms.length > 0 || sortedSubOptions.length > 0) && (
          <div className="ref-tags-container">
            {/* Row 1: Main Platforms */}
            {sortedPlatforms.length > 0 && (
              <div className="ref-tags-row-block">
                <span className="ref-tags-label">
                  {hasAnyFilterApplied ? "Available for:" : "Available for Platforms:"}
                </span>
                <div className="ref-tags-pills-row">
                  {sortedPlatforms.map((platform, idx) => (
                    <span key={`main-${platform}-${idx}`} className="ref-pill main-pill">
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Row 2: Sub Options / Features (Separate Dedicated Row) */}
            {sortedSubOptions.length > 0 && (
              <div className="ref-tags-row-block">
                <span className="ref-tags-label sub-label">Features / Formats:</span>
                <div className="ref-tags-pills-row">
                  {sortedSubOptions.map((subTag, idx) => (
                    <span key={`sub-${subTag}-${idx}`} className="ref-pill sub-pill">
                      {subTag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;