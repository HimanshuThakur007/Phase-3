import React from "react";
import { ChevronDown, LifeBuoy } from "react-feather";
import { Link } from "react-router-dom";

// Define the props interface for the Accordian component
interface AccordianProps {
  accordianId: string;
  headingId: string;
  collapseId: string;
  children: React.ReactNode;
  header: string;
}

const Accordian: React.FC<AccordianProps> = ({
  accordianId,
  headingId,
  collapseId,
  children,
  header,
}) => {
  return (
    <div className="accordion-card-one accordion" id={accordianId}>
      <div className="accordion-item">
        <div className="accordion-header" id={headingId}>
          <div
            className="accordion-button"
            data-bs-toggle="collapse"
            data-bs-target={`#${collapseId}`}
            aria-controls={collapseId}
          >
            <div className="text-editor add-list">
              <div className="addproduct-icon list icon">
                <h5>
                  <LifeBuoy className="add-info" />
                  <span>{header}</span>
                </h5>
                <Link to="#" onClick={(e) => e.preventDefault()}>
                  <ChevronDown className="chevron-down-add" />
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div
          id={collapseId}
          className="accordion-collapse collapse show"
          aria-labelledby={headingId}
          data-bs-parent={`#${accordianId}`}
        >
          <div className="accordion-body">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Accordian;
