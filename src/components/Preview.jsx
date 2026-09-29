"use client";

import { useEffect } from "react";
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
    template?.videos_images !== undefined
      ? JSON.parse(template?.videos_images.replace(/'/g, '"'))[1]
      : template?.thumbnail;

  const encodedPreview = btoa(template?.adpreviews);

  useEffect(() => {
    if (template?.recommended_templates) {
      dis(fetchSelected(template.recommended_templates));
    }
  }, [template, dis]);

  // Parser to build dynamic comma-separated platform strings e.g., "Google Ads (Demand Gen), Meta, DV360"
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
              const subOpts = Array.isArray(item.subOptions) && item.subOptions.length > 0
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
        // Fallback if JSON parse fails
      }
    }

    // String fallback if meta_tags is a standard string
    const tags = str.split(",").map((t) => t.trim()).filter(Boolean);
    return tags.length > 0 ? tags.join(", ") : fallbackPlatforms || "N/A";
  };

  const dynamicPlatformsDisplay = getDynamicPlatforms(
    template?.meta_tags,
    template?.platforms
  );

  if (loading) {
    return <Loader size="lg" color="#f97316" />;
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
      {
        "@type": "PropertyValue",
        name: "Creative Requirements",
        value: template?.requirements?.creative_requirements?.join(", "),
      },
      {
        "@type": "PropertyValue",
        name: "Ad Ops Requirements",
        value: template?.requirements?.ad_ops_requirements?.join(", "),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section id="temp_details">
        <button className="back-btn" onClick={() => router.back()}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <h1 className="temp_title">{template?.title?.split(" - ")[0]}</h1>

        <div className="flex w-full">
          <div className="temp_img_container">
            <div className="temp_image">
              <img src={imageLink} alt={template?.title} />
            </div>

            <div className="preview-actions">
              <Link
                href={`https://selfserve.hockeycurve.com/public/adtag/demo.php?d=${encodedPreview}`}
                target="_blank"
              >
                <Button
                  text="View Demo"
                  type={"button"}
                  icon={faEye}
                  btnType="primary"
                  width={"full"}
                />
              </Link>

              {template?.special_id && (
                <Link
                  href={`https://selfserve.hockeycurve.com/public/adspecial/index.php?id=${template?.special_id}`}
                  target="_blank"
                >
                  <Button
                    text="View Variations"
                    type={"button"}
                    icon={faLayerGroup}
                    btnType="secondary"
                    width={"full"}
                  />
                </Link>
              )}
            </div>
          </div>

          <div className="temp_info w-full">
            <h3 className="info_title">Description:</h3>
            <p className="info_desc">{template?.desc}</p>

            <div className="temp_info_grid">
              <div className="info_card">
                <div className="icon flex-center">
                  <FontAwesomeIcon icon={faArrowTrendUp} />
                </div>
                <div className="info_content">
                  <p className="info_title">Performance:</p>
                  <h4 className="info_desc">{template?.ctr}% CTR</h4>
                </div>
              </div>

              <div className="info_card">
                <div className="icon flex-center">
                  <FontAwesomeIcon icon={faClockRotateLeft} />
                </div>
                <div className="info_content">
                  <p className="info_title">Development Time:</p>
                  <h4 className="info_desc">{template?.dev_time}</h4>
                </div>
              </div>

              <div className="info_card">
                <div className="icon flex-center">
                  <FontAwesomeIcon icon={faLayerGroup} />
                </div>
                <div className="info_content">
                  <p className="info_title">Platforms:</p>
                  <h4 className="info_desc">{dynamicPlatformsDisplay}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-stretch w-full">
          <div className="req_card">
            <div className="info_content">
              <div className="flex">
                <div className="icon flex-center">
                  <FontAwesomeIcon icon={faPenRuler} />
                </div>
                <p className="info_title">Creative Requirements:</p>
              </div>
              <ul className="requirement_list">
                {template?.requirements?.creative_requirements?.map((req) => (
                  <li key={req} className="requirement_list_item">
                    <FontAwesomeIcon icon={faCircleDot} className="checkIcon" />
                    {req.includes("docs.google.com") ? (
                      <Link href={req} target="_blank">
                        <h4>Feed Sheet</h4>
                      </Link>
                    ) : (
                      <h4>{req}</h4>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="req_card">
            <div className="info_content">
              <div className="flex">
                <div className="icon flex-center">
                  <FontAwesomeIcon icon={faSliders} />
                </div>
                <p className="info_title">Ad Ops Requirements:</p>
              </div>
              <ul className="requirement_list">
                {template?.requirements?.ad_ops_requirements?.map((req) => (
                  <li key={req} className="requirement_list_item">
                    <FontAwesomeIcon icon={faCircleDot} className="checkIcon" />
                    {req.includes("docs.google.com") ? (
                      <Link href={req} target="_blank">
                        <h4>Feed Sheet</h4>
                      </Link>
                    ) : (
                      <h4>{req}</h4>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {list && (
        <section id="recommended">
          <h2 className="section_title">Recommended Templates</h2>

          <Showcase isRecommended={true} />
        </section>
      )}
    </>
  );
};

export default Preview;