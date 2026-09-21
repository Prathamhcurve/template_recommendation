import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleChevronDown,
  faXmarkCircle,
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
  const [searchTerm, setSearchTerm] = useState("");

  const { loading, error } = useSelector((state) => state.filters);

  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (forceClose) {
      setDropdownOpen(false);
    }
  }, [forceClose]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.isConnected) return;

      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const toggleDropdown = async () => {
    if (disabled) return;
    setDropdownOpen((prev) => !prev);

    setTimeout(() => {
      if (!dropdownOpen && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 100);
  };

  const addOption = (e, option) => {
    e.stopPropagation();
    const updated = [...selected, option];
    onSelectionChange?.(updated);
  };

  // Helper to extract identifier key regardless of whether item is a string or object
  const getRawKey = (item) => {
    if (!item) return "";
    if (typeof item === "object") {
      return String(item.id ?? item.name ?? item.label ?? item.value ?? "");
    }
    return String(item);
  };

  // Resolve item against available options if it was hydrated as a raw string
  const resolveOption = (item) => {
    const raw = getRawKey(item);
    const matched = options.find((opt) => getRawKey(opt) === raw);
    return matched || item;
  };

  const getOptionLabel = (opt) => {
    const resolved = resolveOption(opt);
    if (resolved && typeof resolved === "object") {
      return String(resolved.name ?? resolved.label ?? resolved.id ?? "");
    }
    return String(resolved ?? "");
  };

  const getOptionKey = (opt) => {
    return getRawKey(opt);
  };

  const isSameOption = (a, b) => {
    const keyA = getRawKey(a);
    const keyB = getRawKey(b);
    return keyA !== "" && keyA === keyB;
  };

  const removeOption = (option) => {
    const updated = selected.filter((s) => !isSameOption(s, option));
    onSelectionChange?.(updated);
  };

  const availableOptions = options.filter(
    (opt) => !selected.some((s) => isSameOption(s, opt)),
  );

  const filteredOptions = availableOptions.filter((opt) =>
    getOptionLabel(opt).toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className={`dropdown ${disabled ? "disabled" : ""}`} ref={dropdownRef}>
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
              key={getOptionKey(item)}
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

      {dropdownOpen && (
        <div className="dropdown-menu" style={{ position }}>
          {loading ? (
            <Loader size={"sm"} color="#f97316" />
          ) : error ? (
            <h3>{error}</h3>
          ) : (
            <>
              <input
                type="text"
                ref={searchInputRef}
                className="dropdown-search"
                placeholder="Search..."
                value={searchTerm}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />

              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => (
                  <div
                    key={getOptionKey(opt)}
                    className="dropdown-item"
                    onClick={(e) => {
                      addOption(e, opt);
                      setSearchTerm("");
                    }}
                  >
                    {getOptionLabel(opt)}
                  </div>
                ))
              ) : (
                <div className="dropdown-item">No options</div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;