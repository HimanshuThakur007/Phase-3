import React from "react";
import { Info } from "react-feather";

// Define props interface
interface SectionDividerProps {
  children: React.ReactNode;
  heading: string;
}
interface SectionDividerHeadProps {
  children: React.ReactNode;
  heading: string;
}

const SectionDivider: React.FC<SectionDividerProps> = ({
  children,
  heading,
}) => {
  return (
    <div className="other-info">
      <div className="card-title-head">
        <h6>
          <span>
            <Info className="feather-edit" />
          </span>
          {heading}
        </h6>
      </div>
      <div className="row">{children}</div>
    </div>
  );
};

export default SectionDivider;

export const SectionDividerHead: React.FC<SectionDividerHeadProps> = ({
  heading,
  children,
}) => {
  return (
    <>
      <div className="card-title-head">
        <h6>
          <span>
            <Info className="feather-edit" />
          </span>
          {heading} Information
        </h6>
      </div>
      <div className="row">{children}</div>
    </>
  );
};
