import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

// Define the shape of each count item
export interface CountItem {
  rapId: any;
  label: string;
  value: string | number | undefined;
  recType?: number;
}

// Define the shape of the props
interface CountCardProps {
  items: CountItem[];
  title: string;
  iconType?: string;
  backgroundColor: string;
  fontColor: string;
  colSize?: "4" | "6" | "12";
  rapId?: string;
  total?: string; // Add total to props
  onItemClick?: (rapId: string, masterCode: number, recType: number) => void;
  onCardClick?: (rapId: string, masterCode: number, recType: number) => void;
  onRefresh?: () => void;
}

const CountCard: React.FC<CountCardProps> = ({
  items,
  title,
  backgroundColor,
  fontColor,
  colSize = "4",
  rapId,
  total,
  onItemClick,
  onCardClick,
  onRefresh,
}) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isCardHovered, setIsCardHovered] = useState(false);
  const [hoveredItemIndex, setHoveredItemIndex] = useState<number | null>(null);
  const { watch } = useFormContext<{
    uType4Value: any;
  }>();

  const uType4Value = watch("uType4Value");
  const masterCode = uType4Value?.value || 0;
  // console.log("from count Card uValue", uType4Value);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getColumnWidth = () => {
    if (windowWidth <= 576) return "100%";
    if (windowWidth <= 768) return "100%";
    if (windowWidth <= 1200)
      return colSize === "6" ? "50%" : colSize === "12" ? "100%" : "33.333%";
    return colSize === "4" ? "33.333%" : colSize === "6" ? "50%" : "100%";
  };

  const getResponsiveStyles = () => {
    if (windowWidth <= 576) {
      return {
        cardPadding: "0.75rem",
        titleFontSize: "1rem",
        itemFontSize: "0.9rem",
        minHeight: "120px",
      };
    }
    if (windowWidth <= 768) {
      return {
        cardPadding: "1rem",
        titleFontSize: "1.1rem",
        itemFontSize: "1rem",
        minHeight: "130px",
      };
    }
    return {
      cardPadding: "1.25rem",
      titleFontSize: "1rem",
      itemFontSize: "1rem",
      minHeight: "150px",
    };
  };

  const { cardPadding, titleFontSize, itemFontSize, minHeight } =
    getResponsiveStyles();

  // --- Modern Glassmorphism Styles ---
  const cardStyles: React.CSSProperties = {
    width: "100%",
    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.10)",
    borderRadius: "1.25rem",
    transition:
      "transform 0.22s cubic-bezier(.4,2,.3,1), box-shadow 0.22s cubic-bezier(.4,2,.3,1)",
    cursor: rapId && onCardClick ? "pointer" : "default",
    display: "flex",
    flexDirection: "column",
    background: `${backgroundColor}`,
    position: "relative",
    overflow: "hidden",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    borderColor: "1.5px solid rgba(255,255,255,0.25)",
    minHeight,
  };

  const cardHoverStyles: React.CSSProperties = isCardHovered
    ? {
        transform: "scale(1.035) translateY(-2px)",
        boxShadow: "0 16px 32px 0 rgba(31, 38, 135, 0.18)",
        borderColor: "#fff",
      }
    : {};

  return (
    <div
      style={{
        display: "flex",
        width: getColumnWidth(),
        padding: "0 0.5rem",
        marginBottom: "1rem",
        cursor: rapId && onCardClick ? "pointer" : "default",
      }}
    >
      <div
        style={{ ...cardStyles, ...cardHoverStyles }}
        onMouseEnter={() => setIsCardHovered(true)}
        onMouseLeave={() => setIsCardHovered(false)}
        onClick={() => {
          if (!rapId) return;
          onCardClick && onCardClick(rapId, masterCode, 0);
        }}
      >
        {/* Glassmorphism gradient overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            borderRadius: "inherit",
            background:
              "linear-gradient(120deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.04) 100%)",
            zIndex: 0,
          }}
        />
        {/* Animated shine */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "-60%",
            width: "60%",
            height: "100%",
            background:
              "linear-gradient(120deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.01) 100%)",
            transform: isCardHovered ? "translateX(180%)" : "translateX(0)",
            transition: "transform 0.7s cubic-bezier(.4,2,.3,1)",
            zIndex: 1,
            borderRadius: "inherit",
            pointerEvents: "none",
          }}
        />
        {/* Card header */}
        <div
          style={{
            padding: `0.5rem ${cardPadding}`,
            borderBottom: "1px solid rgba(0, 0, 0, 0.07)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "rgba(255,255,255,0.10)",
            fontWeight: 700,
            fontSize: titleFontSize,
            color: fontColor,
            letterSpacing: "0.5px",
            zIndex: 2,
          }}
        >
          {/* Title */}
          <h6
            style={{
              margin: 0,
              fontSize: titleFontSize,
              fontWeight: 700,
              color: fontColor,
              letterSpacing: "0.5px",
            }}
          >
            {title}
          </h6>

          {/* Right side (Total + Refresh) */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {total && (
              <span
                style={{
                  fontSize: titleFontSize,
                  fontWeight: 700,
                  color: fontColor,
                  letterSpacing: "0.5px",
                }}
              >
                {total}
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRefresh && onRefresh();
              }}
              style={{
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
              title="Refresh"
            >
              ⟳
            </button>
          </div>
        </div>

        {/* Card body */}
        <div
          style={{
            padding: cardPadding,
            color: fontColor,
            minHeight,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: "transparent",
            zIndex: 2,
          }}
        >
          {items.map((item, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: index !== items.length - 1 ? "0.5rem" : "0",
                cursor:
                  rapId && onCardClick
                    ? "pointer"
                    : item.recType && item.rapId && onItemClick
                    ? "pointer"
                    : "default",
                transition: "transform 0.2s ease-in-out",
                transform:
                  !rapId &&
                  item.recType &&
                  item.rapId &&
                  onItemClick &&
                  hoveredItemIndex === index
                    ? "translateY(-2px)"
                    : "none",
                fontWeight: 600,
                fontSize: itemFontSize,
                letterSpacing: "0.2px",
              }}
              onMouseEnter={() =>
                item.recType &&
                item.rapId &&
                onItemClick &&
                setHoveredItemIndex(index)
              }
              onMouseLeave={() => setHoveredItemIndex(null)}
              onClick={() => {
                item.recType &&
                  item.rapId &&
                  onItemClick &&
                  onItemClick(item.rapId, masterCode, item.recType);
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  color: fontColor,
                  fontSize: itemFontSize,
                  opacity: 0.92,
                }}
              >
                {item.label}
              </span>
              <span
                style={{
                  color: fontColor,
                  fontSize: itemFontSize,
                  textDecoration:
                    item.recType &&
                    item.rapId &&
                    onItemClick &&
                    hoveredItemIndex === index
                      ? "underline"
                      : "none",
                  transition: "text-decoration 0.2s ease-in-out",
                  fontWeight: 700,
                  opacity: 0.96,
                }}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CountCard;
