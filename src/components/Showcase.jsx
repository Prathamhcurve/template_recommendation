"use client";

import { useState, useMemo, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import Link from "next/link";
import { setPage } from "@/features/ui/uiSlice";
import Card from "./Card";
import Pagination from "./Pagination";
import Loader from "./Loader";

// Swiper JS Imports
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCreative, Autoplay } from "swiper/modules";

// Swiper CSS
import "swiper/css";
import "swiper/css/effect-creative";

// Helper to resolve thumbnail links matching Card.jsx
const resolveThumbnailUrl = (template) => {
  if (!template) return "https://s.hcurvecdn.com/selfserve_v2/images/f_logo.webp";

  const { videos_images, thumbnail } = template;

  if (videos_images !== undefined && videos_images !== null && videos_images !== "") {
    try {
      const parsed = JSON.parse(videos_images.replace(/'/g, '"'));
      if (Array.isArray(parsed) && parsed[1]) {
        return parsed[1];
      }
    } catch (e) {
      console.error("Failed to parse videos_images:", e);
    }
  }

  return thumbnail || "https://s.hcurvecdn.com/selfserve_v2/images/f_logo.webp";
};

// Skeleton Placeholder for Featured Hero Carousel Loading State
const HeroDeckSkeleton = () => (
  <div className="aesthetic-hero-card hero-skeleton-card">
    <div className="card-media-stage skeleton-shimmer-box">
      <div className="skeleton-pulse-badge" />
    </div>
    <div className="card-details-stage">
      <div className="details-header-row" style={{ gap: "0.6rem" }}>
        <div className="skeleton-line title" style={{ width: "85%", height: "1.2rem" }} />
        <div className="skeleton-line text" style={{ width: "45%", height: "0.75rem" }} />
      </div>
      <div className="skeleton-line text" style={{ width: "95%", height: "0.85rem", marginTop: "0.5rem" }} />
      <div className="skeleton-line text short" style={{ width: "70%", height: "0.85rem" }} />
      <div className="card-action-bar" style={{ borderTop: "1px solid var(--border-red)", marginTop: "0.5rem" }}>
        <div className="skeleton-line btn" style={{ width: "120px", height: "34px", borderRadius: "6px" }} />
      </div>
    </div>
  </div>
);

// Compact Specialized Card for Horizontal Category Rows
const CategoryCard = ({ template }) => {
  const { id, title, thumbnail, meta_tags, videos_images, client_name } = template;

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

  const imageSrc =
    videos_images !== undefined && videos_images !== null && videos_images !== ""
      ? (() => {
          try {
            const parsed = JSON.parse(videos_images.replace(/'/g, '"'));
            return parsed[1] || thumbnail;
          } catch {
            return thumbnail;
          }
        })()
      : thumbnail || "https://s.hcurvecdn.com/selfserve_v2/images/f_logo.webp";

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

  const { mainPlatforms, subOptions } = useMemo(
    () => parseMetaTags(meta_tags),
    [meta_tags, reduxPlatforms]
  );

  const sortedPlatforms = useMemo(() => {
    return [...mainPlatforms].sort((a, b) => {
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
  }, [mainPlatforms, activeFilterSet]);

  const sortedSubOptions = useMemo(() => {
    return [...subOptions].sort((a, b) => {
      const aIsSelected = activeFilterSet.has(a.toLowerCase());
      const bIsSelected = activeFilterSet.has(b.toLowerCase());

      if (aIsSelected && !bIsSelected) return -1;
      if (!aIsSelected && bIsSelected) return 1;
      return 0;
    });
  }, [subOptions, activeFilterSet]);

  const hasAnyFilterApplied = activeFilterSet.size > 0;
  const hasRemainingTags = sortedPlatforms.length > 0 || sortedSubOptions.length > 0;

  return (
    <div className="compact-category-card">
      <div className="compact-card-media">
        <img
          src={imageSrc}
          alt={title || "Template Thumbnail"}
          className="compact-card-img"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://s.hcurvecdn.com/selfserve_v2/images/f_logo.webp";
          }}
        />
        <div className="compact-media-hover-overlay">
          <Link href={`/template/${id}`} className="compact-view-btn">
            View
          </Link>
        </div>
      </div>

      <div className="compact-card-body">
        <h4 className="compact-card-title">{title}</h4>

        {hasRemainingTags && (
          <div className="compact-meta-section">
            <span className="compact-meta-label">
              {hasAnyFilterApplied ? "Available for:" : "Available for Platforms:"}
            </span>

            <div className="compact-tag-pills-row">
              {sortedPlatforms.map((platform, idx) => (
                <span key={`main-${platform}-${idx}`} className="compact-platform-pill active-blue">
                  {platform}
                </span>
              ))}

              {sortedSubOptions.map((subTag, idx) => (
                <span key={`sub-${subTag}-${idx}`} className="compact-platform-pill muted-dark">
                  {subTag}
                </span>
              ))}
            </div>
          </div>
        )}

        {client_name && <span className="compact-card-client">{client_name}</span>}
      </div>
    </div>
  );
};

// 1. Hero Showcase Component
export const HeroShowcase = () => {
  const { list: data, loading } = useSelector((state) => state.templates || {});

  const top10Featured = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    const validTemplates = data.filter(
      (t) => !t?.desc?.toLowerCase().includes("to be deleted")
    );

    const sortedByUsage = [...validTemplates].sort((a, b) => {
      const usageA = Number(a.downloads || a.usage_count || a.views || a.used_count || 0);
      const usageB = Number(b.downloads || b.usage_count || b.views || b.used_count || 0);
      return usageB - usageA;
    });

    return sortedByUsage.slice(0, 10);
  }, [data]);

  const handleBrowseClick = () => {
    const libraryElement = document.getElementById("library") || document.getElementById("showcase");
    if (libraryElement) {
      const yOffset = -80;
      const y = libraryElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <section className="showcase-hero-banner">
      <div className="container">
        <div className="showcase-hero-grid">
          
          <div className="hero-left-content">
            <div className="hero-badge">
              <span>HOCKEYCURVE CREATIVE HUB</span>
              <span className="dot">•</span>
              <span>ALL-TIME TOP PERFORMERS</span>
            </div>

            <h1 className="hero-main-title">
              Templates<br />
              worth<br />
              <em>exploring.</em>
            </h1>

            <p className="hero-subtext">
              Discover interactive ad experiences, high-engagement creative formats, and campaign ideas engineered for your next brief.
            </p>

            <div className="hero-actions">
              <button type="button" onClick={handleBrowseClick} className="btn-browse-library">
                <span>Browse library</span>
                <svg className="btn-chevron-down" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="hero-right-carousel">
            <div className="hero-deck-stage">
              {loading || top10Featured.length === 0 ? (
                <HeroDeckSkeleton />
              ) : (
                <Swiper
                  modules={[EffectCreative, Autoplay]}
                  effect="creative"
                  grabCursor={true}
                  centeredSlides={true}
                  centeredSlidesBounds={false}
                  initialSlide={2}
                  slidesPerView={1}
                  loop={top10Featured.length > 1}
                  speed={750}
                  autoplay={{
                    delay: 3500,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                  }}
                  creativeEffect={{
                    limitProgress: 3,
                    shadowPerProgress: false,
                    prev: {
                      shadow: false,
                      translate: ["-38%", 0, -220],
                      scale: 0.82,
                      opacity: 0.75,
                    },
                    next: {
                      shadow: false,
                      translate: ["38%", 0, -220],
                      scale: 0.82,
                      opacity: 0.75,
                    },
                  }}
                  watchSlidesProgress={true}
                  observer={true}
                  observeParents={true}
                  className="creative-deck-swiper"
                >
                  {top10Featured.map((template, idx) => {
                    const imageSrc = resolveThumbnailUrl(template);

                    return (
                      <SwiperSlide key={template.id || idx} className="creative-deck-slide">
                        <div className="aesthetic-hero-card">
                          
                          <div className="card-media-stage">
                            <img
                              src={imageSrc}
                              alt={template.title || "Template Thumbnail"}
                              className="card-media-image"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://s.hcurvecdn.com/selfserve_v2/images/f_logo.webp";
                              }}
                            />
                            
                            <div className="media-gradient-veil" />

                            {template.industry_tag1 && (
                              <span className="floating-category-badge">
                                {template.industry_tag1}
                              </span>
                            )}
                          </div>

                          <div className="card-details-stage">
                            <div className="details-header-row">
                              <h3 className="aesthetic-card-title">
                                {template.title}
                              </h3>
                              
                              <div className="card-metadata-row">
                                <span className="meta-info">Interactive</span>
                                {template.client_name && (
                                  <>
                                    <span className="meta-dot">•</span>
                                    <span className="meta-info">{template.client_name}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            <p className="aesthetic-card-desc">
                              {template.desc ||
                               template.description ||
                               "High-engagement interactive ad creative engineered for multi-screen campaigns."}
                            </p>

                            <div className="card-action-bar">
                              <Link 
                                href={`/template/${template.id}`} 
                                className="netflix-red-btn"
                              >
                                <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                                <span>View Template</span>
                              </Link>
                            </div>
                          </div>

                        </div>
                      </SwiperSlide>
                    );
                  })}
                </Swiper>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

// 2. Main Showcase Component
const Showcase = ({ isRecommended = false, customTemplates = null }) => {
  const dispatch = useDispatch();
  const [localPage, setLocalPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState(null);

  const showcaseRef = useRef(null);

  const { enabled, searchQuery } = useSelector((state) => state.filters || {});
  const { list: data, loading } = useSelector((state) => state.templates || {});

  const globalPage = useSelector((state) => state.ui.page);
  const page = isRecommended ? localPage : globalPage;

  const handleSetPage = (p) => {
    if (isRecommended) {
      setLocalPage(p);
    } else {
      dispatch(setPage(p));
    }
  };

  const validData = useMemo(() => {
    const dataset = customTemplates && customTemplates.length > 0 ? customTemplates : data;
    return dataset
      ? dataset.filter(
          (template) =>
            !template?.desc?.toLowerCase().includes("to be deleted")
        )
      : [];
  }, [data, customTemplates]);

  const filteredData = useMemo(() => {
    if (!searchQuery || searchQuery.trim() === "") return validData;
    const query = searchQuery.toLowerCase().trim();

    return validData.filter((template) => {
      const titleMatch = (template?.title || "").toLowerCase().includes(query);
      const descMatch = (template?.desc || "").toLowerCase().includes(query);
      const clientMatch = (template?.client_name || template?.client || "").toLowerCase().includes(query);
      const categoryMatch = (template?.industry_tag1 || "").toLowerCase().includes(query);
      const platformMatch = (template?.platform || "").toLowerCase().includes(query);
      const metaMatch = (template?.meta_tags || "").toLowerCase().includes(query);

      return titleMatch || descMatch || clientMatch || categoryMatch || platformMatch || metaMatch;
    });
  }, [validData, searchQuery]);

  const interactiveTemplates = useMemo(() => {
    return filteredData.filter((t) => {
      const str = `${t?.title || ""} ${t?.desc || ""} ${t?.meta_tags || ""}`.toLowerCase();
      return str.includes("interactive");
    });
  }, [filteredData]);

  const dynamicTemplates = useMemo(() => {
    return filteredData.filter((t) => {
      const str = `${t?.title || ""} ${t?.desc || ""} ${t?.meta_tags || ""}`.toLowerCase();
      return str.includes("dynamic");
    });
  }, [filteredData]);

  const isFilteringActive = Boolean(searchQuery?.trim() || enabled);
  // Force single Masonry view if this is the Recommended section or if a filter/category is focused
  const isSingleGridView = isRecommended || isFilteringActive || activeCategory !== null;

  const currentDataset = useMemo(() => {
    if (activeCategory === "interactive") return interactiveTemplates;
    if (activeCategory === "dynamic") return dynamicTemplates;
    return filteredData;
  }, [activeCategory, interactiveTemplates, dynamicTemplates, filteredData]);

  const pageSize = isRecommended ? 12 : 50;
  const totalItems = currentDataset.length;
  const startIndex = (page - 1) * pageSize;
  const currentPaginatedData = currentDataset.slice(startIndex, startIndex + pageSize);

  const handleSeeMore = (catKey) => {
    setActiveCategory(catKey);
    handleSetPage(1);
  };

  const handleBackToAllCategories = () => {
    setActiveCategory(null);
    handleSetPage(1);
  };

  return (
    <section id="showcase" ref={showcaseRef} className="showcase-container">
      {loading ? (
        <Loader type="skeleton" count={6} />
      ) : (
        <>
          {isSingleGridView ? (
            <div className="focused-category-wrapper">
              {!isRecommended && (
                <div className="category-header-bar">
                  {activeCategory !== null && (
                    <button
                      type="button"
                      onClick={handleBackToAllCategories}
                      className="btn-back-categories"
                    >
                      ← Back to All Categories
                    </button>
                  )}

                  <h2 className="focused-category-title">
                    {searchQuery && `Results for "${searchQuery}"`}
                    {!searchQuery && enabled && activeCategory === null && "Filtered Templates"}
                    {activeCategory === "interactive" && "Interactive Ad Banners"}
                    {activeCategory === "dynamic" && "Dynamic Ad Banners"}
                    <span className="focused-count-pill">({totalItems})</span>
                  </h2>
                </div>
              )}

              {/* Pinterest Masonry Grid */}
              <div className="pinterest-masonry">
                {currentPaginatedData.length > 0 ? (
                  currentPaginatedData.map((template) => (
                    <div className="masonry-item" key={template.id}>
                      <Card template={template} />
                    </div>
                  ))
                ) : (
                  <h2>No similar templates found matching this creative</h2>
                )}
              </div>

              {!isRecommended && (
                <Pagination
                  page={page}
                  pageSize={pageSize}
                  totalItems={totalItems}
                  setPage={handleSetPage}
                />
              )}
            </div>
          ) : (
            <div className="netflix-categories-container">
              
              {/* Row 1: Interactive Ad Banners */}
              <div className="category-row-section">
                <div className="category-row-header">
                  <h2 className="category-row-title">Interactive Ad Banners</h2>
                  <button
                    type="button"
                    onClick={() => handleSeeMore("interactive")}
                    className="see-more-link"
                  >
                    See More →
                  </button>
                </div>

                <div className="category-cards-fit-grid">
                  {interactiveTemplates.length > 0 ? (
                    interactiveTemplates.slice(0, 6).map((template) => (
                      <CategoryCard key={template.id} template={template} />
                    ))
                  ) : (
                    <p className="no-category-text">No interactive ad banners available</p>
                  )}
                </div>
              </div>

              {/* Row 2: Dynamic Ad Banners */}
              <div className="category-row-section">
                <div className="category-row-header">
                  <h2 className="category-row-title">Dynamic Ad Banners</h2>
                  <button
                    type="button"
                    onClick={() => handleSeeMore("dynamic")}
                    className="see-more-link"
                  >
                    See More →
                  </button>
                </div>

                <div className="category-cards-fit-grid">
                  {dynamicTemplates.length > 0 ? (
                    dynamicTemplates.slice(0, 6).map((template) => (
                      <CategoryCard key={template.id} template={template} />
                    ))
                  ) : (
                    <p className="no-category-text">No dynamic ad banners available</p>
                  )}
                </div>
              </div>

            </div>
          )}
        </>
      )}
    </section>
  );
};

export default Showcase;