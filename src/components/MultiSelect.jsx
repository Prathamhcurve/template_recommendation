"use client";

import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleChevronDown,
  faXmarkCircle,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import Loader from "./Loader";

const MultiSelect = ({
  options = [],
  placeholder = "Select...",
  selected = [],
  onSelectionChange = () => {},
  position = "static",
  forceClose = false,
  disabled = false,
  badge = null,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const [subMenuTop, setSubMenuTop] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const { loading, error } = useSelector((state) => state.filters || {});

  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const optionsWrapperRef = useRef(null);

  useEffect(() => {
    if (forceClose) {
      setDropdownOpen(false);
      setActiveSubMenu(null);
    }
  }, [forceClose]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.isConnected) return;

      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
        setActiveSubMenu(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    if (disabled) return;
    setDropdownOpen((prev) => !prev);
    setActiveSubMenu(null);

    setTimeout(() => {
      if (!dropdownOpen && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 100);
  };

  // Safe Key & Label Extraction
  const getRawKey = (item) => {
    if (item === null || item === undefined) return "";
    if (typeof item === "object") {
      return String(item.id ?? item.name ?? item.label ?? "");
    }
    return String(item);
  };

  const getOptionLabel = (opt) => {
    if (opt === null || opt === undefined) return "";
    if (typeof opt === "object") {
      return String(opt.name ?? opt.label ?? opt.id ?? "");
    }
    return String(opt);
  };

  const isSameOption = (a, b) => getRawKey(a) === getRawKey(b);

  const handleSelect = (e, optionItem) => {
    e.stopPropagation();
    const valueToAdd = getOptionLabel(optionItem);

    if (!valueToAdd) return;

    if (!selected.some((s) => getRawKey(s) === valueToAdd)) {
      const updated = [...selected, valueToAdd];
      onSelectionChange?.(updated);
    }

    setSearchTerm("");
    setActiveSubMenu(null);
    setDropdownOpen(false);
  };

  const removeOption = (option) => {
    const updated = selected.filter((s) => !isSameOption(s, option));
    onSelectionChange?.(updated);
  };

  const handleScrollStop = (e) => {
    e.stopPropagation();
  };

  // Filter options directly
  const filteredOptions = (options || []).filter((opt) => {
    if (!opt) return false;
    const term = (searchTerm || "").toLowerCase();

    const labelMatches = getOptionLabel(opt).toLowerCase().includes(term);

    const hasSubMatches =
      typeof opt === "object" &&
      Array.isArray(opt?.subOptions) &&
      opt.subOptions.some((sub) =>
        getOptionLabel(sub).toLowerCase().includes(term)
      );

    return labelMatches || hasSubMatches;
  });

  const activeOptionObj = (options || []).find(
    (opt) => getRawKey(opt) === activeSubMenu
  );

  return (
    <div
      className={`dropdown ${disabled ? "disabled" : ""}`}
      ref={dropdownRef}
      style={{ position: "relative", width: "100%" }}
    >
      {/* Dropdown Container */}
      <div
        className={`dropdown-btn ${disabled ? "disabled" : ""}`}
        onClick={toggleDropdown}
      >
        <div className="chips-container">
          {selected.length === 0 && (
            <span className="placeholder">
              {placeholder}
              {badge && <span className="beta-badge">{badge}</span>}
            </span>
          )}
          {selected.map((item) => (
            <div
              key={getRawKey(item)}
              className="chip"
              onClick={(e) => e.stopPropagation()}
            >
              {getOptionLabel(item)}
              <FontAwesomeIcon
                icon={faXmarkCircle}
                className="chip-close"
                onClick={(e) => {
                  e.stopPropagation();
                  removeOption(item);
                }}
              />
            </div>
          ))}
        </div>
        <FontAwesomeIcon
          icon={faCircleChevronDown}
          className={`chevron ${dropdownOpen ? "rotate" : ""}`}
        />
      </div>

      {/* Main Options Menu */}
      {dropdownOpen && (
        <div
          style={{
            position: position || "absolute",
            top: "100%",
            left: 0,
            marginTop: "6px",
            zIndex: 9999,
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15)",
            border: "1px solid #e5e7eb",
            width: "240px",
            padding: "8px 0",
            overflow: "visible",
            boxSizing: "border-box",
          }}
        >
          {loading ? (
            <Loader size={"sm"} color="#f97316" />
          ) : error ? (
            <h3
              style={{
                padding: "8px 12px",
                margin: 0,
                fontSize: "14px",
                color: "#ef4444",
              }}
            >
              {String(error)}
            </h3>
          ) : (
            <>
              {/* Search Box */}
              <div style={{ padding: "0 8px 8px 8px" }}>
                <input
                  type="text"
                  ref={searchInputRef}
                  placeholder="Search..."
                  value={searchTerm}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                  style={{
                    width: "100%",
                    padding: "6px 10px",
                    borderRadius: "4px",
                    border: "1px solid #d1d5db",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Scroll Container */}
              <div
                ref={optionsWrapperRef}
                onWheel={handleScrollStop}
                style={{
                  maxHeight: "220px",
                  overflowY: "auto",
                  position: "relative",
                  overscrollBehavior: "contain",
                }}
              >
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((opt) => {
                    const hasSubs =
                      opt &&
                      typeof opt === "object" &&
                      Array.isArray(opt.subOptions) &&
                      opt.subOptions.length > 0;

                    const optKey = getRawKey(opt);
                    const isSubOpen = activeSubMenu === optKey;

                    return (
                      <div
                        key={optKey}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (hasSubs) {
                            if (isSubOpen) {
                              setActiveSubMenu(null);
                            } else {
                              const itemTop = e.currentTarget.offsetTop;
                              const scrollTop = optionsWrapperRef.current
                                ? optionsWrapperRef.current.scrollTop
                                : 0;
                              setSubMenuTop(itemTop - scrollTop);
                              setActiveSubMenu(optKey);
                            }
                          } else {
                            handleSelect(e, opt);
                          }
                        }}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          cursor: "pointer",
                          padding: "8px 14px",
                          fontSize: "14px",
                          color: "#1f2937",
                          backgroundColor: isSubOpen ? "#f3f4f6" : "transparent",
                          userSelect: "none",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <span
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {getOptionLabel(opt)}
                        </span>

                        {hasSubs && (
                          <FontAwesomeIcon
                            icon={faChevronRight}
                            style={{
                              fontSize: "11px",
                              opacity: 0.6,
                              transform: isSubOpen ? "rotate(90deg)" : "none",
                              transition: "transform 0.15s ease",
                              marginLeft: "8px",
                            }}
                          />
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div
                    style={{
                      padding: "8px 14px",
                      color: "#9ca3af",
                      fontSize: "14px",
                    }}
                  >
                    No options
                  </div>
                )}
              </div>

              {/* Flyout Sub-menu Panel */}
              {activeOptionObj &&
                typeof activeOptionObj === "object" &&
                Array.isArray(activeOptionObj.subOptions) &&
                activeOptionObj.subOptions.length > 0 && (
                  <div
                    onWheel={handleScrollStop}
                    style={{
                      position: "absolute",
                      left: "100%",
                      top: `${subMenuTop}px`,
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15)",
                      borderRadius: "8px",
                      width: "210px",
                      zIndex: 10000,
                      padding: "6px 0",
                      marginLeft: "6px",
                      maxHeight: "220px",
                      overflowY: "auto",
                      overscrollBehavior: "contain",
                      boxSizing: "border-box",
                    }}
                  >
                    {/* All Platform Option */}
                    <div
                      style={{
                        padding: "8px 14px",
                        cursor: "pointer",
                        color: "#f97316",
                        fontWeight: 600,
                        fontSize: "13px",
                        borderBottom: "1px solid #f3f4f6",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      onClick={(e) => handleSelect(e, activeOptionObj)}
                    >
                      All {getOptionLabel(activeOptionObj)}
                    </div>

                    {/* Specific Sub-options */}
                    {activeOptionObj.subOptions.map((subOpt) => (
                      <div
                        key={getRawKey(subOpt)}
                        style={{
                          padding: "8px 14px",
                          cursor: "pointer",
                          color: "#374151",
                          fontSize: "14px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        onClick={(e) => handleSelect(e, subOpt)}
                      >
                        {getOptionLabel(subOpt)}
                      </div>
                    ))}
                  </div>
                )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;