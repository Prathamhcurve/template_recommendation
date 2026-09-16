import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import Button from "../components/Button";
import Showcase from "../components/showcase";
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
import { fetchSelected } from "../features/templates/templateSlice";

const Preview = () => {
  const { loading, template, list } = useSelector((state) => state.templates);

  const dis = useDispatch();
  const navigate = useNavigate();

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

  if (loading) {
    return <Loader size="lg" color="#f97316" />;
  }

  return (
    <>
      <section id="temp_details">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <h1 className="temp_title">{template?.title.split(" - ")[0]}</h1>

        <div className="flex w-full">
          <div className="temp_img_container">
            <div className="temp_image">
              <img src={imageLink} alt={template?.title} />
            </div>

            <Link
              to={`https://selfserve.hockeycurve.com/public/adtag/demo.php?d=${encodedPreview}`}
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
                  <h4 className="info_desc">{template?.platforms}</h4>
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
                {template?.requirements.creative_requirements.map((req) => (
                  <li key={req} className="requirement_list_item">
                    <FontAwesomeIcon icon={faCircleDot} className="checkIcon" />
                    {req.includes("docs.google.com") ? (
                      <Link to={req} target="_blank">
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
                {template?.requirements.ad_ops_requirements.map((req) => (
                  <li key={req} className="requirement_list_item">
                    <FontAwesomeIcon icon={faCircleDot} className="checkIcon" />
                    {req.includes("docs.google.com") ? (
                      <Link to={req} target="_blank">
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
