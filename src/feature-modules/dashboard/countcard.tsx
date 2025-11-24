import React, { useEffect, useState } from "react";
import { Tooltip } from "react-tooltip";
import { RotateCw } from "react-feather"; // Feather icon for refresh
import LoadingDots from "../../common/uicomponent/LoadingDots";

interface DashboardCardProps {
  title: string;
  count: number;
  icon?: React.ReactNode;
  navigateTo?: string;
  tooltipText?: string;
  bg: string;
  colsize?: "4" | "6" | "12" | "3";
  useAltStyle?: boolean;
  detail1?: string;
  detail2?: string;
  detail3?: string;
  onRefresh?: () => void; // Callback for refresh action
  onClick?: (
    rapId: string,
    masterCode: number,
    recType?: number,
    viewType?: number
  ) => Promise<boolean>; // Updated onClick to match handleItemClick signature
  rapId?: string; // Added rapId prop
  masterCode?: number; // Added masterCode prop
  recType?: number; // Added recType prop (optional, default 1)
  viewType?: number; // Added viewType prop (optional, default 1)
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  count,
  tooltipText,
  bg,
  colsize = "4",
  useAltStyle = false,
  detail1,
  detail2,
  detail3,
  onRefresh,
  onClick,
  rapId,
  masterCode,
  recType = 1, // Default to 1 as per handleItemClick
  viewType = 1, // Default to 1 as per handleItemClick
}) => {
  const tooltipId = `tooltip-${title.replace(/\s+/g, "-")}`;
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isHovered, setIsHovered] = useState(false);

  // Handle window resize for responsive styles
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Determine column width
  const getColumnWidth = () => {
    if (windowWidth <= 576) return "100%";
    if (windowWidth <= 768) return colsize === "12" ? "100%" : "50%";
    if (windowWidth <= 1200)
      return colsize === "12" ? "100%" : colsize === "6" ? "50%" : "50%";
    switch (colsize) {
      case "3":
        return "25%";
      case "4":
        return "33.333%";
      case "6":
        return "50%";
      case "12":
        return "100%";
      default:
        return "33.333%";
    }
  };

  // Responsive font sizes and padding
  const getResponsiveStyles = () => {
    if (windowWidth <= 576) {
      return {
        cardPadding: "0.75rem",
        titleFontSize: "1rem",
        countFontSize: "1rem",
        detailFontSize: "0.9rem",
        tooltipFontSize: "0.65rem",
        minHeight: detail1 || detail2 || detail3 ? "90px" : "70px",
        altPadding: "1rem",
        altBorderWidth: "1px",
      };
    }
    if (windowWidth <= 768) {
      return {
        cardPadding: "1rem",
        titleFontSize: "1.1rem",
        countFontSize: "1.1rem",
        detailFontSize: "1rem",
        tooltipFontSize: "0.7rem",
        minHeight: detail1 || detail2 || detail3 ? "100px" : "80px",
        altPadding: "1.25rem",
        altBorderWidth: "2px",
      };
    }
    return {
      cardPadding: "1.5rem",
      titleFontSize: "1.25rem",
      countFontSize: "1.25rem",
      detailFontSize: "1rem",
      tooltipFontSize: "0.7rem",
      minHeight: detail1 || detail2 || detail3 ? "120px" : "80px",
      altPadding: "1.75rem",
      altBorderWidth: "2px",
    };
  };

  const {
    cardPadding,
    titleFontSize,
    countFontSize,
    detailFontSize,
    tooltipFontSize,
    minHeight,
    altPadding,
    altBorderWidth,
  } = getResponsiveStyles();

  // Base card styles
  const cardStyles: React.CSSProperties = {
    width: "100%",
    padding: cardPadding,
    paddingBottom: "3.5rem", // Reserve space for refresh button
    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.10)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight,
    borderRadius: "1.25rem",
    transition:
      "transform 0.22s cubic-bezier(.4,2,.3,1), box-shadow 0.22s cubic-bezier(.4,2,.3,1), border-color 0.22s cubic-bezier(.4,2,.3,1)",
    background: `linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.10) 100%), ${bg}`,
    position: "relative",
    overflow: "hidden",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    borderWidth: "1.5px",
    borderStyle: "solid",
    borderColor: "rgba(255,255,255,0.25)",
    cursor:
      onClick && rapId && masterCode !== undefined ? "pointer" : "default", // Conditional cursor
  };

  // Alt card styles
  const altCardStyles: React.CSSProperties = useAltStyle
    ? {
        borderWidth: altBorderWidth,
        borderStyle: "solid",
        borderColor: "rgba(255, 255, 255, 0.2)",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.18)",
        borderRadius: "1.5rem",
        padding: altPadding,
      }
    : {};

  // Hover styles
  const hoverStyles: React.CSSProperties = isHovered
    ? {
        transform: "scale(1.035) translateY(-2px)",
        boxShadow: "0 16px 32px 0 rgba(31, 38, 135, 0.18)",
        borderColor: "#fff",
      }
    : {};

  const combinedCardStyles = {
    ...cardStyles,
    ...altCardStyles,
    ...hoverStyles,
  };

  // Parse details
  const parseDetail = (detail?: string) => {
    if (!detail) return { label: "", value: "" };
    const lastColonIndex = detail?.lastIndexOf(":");
    if (lastColonIndex === -1) return { label: detail, value: "" };
    return {
      label: detail.slice(0, lastColonIndex).trim(),
      value: detail.slice(lastColonIndex + 1).trim(),
    };
  };

  // Check if values are available
  const isCountAvailable = count != null && count !== 0;
  const isDetail1Available = detail1 && parseDetail(detail1).value !== null;
  const isDetail2Available = detail2 && parseDetail(detail2).value !== null;
  const isDetail3Available = detail3 && parseDetail(detail3).value !== null;

  // Handle card click
  const handleCardClick = () => {
    if (onClick && rapId && masterCode !== undefined) {
      console.log("Card clicked, triggering navigation:", {
        rapId,
        masterCode,
        recType,
        viewType,
      });
      onClick(rapId, masterCode, recType, viewType);
    } else {
      console.warn("Navigation not triggered. Missing props:", {
        onClick: !!onClick,
        rapId: !!rapId,
        masterCode: masterCode !== undefined,
      });
    }
  };

  return (
    <div
      style={{
        display: "flex",
        marginBottom: "1rem",
        padding: "0 0.5rem",
        width: getColumnWidth(),
      }}
    >
      <div
        style={combinedCardStyles}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick} // Attach click handler
      >
        {/* Top section */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.3rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.625rem",
            }}
          >
            <h5
              style={{
                margin: 0,
                color: "white",
                fontSize: titleFontSize,
                cursor: "pointer",
                fontWeight: 500,
              }}
              data-tooltip-id={tooltipId}
              data-tooltip-content={tooltipText}
            >
              {title}
            </h5>
            <h4
              style={{
                margin: 0,
                color: "white",
                fontSize: countFontSize,
                fontWeight: 600,
              }}
            >
              {isCountAvailable ? count : <LoadingDots size="small" />}
            </h4>
          </div>
          <p
            style={{
              margin: 0,
              color: "white",
              fontSize: tooltipFontSize,
              textAlign: "left",
            }}
          >
            {tooltipText}
          </p>
        </div>

        {/* Details */}
        {(detail1 || detail2 || detail3) && (
          <div style={{ marginTop: "0.5rem" }}>
            {detail1 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "0.5rem",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: "white",
                    fontSize: detailFontSize,
                    fontWeight: 500,
                  }}
                >
                  {parseDetail(detail1).label}
                </p>
                <p
                  style={{
                    margin: 0,
                    color: "white",
                    fontSize: detailFontSize,
                    fontWeight: 600,
                  }}
                >
                  {isDetail1Available ? (
                    parseDetail(detail1).value
                  ) : (
                    <LoadingDots size="small" />
                  )}
                </p>
              </div>
            )}
            {detail2 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "0.5rem",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: "white",
                    fontSize: detailFontSize,
                    fontWeight: 500,
                  }}
                >
                  {parseDetail(detail2).label}
                </p>
                <p
                  style={{
                    margin: 0,
                    color: "white",
                    fontSize: detailFontSize,
                    fontWeight: 600,
                  }}
                >
                  {isDetail2Available ? (
                    parseDetail(detail2).value
                  ) : (
                    <LoadingDots size="small" />
                  )}
                </p>
              </div>
            )}
            {detail3 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: "white",
                    fontSize: detailFontSize,
                    fontWeight: 500,
                  }}
                >
                  {parseDetail(detail3).label}
                </p>
                <p
                  style={{
                    margin: 0,
                    color: "white",
                    fontSize: detailFontSize,
                    fontWeight: 600,
                  }}
                >
                  {isDetail3Available ? (
                    parseDetail(detail3).value
                  ) : (
                    <LoadingDots size="small" />
                  )}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Refresh Button - bottom right */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent click from bubbling to card
            if (onRefresh) onRefresh();
          }}
          style={{
            position: "absolute",
            bottom: "10px",
            right: "10px",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.4)",
            borderRadius: "50%",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "white",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.25)";
            e.currentTarget.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.15)";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <RotateCw size={18} />
        </button>

        <Tooltip id={tooltipId} place="top-start" />
      </div>
    </div>
  );
};

export default DashboardCard;
