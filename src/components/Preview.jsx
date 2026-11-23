"use client";

import { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import Button from "@/components/Button";
import Showcase from "@/components/Showcase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowTrendUp,
  faClockRotateLeft,
  faLayerGroup,
  faPenRuler,
  faSliders,
  faEye,
  faCircleDot,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { fetchSelected } from "@/features/templates/templateSlice";

const Preview = () => {
  const { loading, template, list } = useSelector((state) => state.templates);

  const dis = useDispatch();
  const router = useRouter();

  const imageLink =
    template?.videos_images !== undefined && template?.videos_images !== null && template?.videos_images !== ""
      ? (() => {
          try {
            const parsed = JSON.parse(template?.videos_images.replace(/'/g, '"'));
            return parsed[1] || template?.thumbnail;
          } catch {
            return template?.thumbnail;
          }
        })()
      : template?.thumbnail;

  const encodedPreview = template?.adpreviews ? btoa(template?.adpreviews) : "";

  useEffect(() => {
    if (template?.recommended_templates) {
      dis(fetchSelected(template.recommended_templates));
    }
  }, [template, dis]);

  // Context-Aware Title Similarity Filtering (e.g. Carousel -> Carousel Ads)
  const similarTemplates = useMemo(() => {
    if (!list || !Array.isArray(list) || !template) return [];

    const currentTitle = (template.title || "").toLowerCase();
    const currentId = template.id;

    // Extract core format terms e.g., 'carousel', 'canvas', 'tap', 'survey', 'gallery', 'video'
    const keyTerms = [
      "carousel",
      "canvas",
      "tap",
      "survey",
      "gallery",
      "video",
      "richmedia",
      "banner",
      "feed",
      "3d",
      "scratch",
    ].filter((term) => currentTitle.includes(term));

    const matches = list.filter((item) => {
      if (item.id === currentId) return false;
      const itemTitle = (item.title || "").toLowerCase();
      const itemDesc = (item.desc || "").toLowerCase();

      // Check if title or desc shares any core format keyword
      if (keyTerms.length > 0) {
        return keyTerms.some((term) => itemTitle.includes(term) || itemDesc.includes(term));
      }

      // Fallback: Check if category or client matches
      return (
        item.industry_tag1 === template.industry_tag1 ||
        item.client_name === template.client_name
      );
    });

    // If matches are found, return them; otherwise fallback to other catalog items
    return matches.length > 0 ? matches : list.filter((i) => i.id !== currentId);
  }, [list, template]);

  const getDynamicPlatforms = (rawMeta, fallbackPlatforms) => {
    if (!rawMeta) return fallbackPlatforms || "N/A";

    const str = typeof rawMeta === "object" ? JSON.stringify(rawMeta) : String(rawMeta).trim();

    if (str.startsWith("{") || str.startsWith("[")) {
      try {
        const jsonString = str.startsWith("{") && !str.endsWith("]") ? `[${str}]` : str;
        const parsed = JSON.parse(jsonString);
        const items = Array.isArray(parsed) ? parsed : [parsed];

        const platformList = [];

        items.forEach((item) => {
          if (typeof item === "object" && item !== null) {
            const name = item.name || item.id;
            if (name) {
              const subOpts =
                Array.isArray(item.subOptions) && item.subOptions.length > 0
                  ? item.subOptions.filter(Boolean).join(", ")
                  : null;

              if (subOpts) {
                platformList.push(`${name} (${subOpts})`);
              } else {
                platformList.push(name);
              }
            }
          } else if (typeof item === "string") {
            platformList.push(item);
          }
        });

        if (platformList.length > 0) {
          return Array.from(new Set(platformList)).join(", ");
        }
      } catch (e) {
        // Fallback
      }
    }

    const tags = str.split(",").map((t) => t.trim()).filter(Boolean);
    return tags.length > 0 ? tags.join(", ") : fallbackPlatforms || "N/A";
  };

  const dynamicPlatformsDisplay = getDynamicPlatforms(
    template?.meta_tags,
    template?.platforms
  );

  if (loading) {
    return <Loader size="lg" color="#38bdf8" />;
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: template?.title,
    description: template?.desc,
    image: imageLink,
    identifier: template?.id,
    keywords: template?.meta_tags,
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "CTR",
        value: `${template?.ctr}`,
      },
      {
        "@type": "PropertyValue",
        name: "Platforms",
        value: dynamicPlatformsDisplay,
      },
      {
        "@type": "PropertyValue",
        name: "Development Time",
        value: template?.dev_time,
      },
    ],
  };

  return (
    <div className="preview-page-wrapper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section id="temp_details" className="container">
        {/* Back Navigation Bar */}
        <div className="preview-top-nav">
          <button className="back-btn" onClick={() => router.back()} type="button">
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Back to Gallery</span>
          </button>
        </div>

        {/* Header Title Section */}
        <div className="details-header-section">
          <span className="details-badge-label">CREATIVE SPECIFICATIONS</span>
          <h1 className="temp_title">{template?.title?.split(" - ")[0]}</h1>
        </div>

        {/* Main 2-Column Hero Stage */}
        <div className="preview-main-stage">
          {/* Left Media Stage */}
          <div className="temp_img_container">
            <div className="temp_image">
              <img
                src={imageLink || "https://s.hcurvecdn.com/selfserve_v2/images/f_logo.webp"}
                alt={template?.title || "Template Preview"}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://s.hcurvecdn.com/selfserve_v2/images/f_logo.webp";
                }}
              />
            </div>

            <div className="preview-actions">
              {encodedPreview && (
                <Link
                  href={`https://selfserve.hockeycurve.com/public/adtag/demo.php?d=${encodedPreview}`}
                  target="_blank"
                  className="w-full"
                >
                  <Button
                    text="View Demo"
                    type="button"
                    icon={faEye}
                    btnType="primary"
                    width="full"
                  />
                </Link>
              )}

              {template?.special_id && (
                <Link
                  href={`https://selfserve.hockeycurve.com/public/adspecial/index.php?id=${template?.special_id}`}
                  target="_blank"
                  className="w-full"
                >
                  <Button
                    text="View Variations"
                    type="button"
                    icon={faLayerGroup}
                    btnType="secondary"
                    width="full"
                  />
                </Link>
              )}
            </div>
          </div>

          {/* Right Metrics & Details Stage */}
          <div className="temp_info">
            <div className="desc-block">
              <h3 className="info_title">Overview & Experience</h3>
              <p className="info_desc">
                {template?.desc ||
                  "High-engagement interactive ad creative engineered for multi-screen campaign performance and dynamic user interactions."}
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="temp_info_grid">
              <div className="info_card">
                <div className="icon flex-center">
                  <FontAwesomeIcon icon={faArrowTrendUp} />
                </div>
                <div className="info_content">
                  <p className="info_title">Performance</p>
                  <h4 className="info_desc">{template?.ctr || "0.85"}% CTR</h4>
                </div>
              </div>

              <div className="info_card">
                <div className="icon flex-center">
                  <FontAwesomeIcon icon={faClockRotateLeft} />
                </div>
                <div className="info_content">
                  <p className="info_title">Dev Turnaround</p>
                  <h4 className="info_desc">{template?.dev_time || "24-48 Hours"}</h4>
                </div>
              </div>

              <div className="info_card full-width-card">
                <div className="icon flex-center">
                  <FontAwesomeIcon icon={faLayerGroup} />
                </div>
                <div className="info_content">
                  <p className="info_title">Supported Platforms</p>
                  <h4 className="info_desc">{dynamicPlatformsDisplay}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Requirements Section */}
        <div className="requirements-stage-grid">
          <div className="req_card">
            <div className="info_content">
              <div className="req-header-row">
                <div className="icon flex-center">
                  <FontAwesomeIcon icon={faPenRuler} />
                </div>
                <p className="info_title">Creative Asset Requirements</p>
              </div>

              <ul className="requirement_list">
                {template?.requirements?.creative_requirements?.length > 0 ? (
                  template.requirements.creative_requirements.map((req, idx) => (
                    <li key={idx} className="requirement_list_item">
                      <FontAwesomeIcon icon={faCircleDot} className="checkIcon" />
                      {req.includes("docs.google.com") ? (
                        <Link href={req} target="_blank" className="req-link">
                          <h4>Feed Sheet Specs</h4>
                        </Link>
                      ) : (
                        <h4>{req}</h4>
                      )}
                    </li>
                  ))
                ) : (
                  <li className="requirement_list_item">
                    <FontAwesomeIcon icon={faCircleDot} className="checkIcon" />
                    <h4>Standard PSD/Figma layering or MP4/HTML5 assets required.</h4>
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="req_card">
            <div className="info_content">
              <div className="req-header-row">
                <div className="icon flex-center">
                  <FontAwesomeIcon icon={faSliders} />
                </div>
                <p className="info_title">Ad Ops & Delivery Requirements</p>
              </div>

              <ul className="requirement_list">
                {template?.requirements?.ad_ops_requirements?.length > 0 ? (
                  template.requirements.ad_ops_requirements.map((req, idx) => (
                    <li key={idx} className="requirement_list_item">
                      <FontAwesomeIcon icon={faCircleDot} className="checkIcon" />
                      {req.includes("docs.google.com") ? (
                        <Link href={req} target="_blank" className="req-link">
                          <h4>Feed Sheet Specs</h4>
                        </Link>
                      ) : (
                        <h4>{req}</h4>
                      )}
                    </li>
                  ))
                ) : (
                  <li className="requirement_list_item">
                    <FontAwesomeIcon icon={faCircleDot} className="checkIcon" />
                    <h4>Standard 3rd-party tag delivery (DCM, DV360, Google Ads).</h4>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Templates Grid rendered directly in Pinterest-style Masonry */}
      {list && (
        <section id="recommended" className="container">
          <div className="recommended-heading-block">
            <span className="details-badge-label">CURATED SELECTION</span>
            <h2 className="section_title">Similar Recommended Templates</h2>
          </div>

          <Showcase isRecommended={true} customTemplates={similarTemplates} />
        </section>
      )}
    </div>
  );
};

export default Preview;