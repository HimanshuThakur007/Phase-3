import React, { useMemo, useRef, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import indiaGeoJson from "../../assets/india.geo.json";

interface StateData {
  name: string;
  code: string;
  value: number;
}

interface IndiaMapProps {
  apiData: StateData[];
  colSize?: string; // Add colSize prop
  onRefresh?: () => void;
}

const excludedStates = ["---Others---", "0", "Mumbai"];

const IndiaMap: React.FC<IndiaMapProps> = ({
  apiData,
  colSize = "12",
  onRefresh,
}) => {
  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const rawData = useMemo(() => {
    if (!Array.isArray(apiData)) return {};
    return apiData.reduce((acc, { name, value }) => {
      const normalizedName = name === "Tamilnadu" ? "Tamil Nadu" : name;
      if (!excludedStates.includes(normalizedName)) {
        acc[normalizedName] = value;
      }
      return acc;
    }, {} as Record<string, number>);
  }, [apiData]);

  const colorScale = useMemo(() => {
    const values = Object.values(rawData).filter((v) => v > 0);
    const max = values.length > 0 ? Math.max(...values) : 1;
    return scaleLinear<string>().domain([0, max]).range(["#d6eaff", "#0047b3"]);
  }, [rawData]);

  const handleMouseMove = (
    event: React.MouseEvent,
    stateName: string,
    value: number | undefined
  ) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left + 10;
      const y = event.clientY - rect.top + 10;
      setTooltipPos({ x, y });
      const formatted =
        value !== undefined ? value.toLocaleString("en-IN") : "No data";
      setTooltipContent(`${stateName}: ${formatted}`);
    }
  };

  return (
    <div className={`col-xl-${colSize} col-sm-12 col-12 d-flex`}>
      <div className="card flex-fill" ref={cardRef}>
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">India State-wise Data</h5>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRefresh && onRefresh();
            }}
            style={{
              background: "#004588",
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

        {/* Map Without Zoom */}
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 1000, center: [80, 23] }}
          width={800}
          height={600}
          style={{ width: "100%", height: "auto" }}
        >
          <Geographies geography={indiaGeoJson}>
            {({ geographies }) =>
              geographies
                .filter((geo) => {
                  const stateName = geo.properties.st_nm || geo.properties.name;
                  return !excludedStates.includes(stateName);
                })
                .map((geo) => {
                  const stateName = geo.properties.st_nm || geo.properties.name;
                  const value = rawData[stateName];
                  const fillColor = value ? colorScale(value) : "#f2f2f2";

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={String(fillColor)}
                      stroke="#ffffff"
                      strokeWidth={0.6}
                      onMouseMove={(event) =>
                        handleMouseMove(event, stateName, value)
                      }
                      onMouseLeave={() => setTooltipContent("")}
                      style={{
                        default: { outline: "none", transition: "fill 0.2s" },
                        hover: {
                          fill: value && value > 0 ? "#00cc66" : "#ff0000",
                          outline: "none",
                          cursor: "pointer",
                        },
                        pressed: { outline: "none" },
                      }}
                    />
                  );
                })
            }
          </Geographies>
        </ComposableMap>

        {/* Tooltip */}
        {tooltipContent && (
          <div
            style={{
              position: "absolute",
              left: tooltipPos.x,
              top: tooltipPos.y,
              background: "rgba(255, 255, 255, 0.95)",
              padding: "6px 10px",
              borderRadius: "4px",
              fontSize: "14px",
              fontWeight: "500",
              color: "#000",
              boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
              pointerEvents: "none",
              zIndex: 1000,
            }}
          >
            {tooltipContent}
          </div>
        )}

        {/* Legend */}
        <div style={{ padding: "16px", textAlign: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: "13px", color: "#333" }}>Low</span>
            <div
              style={{
                background: "linear-gradient(to right, #d6eaff, #0047b3)",
                width: "240px",
                height: "18px",
                borderRadius: "6px",
                border: "1px solid #ccc",
              }}
            />
            <span style={{ fontSize: "13px", color: "#333" }}>High</span>
          </div>
          <div style={{ fontSize: "12px", color: "#777", marginTop: "6px" }}>
            Value representation by color intensity
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndiaMap;
