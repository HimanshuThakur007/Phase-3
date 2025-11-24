import React, { memo, useRef, ReactElement } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { ArrowLeft, PlusCircle } from "react-feather";
import { Link, useNavigate, To } from "react-router-dom";
import ImageWithBasePath from "../component/ImageWithBasePath";
import GridTable from "../component/GridTable";
import StockReportTable from "./StockReportTable";
import ShowSavedFilters from "../../feature-modules/phase3/ShowSavedFilters";
import { useSelector } from "react-redux";

// Interface for the ref methods exposed by GridTable
interface GridTableRef {
  exportToExcel: () => void;
  // exportToPDF: () => void;
}

// Type for GridTable props to help TypeScript understand its ref
// type GridTableProps = React.ComponentPropsWithRef<typeof GridTable>;

interface WrapperProps {
  header?: string;
  subHeader?: string;
  onClick?: (e: React.MouseEvent) => void;
  children: React.ReactNode;
  addButton?: string;
  link?: string;
  linkState?: any;
  backLink?: string;
  backLinkState?: any;
  backButtonName?: string;
  props?: any;
  subheaderstyle?: any;
  DownloadPdf?: () => void;
  pdfLink?: string;
  ExportR?: number;
  importButtonName?: string;
  create?: boolean;
  handleImportClick?: () => void;
  extralink?: string;
  showFilters?: boolean;
}

const Wrapper = ({
  header,
  subHeader,
  onClick,
  children,
  addButton,
  link,
  linkState,
  backLink,
  backLinkState,
  backButtonName,
  props,
  subheaderstyle,
  showFilters = true,
  importButtonName,
  extralink,
}: WrapperProps) => {
  const tableRef = useRef<GridTableRef>(null);
  const navigate = useNavigate();

  const pathName = window.location.pathname;
  const basePath = pathName.split("/")[1] || "";

  const containerClass =
    basePath === "summaries" ||
    basePath === "schemes_display" ||
    basePath === "dynamictable" ||
    basePath === "graphicalRepresentation" ||
    basePath === "discountPage" ||
    basePath === ""
      ? "container-fluid"
      : "page-wrapper";

  // -------------------------
  // Helper: robust type match
  // -------------------------
  const isElementMatching = (el: any, target: any) => {
    if (!React.isValidElement(el)) return false;
    const t = el.type as any;
    if (!t) return false;
    if (t === target) return true;
    if (t.name && target.name && t.name === target.name) return true;
    if (t.displayName && target.name && t.displayName === target.name)
      return true;
    // handle React.memo / HOC -> type.type
    if (t.type) {
      const inner = t.type;
      if (inner === target) return true;
      if (inner.name && inner.name === target.name) return true;
      if (inner.displayName && inner.displayName === target.name) return true;
    }
    return false;
  };
  const savedSchemes = useSelector(
    (state: any) => state.phase3?.savedSchemes ?? []
  );
  // -------------------------
  // Recursive search for presence
  // -------------------------
  const containsGridTable = (nodes: React.ReactNode): boolean => {
    let found = false;
    React.Children.forEach(nodes, (child) => {
      if (found) return;
      if (!React.isValidElement(child)) return;
      if (
        isElementMatching(child, GridTable) ||
        isElementMatching(child, StockReportTable)
      ) {
        found = true;
        return;
      }
      // recurse into child.props.children
      if ((child as any).props && (child as any).props.children) {
        if (containsGridTable((child as any).props.children)) {
          found = true;
          return;
        }
      }
    });
    return found;
  };

  const hasGridTable = containsGridTable(children);
  // console.log("savedSchemes?.length", savedSchemes?.length);
  // -------------------------
  // Recursive clone to attach ref to first GridTable/StockReportTable
  // -------------------------
  let refAttached = false;
  const cloneChildrenWithRef = (nodes: React.ReactNode): React.ReactNode => {
    return React.Children.map(nodes, (child) => {
      if (!React.isValidElement(child)) return child;

      // If this child is the GridTable/StockReportTable and we haven't attached ref -> clone with ref
      if (
        !refAttached &&
        (isElementMatching(child, GridTable) ||
          isElementMatching(child, StockReportTable))
      ) {
        refAttached = true;
        // we clone and pass the ref
        return React.cloneElement(child as ReactElement<any>, {
          ref: tableRef,
        });
      }

      // If child has children, recurse
      const childProps: any = (child as any).props;
      if (childProps && childProps.children) {
        const cloned = React.cloneElement(child as ReactElement<any>, {
          children: cloneChildrenWithRef(childProps.children),
        });
        return cloned;
      }

      // otherwise return child unchanged
      return child;
    });
  };

  const clonedChildren = cloneChildrenWithRef(children);

  // tooltips & handlers (unchanged)
  // const renderTooltip = (props: any) => (
  //   <Tooltip id="pdf-tooltip" {...props}>
  //     Pdf
  //   </Tooltip>
  // );
  const renderExcelTooltip = (props: any) => (
    <Tooltip id="excel-tooltip" {...props}>
      Excel
    </Tooltip>
  );

  // const handleExportPDF = (e: React.MouseEvent) => {
  //   e.preventDefault();
  //   if (tableRef.current) {
  //     tableRef.current.exportToPDF();
  //   } else if (pdfLink && pdfLink.trim() !== "") {
  //     window.open(pdfLink, "_blank", "noopener,noreferrer");
  //   } else if (DownloadPdf) {
  //     DownloadPdf();
  //   } else {
  //     console.warn("No PDF export method available");
  //   }
  // };

  const handleExportCSV = (e: React.MouseEvent) => {
    e.preventDefault();
    if (tableRef.current) {
      tableRef.current.exportToExcel();
    } else {
      console.warn("GridTable ref not available for CSV export");
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!link || link.trim() === "") {
      e.preventDefault();
      if (onClick) onClick(e);
    }
  };

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (backLink && backLink.trim() !== "") {
      navigate(
        {
          pathname: backLink,
          search: backLinkState ? undefined : window.location.search,
        },
        { state: backLinkState }
      );
    } else {
      navigate(-1);
    }
  };

  const handleImportClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (extralink && extralink.trim() !== "") {
      navigate({ pathname: extralink });
    } else {
      navigate(-1);
    }
  };

  const linkTo: To =
    link && link.trim() !== ""
      ? {
          pathname: link,
          search: linkState ? undefined : window.location.search,
        }
      : "#";
  const backLinkTo: To =
    backLink && backLink.trim() !== ""
      ? {
          pathname: backLink,
          search: backLinkState ? undefined : window.location.search,
        }
      : "#";

  const renderSchemesTooltip = (props: any) => (
    <Tooltip id="schemes-tooltip" {...props}>
      Added Schemes or Display
    </Tooltip>
  );

  return (
    <div className={containerClass}>
      <div
        className={`content ${
          (basePath === "RepList" ||
            basePath === "summaries" ||
            basePath === "schemes_display" ||
            basePath === "dynamictable" ||
            basePath === "discountPage" ||
            basePath === "graphicalRepresentation" ||
            basePath === "") &&
          ""
        }`}
      >
        <div className={`page-header ${basePath === "RepOpt" && "d-lg-none"}`}>
          <div className="add-item d-flex">
            <div className="page-title">
              {header && header.trim() !== "" && <h4>{header}</h4>}
              {showFilters === true && <ShowSavedFilters />}
              {showFilters === false && subHeader}
            </div>
          </div>
          <ul className="table-top-head" role="toolbar">
            {hasGridTable && (
              <>
                {savedSchemes.length > 0 && (
                  <li>
                    {/* <OverlayTrigger placement="top" overlay={renderTooltip}>
                    <Link to={pdfLink || "#"} onClick={handleExportPDF}>
                      <ImageWithBasePath src="assets/img/icons/pdf.svg" alt="img" />
                    </Link>
                  </OverlayTrigger> */}
                    <OverlayTrigger
                      placement="top"
                      overlay={renderSchemesTooltip}
                    >
                      <Link
                        to="/schemes_display"
                        className="ms-3 position-relative"
                      >
                        {/* <i className="fas fa-shopping-cart text-primary fs-5"></i> */}
                        <i className="fas fa-list text-primary fs-5"></i>
                        {/* {savedSchemes.length > 0 && ( */}
                        <span
                          className="position-absolute top-0 start-100 translate-middle"
                          style={{
                            fontSize: "0.75rem",
                            color: "red",
                            fontWeight: "bold",
                            backgroundColor: "white",
                            borderRadius: "50%",
                            minWidth: "16px",
                            height: "16px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1px solid red",
                            padding: "0 4px",
                          }}
                        >
                          {savedSchemes.length}
                        </span>
                        {/* )} */}
                      </Link>
                    </OverlayTrigger>
                  </li>
                )}

                <li>
                  <OverlayTrigger placement="top" overlay={renderExcelTooltip}>
                    <Link to="#" onClick={handleExportCSV}>
                      <ImageWithBasePath
                        src="assets/img/icons/excel.svg"
                        alt="img"
                      />
                    </Link>
                  </OverlayTrigger>
                </li>
              </>
            )}

            <div className="page-btn">
              <li>
                {addButton && addButton.trim() !== "" && (
                  <Link
                    to={linkTo}
                    state={linkState}
                    {...props}
                    className="btn btn-added"
                    onClick={handleClick}
                    aria-label={`Add ${addButton}`}
                  >
                    <PlusCircle className="me-2" aria-hidden="true" />
                    {addButton}
                  </Link>
                )}
                {backButtonName && backButtonName.trim() !== "" && (
                  <Link
                    to={backLinkTo}
                    state={backLinkState}
                    className="btn btn-secondary"
                    onClick={handleBackClick}
                  >
                    <ArrowLeft className="me-2" />
                    {backButtonName}
                  </Link>
                )}
              </li>
            </div>

            <div className="page-btn import">
              {importButtonName && importButtonName.trim() !== "" && (
                <Link
                  to={extralink ?? "#"}
                  className="btn btn-added color"
                  onClick={handleImportClick}
                >
                  <PlusCircle className="me-2" />
                  {importButtonName}
                </Link>
              )}
              <Link
                to="/"
                className="btn btn-added color"
                aria-label="Go to Dashboard"
              >
                <i className="feather-home me-2"></i>
                Dashboard
              </Link>
            </div>
          </ul>
        </div>

        {/* Render cloned children (with ref attached to nested GridTable if present) */}
        {clonedChildren}
      </div>
    </div>
  );
};

export default memo(Wrapper);
