import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import * as Icon from "react-feather";
import { ImUsers } from "react-icons/im";
import { BiMoney } from "react-icons/bi";
import { SlGraph } from "react-icons/sl";
import { HiUsers } from "react-icons/hi2";

import { SidebarData } from "../../core/json/siderbar_data";

const HorizontalSidebar = () => {
  const location = useLocation();
  const [activeMenus, setActiveMenus] = useState({
    main: {},
    sub: {}
  });

  const handleMainMenuClick = (menuIndex) => {
    setActiveMenus(prev => ({
      ...prev,
      main: {
        ...Object.keys(prev.main).reduce((acc, key) => ({
          ...acc,
          [key]: false
        }), {}),
        [menuIndex]: !prev.main[menuIndex]
      }
    }));
  };

  const handleSubMenuClick = (menuIndex, subMenuIndex) => {
    setActiveMenus(prev => ({
      ...prev,
      sub: {
        ...prev.sub,
        [`${menuIndex}-${subMenuIndex}`]: !prev.sub[`${menuIndex}-${subMenuIndex}`]
      }
    }));
  };

  const isActiveLink = (link) => {
    return link && location.pathname === link;
  };

  const renderSubMenuItems = (items, menuIndex, subMenuIndex, level = 1) => (
    <ul 
      className={level > 1 ? `submenu submenu-two submenu-level-${level}` : ""}
      style={{ display: activeMenus.sub[`${menuIndex}-${subMenuIndex}`] ? "block" : "none" }}
    >
      {items.map((subItem, index) => (
        <li key={index} className={subItem.submenu ? "submenu" : ""}>
          <Link
            to={subItem.link || "#"}
            onClick={subItem.submenu ? () => handleSubMenuClick(menuIndex, `${subMenuIndex}-${index}`) : undefined}
            className={isActiveLink(subItem.link) ? "active" : ""}
          >
            <span>{subItem.label}</span>
            {subItem.submenu && <span className={`menu-arrow ${level > 1 ? 'inside-submenu' : ''}`} />}
          </Link>
          {subItem.submenu && subItem.submenuItems && renderSubMenuItems(subItem.submenuItems, menuIndex, `${subMenuIndex}-${index}`, level + 1)}
        </li>
      ))}
    </ul>
  );

  const renderMenuItems = (items, menuIndex) => (
    <ul style={{ display: activeMenus.main[menuIndex] ? "block" : "none" }}>
      {items.map((item, subIndex) => (
        <li key={subIndex} className={item.submenu ? "submenu" : ""}>
          <Link
            to={item.link || "#"}
            onClick={item.submenu ? () => handleSubMenuClick(menuIndex, subIndex) : undefined}
            className={`${isActiveLink(item.link) ? "active" : ""} ${
              item.submenu && activeMenus.sub[`${menuIndex}-${subIndex}`] ? "subdrop" : ""
            }`}
          >
            {item.icon || <Icon.Grid />}
            <span>{item.label}</span>
            {item.submenu && <span className="menu-arrow" />}
          </Link>
          {item.submenu && item.submenuItems && renderSubMenuItems(item.submenuItems, menuIndex, subIndex)}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="sidebar horizontal-sidebar">
      <div id="sidebar-menu-3" className="sidebar-menu">
        <ul className="nav">
          {SidebarData.map((menu, index) => (
            <li key={index} className="submenu">
              <Link
                to="#"
                onClick={() => handleMainMenuClick(index)}
                className={activeMenus.main[index] ? "subdrop" : ""}
              >
                {menu.submenuItems[0]?.icon || <Icon.Grid />}
                <span>{menu.label}</span>
                <span className="menu-arrow" />
              </Link>
              {renderMenuItems(menu.submenuItems, index)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default HorizontalSidebar;