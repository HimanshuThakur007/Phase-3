import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import * as Icon from "react-feather";
import { SidebarData } from "../../core/json/siderbar_data";

const CollapsedSidebar = () => {
  const location = useLocation();
  const [activeMenus, setActiveMenus] = useState({
    main: {},
    sub: {},
  });

  const handleMainMenuClick = (menuIndex) => {
    setActiveMenus((prev) => ({
      ...prev,
      main: {
        ...prev.main,
        [menuIndex]: !prev.main[menuIndex],
      },
    }));
  };

  const handleSubMenuClick = (menuIndex, subMenuIndex) => {
    setActiveMenus((prev) => ({
      ...prev,
      sub: {
        ...prev.sub,
        [`${menuIndex}-${subMenuIndex}`]:
          !prev.sub[`${menuIndex}-${subMenuIndex}`],
      },
    }));
  };

  const isActiveLink = (link) => {
    return link && location.pathname === link;
  };

  const renderSubMenuItems = (items, menuIndex, subMenuIndex, level = 1) => (
    <ul
      className={level > 1 ? `submenu submenu-two submenu-level-${level}` : ""}
      style={{
        display: activeMenus.sub[`${menuIndex}-${subMenuIndex}`]
          ? "block"
          : "none",
      }}
    >
      {items.map((subItem, index) => (
        <li key={index} className={subItem.submenu ? "submenu" : ""}>
          <Link
            to={subItem.link || "#"}
            onClick={
              subItem.submenu
                ? () =>
                    handleSubMenuClick(menuIndex, `${subMenuIndex}-${index}`)
                : undefined
            }
            className={isActiveLink(subItem.link) ? "active" : ""}
          >
            <span>{subItem.label}</span>
            {subItem.submenu && (
              <span
                className={`menu-arrow ${level > 1 ? "inside-submenu" : ""}`}
              />
            )}
          </Link>
          {subItem.submenu &&
            subItem.submenuItems &&
            renderSubMenuItems(
              subItem.submenuItems,
              menuIndex,
              `${subMenuIndex}-${index}`,
              level + 1
            )}
        </li>
      ))}
    </ul>
  );

  const renderMenuItems = (items, menuIndex) =>
    items.map((item, subIndex) => (
      <li key={subIndex} className={item.submenu ? "submenu" : ""}>
        <Link
          to={item.link || "#"}
          onClick={
            item.submenu
              ? () => handleSubMenuClick(menuIndex, subIndex)
              : undefined
          }
          className={`${isActiveLink(item.link) ? "active" : ""} ${
            item.submenu && activeMenus.sub[`${menuIndex}-${subIndex}`]
              ? "subdrop"
              : ""
          }`}
        >
          {/* {item.icon || <Icon.Grid />} */}
          <span>{item.label}</span>
          {item.submenu && <span className="menu-arrow" />}
        </Link>
        {item.submenu &&
          item.submenuItems &&
          renderSubMenuItems(item.submenuItems, menuIndex, subIndex)}
      </li>
    ));

  const tabIcons = [
    { id: "home-tab", target: "#main", src: "assets/img/icons/menu-icon.svg" },
    {
      id: "messages-tab",
      target: "#inventory",
      src: "assets/img/icons/product.svg",
    },
    { id: "profile-tab", target: "#stock", src: "assets/img/icons/sales1.svg" },
    { id: "report-tab", target: "#hrm", src: "assets/img/icons/purchase1.svg" },
    { id: "set-tab", target: "#people", src: "assets/img/icons/users1.svg" },
    { id: "set-tab2", target: "#sales", src: "assets/img/icons/calendars.svg" },
    { id: "set-tab3", target: "#finance", src: "assets/img/icons/printer.svg" },
    { id: "set-tab4", target: "#scheme", icon: <Icon.User /> },
    { id: "set-tab5", target: "#task", icon: <Icon.FileText /> },
    { id: "set-tab6", target: "#salesreport", icon: <Icon.BarChart2 /> },
    { id: "set-tab7", target: "#orderreport", icon: <Icon.PieChart /> },
    { id: "set-tab8", target: "#employeereports", icon: <Icon.Users /> },
    { id: "set-tab9", target: "#settings", icon: <Icon.Settings /> },
  ];

  return (
    <div className="sidebar collapsed-sidebar" id="collapsed-sidebar">
      <div className="sidebar-inner slimscroll">
        <div id="sidebar-menu-2" className="sidebar-menu sidebar-menu-three">
          <aside id="aside" className="ui-aside">
            <ul className="tab nav nav-tabs" id="myTab" role="tablist">
              {tabIcons.map((tab, index) => (
                <li key={index} className="nav-item" role="presentation">
                  <Link
                    className={`tablinks nav-link ${
                      index === 0 ? "active" : ""
                    }`}
                    to={tab.target}
                    id={tab.id}
                    data-bs-toggle="tab"
                    data-bs-target={tab.target}
                    role="tab"
                    aria-selected={index === 0}
                  >
                    {tab.src ? (
                      <ImageWithBasePath src={tab.src} alt="img" />
                    ) : (
                      tab.icon
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
          <div className="tab-content tab-content-four pt-2">
            {SidebarData.map((menu, index) => (
              <ul
                key={index}
                className={`tab-pane ${index === 0 ? "active" : ""}`}
                id={tabIcons[index]?.target.slice(1)}
                aria-labelledby={tabIcons[index]?.id}
              >
                {renderMenuItems(menu.submenuItems, index)}
              </ul>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollapsedSidebar;
