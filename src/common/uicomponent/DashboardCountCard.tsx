import React, { JSX } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import CountCard, { CountItem } from "./CountCard";

// Define the shape of the data prop
interface DashboardData {
  map(arg0: (card: any, index: any) => JSX.Element): React.ReactNode;
  title: string;
  items: CountItem[];
  backgroundColor: string;
  fontColor: string;
  rapId?: string;
  total?: string; // Add total to the data structure
  endPoint?: string;
}

interface DashboardMainCountCardProps {
  data: DashboardData | any[];
  colSize?: any;
  onItemClick?: (rapId: string, masterCode: number, recType: number) => void;
  onCardClick?: (rapId: string, masterCode: number, recType: number) => void;
  onRefresh?: (endpoint: string, dataType: string) => void;
}

const DashboardMainCountCard: React.FC<DashboardMainCountCardProps> = ({
  data,
  colSize = [],
  onItemClick,
  onCardClick,
  onRefresh,
}) => {
  // console.log("dataRapo", data);
  return (
    <div className="row m-0">
      {data?.map((card, index) => (
        <CountCard
          key={index}
          items={card.items}
          title={card.title}
          iconType={card.title.toLowerCase().replace(" ", "-")}
          backgroundColor={card.backgroundColor}
          fontColor={card.fontColor}
          // colSize={colSize}
          colSize={colSize[index] as "4" | "6" | "12"}
          rapId={card.rapId}
          total={card.total} // Pass total to CountCard
          onItemClick={onItemClick}
          onCardClick={onCardClick}
          onRefresh={() =>
            onRefresh && onRefresh(card.endPoint || "", card?.title || "")
          }
        />
      ))}
    </div>
  );
};

export default DashboardMainCountCard;
