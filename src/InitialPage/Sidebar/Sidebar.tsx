import React, { useState, useEffect } from "react";
import Scrollbars from "react-custom-scrollbars-2";
import { Link, useLocation, useNavigate } from "react-router-dom";
import * as Icon from "react-feather";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

// Define interface for the menu item data structure
interface MenuItem {
  MenuID: number;
  Name: string;
  Caption: string;
  RepID: string;
  ParentId: number;
  Link: string;
  Icon: string;
  TranType: number;
  SubmenuItems: MenuItem[];
}

// Define a type for react-feather components that accept a size prop
interface FeatherIconProps {
  size?: number | string;
}

// Parse API-provided icon string for menu items
const mainMenuIcon = (iconString: string) => {
  const iconMap: { [key: string]: React.ComponentType<FeatherIconProps> } = {
    "<Icon.Grid />": Icon.Grid,
    "<Icon.PlusSquare />": Icon.PlusSquare,
  };
  const IconComponent = iconMap[iconString] || Icon.PlusSquare;
  return <IconComponent size={20} />;
};

// Function to toggle sidebar classes (from Header component)
const sidebarOverlay = (e: React.MouseEvent): void => {
  e.preventDefault();
  document.querySelector(".main-wrapper")?.classList.toggle("slide-nav");
  document.querySelector(".sidebar-overlay")?.classList.toggle("opened");
  document.querySelector("html")?.classList.toggle("menu-opened");
};

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [subOpen, setSubOpen] = useState<string>("");
  const [subSidebar, setSubSidebar] = useState<string>("");
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(false);

  const { navigationData } = useSelector((state: RootState) => state.sidebar);

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 768); // Adjust breakpoint as needed (768px for mobile)
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = (name: string) => {
    setSubOpen((prev) => (prev === name ? "" : name));
  };

  const toggleSubSidebar = (name: string) => {
    setSubSidebar((prev) => (prev === name ? "" : name));
  };

  // Check if a menu item should be displayed without toggle (empty SubmenuItems)
  const shouldDisplayCaptionOnly = (item: MenuItem) => {
    return item.SubmenuItems.length === 0;
  };

  // Recursively collect all links for active state checking
  const collectLinks = (item: MenuItem): string[] => {
    const links: string[] = item.Link ? [item.Link] : [];
    if (item.SubmenuItems) {
      item.SubmenuItems.forEach((subItem) => {
        links.push(...collectLinks(subItem));
      });
    }
    return links;
  };

  // Handle click to prevent navigation for items with submenus and close sidebar for valid links on small screens
  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    item: MenuItem,
    toggleFn: (name: string) => void
  ) => {
    if (item.SubmenuItems.length > 0) {
      e.preventDefault();
      toggleFn(item.Name);
    } else if (item.Link !== "#" && isSmallScreen) {
      // Close sidebar and navigate programmatically for valid links on small screens
      sidebarOverlay(e);
      navigate(item.Link, { state: item });
    }
    // Navigation occurs automatically for valid links on large screens via Link
  };

  // Render menu items recursively
  const renderMenuItems = (items: MenuItem[], depth: number = 0) => {
    return items.map((item: MenuItem, index: number) => {
      const linkArray = collectLinks(item);
      const isActive = linkArray.includes(location.pathname);
      const hasSubmenu = item.SubmenuItems.length > 0;
      const isCaptionOnly = shouldDisplayCaptionOnly(item);

      if (isCaptionOnly) {
        // Display only name for items with empty SubmenuItems
        return (
          <li key={index}>
            <Link
              to={item.Link || "#"}
              {...(item.Link && { state: item })}
              className={isActive ? "active" : ""}
              onClick={(e) => handleLinkClick(e, item, toggleSidebar)}
            >
              {depth === 0 && mainMenuIcon(item.Icon)}{" "}
              {/* Show icon only for depth 0 */}
              <span>{item.Name}</span>
            </Link>
          </li>
        );
      }

      // Display as dropdown for items with SubmenuItems
      return (
        <li
          className={depth === 1 ? "submenu submenu-two" : "submenu"}
          key={index}
        >
          <Link
            to={item.Link || "#"}
            {...(item.Link && { state: item })}
            onClick={(e) =>
              handleLinkClick(
                e,
                item,
                depth === 0 ? toggleSidebar : toggleSubSidebar
              )
            }
            className={`${isActive ? "active" : ""} ${
              hasSubmenu && (depth === 0 ? subOpen : subSidebar) === item.Name
                ? "subdrop"
                : ""
            }`}
          >
            {mainMenuIcon(item.Icon)} {/* Show icon only for depth 0 */}
            <span>{item.Name}</span>
            {hasSubmenu && <span className="menu-arrow" />}
          </Link>
          {hasSubmenu && (
            <ul
              style={{
                display:
                  (depth === 0 ? subOpen : subSidebar) === item.Name
                    ? "block"
                    : "none",
              }}
            >
              {renderMenuItems(item.SubmenuItems, depth + 1)}
            </ul>
          )}
        </li>
      );
    });
  };

  return (
    <>
      <div className="sidebar" id="sidebar">
        <Scrollbars>
          <div className="sidebar-inner slimscroll">
            <div id="sidebar-menu" className="sidebar-menu">
              <ul>
                {navigationData.map((mainItem: MenuItem, index: number) => (
                  <li className="submenu-open" key={index}>
                    <ul>{renderMenuItems([mainItem])}</ul>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* <div className="">
            <div className="d-flex justify-content-center align-items-center">
              <img
                src="/BOWBI-logo.png"
                alt="BOWBI Logo"
                style={{ height: "9vh" }}
              />
            </div>
          </div> */}
          {/* <ImageWithBasePath
            src="BOWBI-logo.png"
            alt="img"
            className="img-fluid"
          /> */}
        </Scrollbars>
      </div>
    </>
  );
};

export default Sidebar;
