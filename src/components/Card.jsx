"use client";

import Link from "next/link";
import { useSelector } from "react-redux";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import Button from "./Button";

const Card = ({ template }) => {
  const { id, title, desc, thumbnail, meta_tags, videos_images } = template;

  // Get dynamic platform options from Redux to distinguish main platforms from sub-options
  const reduxPlatforms = useSelector(
    (state) => state.filters?.filters?.platforms || []
  );

  const imageLink =
    videos_images !== undefined
      ? JSON.parse(videos_images.replace(/'/g, '"'))[1]
      : thumbnail;

  // Robust parser to split main platforms vs true sub-options
  const parseMetaTags = (rawMeta) => {
    let mainPlatforms = [];
    let subOptions = [];

    if (!rawMeta) return { mainPlatforms, subOptions };

    const str = typeof rawMeta === "object" ? JSON.stringify(rawMeta) : String(rawMeta).trim();

    // 1. Handle JSON Object or JSON Array / Side-by-side JSON objects
    if (str.startsWith("{") || str.startsWith("[")) {
      try {
        // Automatically wrap un-bracketed side-by-side JSON objects into a valid JSON array
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
        // RegEx fallback to pull clean platform names directly out of invalid JSON strings
        const matches = [...str.matchAll(/"(?:name|id)":\s*"([^"]+)"/g)];
        if (matches.length > 0) {
          const names = Array.from(new Set(matches.map((m) => m[1])));
          return { mainPlatforms: names, subOptions: [] };
        }
      }
    }

    // 2. Handle Plain Comma-Separated Strings (e.g. "YouTube, Meta")
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
        {(mainPlatforms.length > 0 || subOptions.length > 0) && (
          <div
            className="tags-wrapper"
            style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "12px" }}
          >
            {/* Row 1: All Main Dropdown Platforms (e.g. Vast, DV360 side by side) */}
            {mainPlatforms.length > 0 && (
              <div className="tags main-tags" style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {mainPlatforms.map((platform, idx) => (
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

            {/* Row 2: Sub-options Tags */}
            {subOptions.length > 0 && (
              <div className="tags sub-tags" style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {subOptions.map((subTag, idx) => (
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