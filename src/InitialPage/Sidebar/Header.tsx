import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import FeatherIcon from "feather-icons-react";
import ImageWithBasePath from "../../common/component/ImageWithBasePath";
import { clearPersistedStorage, persistor, RootState } from "../../redux/store";
import { ArrowLeft, RefreshCcw, Settings } from "react-feather";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import {
  setSubDashboardData,
  setSubDashboardMapData,
  setSubDashboardTopCategoryData,
  setSubDashboardTopCustData,
  setSubDashboardTopProductData,
  setSubDashboardTopSalesManData,
  setSubDashboardTopStateData,
} from "../../redux/subDashboardSlice";
import {
  fetchDashboardData,
  getGenericSubDashboardData,
} from "../../feature-modules/dashboard/dashboardapi";
import useFetch from "../../hooks/useFetch";
import {
  setDashboardAmountPayData,
  setDashboardAmountRecData,
  setDashboardCashAndBankData,
  setDashboardCriticalData,
  setDashboardData,
  setDashboardSOPOData,
  setDashboardSpData,
  setDashExpenseCardData,
} from "../../redux/dashboardSlice";
import CenteredLoader from "../../common/component/CenteredLoader";
import { all_routes } from "../../router/all_routes";
import { closeModal, openModal } from "../../redux/modalSlice";
import ResetPasswordModal from "../../feature-modules/authentication/passwordreset";
import { useApiHandler } from "../../common/utils/customapiHandler";

const Header: React.FC = () => {
  const { submitHandler } = useApiHandler();
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [toggle, setToggle] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const { decryptedData } = useSelector((state: RootState) => state.authData);
  // console.log("DecData from Header", decryptedData);
  const { UserName, CompnayName, CompCode, FinYear, DBRight, ID, UserMRight } =
    decryptedData || {};
  const { Caption } = location?.state || {};
  const pathname = location.pathname;
  const { navigationTranData } = useSelector(
    (state: RootState) => state.transidebar
  );
  // console.log("TransideBar", navigationTranData);
  const callFetch = useFetch();
  const isElementVisible = (element: HTMLElement): boolean => {
    return element.offsetWidth > 0 || element.offsetHeight > 0;
  };
  const routes = all_routes;
  const slideDownSubmenu = (): void => {
    const subdropPlusUl = document.getElementsByClassName("subdrop");
    Array.from(subdropPlusUl).forEach((element) => {
      const submenu = element.nextElementSibling;
      if (submenu && submenu.tagName.toLowerCase() === "ul") {
        (submenu as HTMLElement).style.display = "block";
      }
    });
  };

  const slideUpSubmenu = (): void => {
    const subdropPlusUl = document.getElementsByClassName("subdrop");
    Array.from(subdropPlusUl).forEach((element) => {
      const submenu = element.nextElementSibling;
      if (submenu && submenu.tagName.toLowerCase() === "ul") {
        (submenu as HTMLElement).style.display = "none";
      }
    });
  };

  useEffect(() => {
    const handleMouseover = (e: MouseEvent): void => {
      e.stopPropagation();

      const body = document.body;
      const toggleBtn = document.getElementById("toggle_btn");

      if (
        body.classList.contains("mini-sidebar") &&
        toggleBtn &&
        isElementVisible(toggleBtn)
      ) {
        const target = (e.target as HTMLElement).closest(
          ".sidebar, .header-left"
        );

        if (target) {
          body.classList.add("expand-menu");
          slideDownSubmenu();
        } else {
          body.classList.remove("expand-menu");
          slideUpSubmenu();
        }
      }
    };

    document.addEventListener("mouseover", handleMouseover);

    return () => {
      document.removeEventListener("mouseover", handleMouseover);
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = (): void => {
      setIsFullscreen(
        !!(
          document.fullscreenElement ||
          (document as any).mozFullScreenElement ||
          (document as any).webkitFullscreenElement ||
          (document as any).msFullscreenElement
        )
      );
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "msfullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  const handlesidebar = (e: any): void => {
    e.preventDefault();
    document.body.classList.toggle("mini-sidebar");
    setToggle((current) => !current);
  };

  const expandMenu = (): void => {
    document.body.classList.remove("expand-menu");
  };

  const expandMenuOpen = (): void => {
    document.body.classList.add("expand-menu");
  };

  const sidebarOverlay = (e: any): void => {
    e.preventDefault();
    document.querySelector(".main-wrapper")?.classList.toggle("slide-nav");
    document.querySelector(".sidebar-overlay")?.classList.toggle("opened");
    document.querySelector("html")?.classList.toggle("menu-opened");
  };

  const toggleFullscreen = (elem?: HTMLElement): void => {
    elem = elem || document.documentElement;
    if (
      !document.fullscreenElement &&
      !(document as any).mozFullScreenElement &&
      !(document as any).webkitFullscreenElement &&
      !(document as any).msFullscreenElement
    ) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if ((elem as any).msRequestFullscreen) {
        (elem as any).msRequestFullscreen();
      } else if ((elem as any).mozRequestFullScreen) {
        (elem as any).mozRequestFullScreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        (elem as any).webkitRequestFullscreen(
          (Element as any).ALLOW_KEYBOARD_INPUT
        );
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    }
  };

  const refreshHandler = async (
    e: React.MouseEvent<HTMLAnchorElement>
  ): Promise<void> => {
    e.preventDefault();
    const value = Number(localStorage.getItem("dashboardToggleValue"));
    console.log("value", value);
    let VchType = UserMRight === 4 ? 9 : UserMRight === 5 ? 2 : 0;
    const storedValue = localStorage.getItem("selectedValue");
    console.log("storedValue", storedValue);
    let MasterCode = 0;
    if (
      (storedValue && UserMRight === 4) ||
      (storedValue && UserMRight === 5)
    ) {
      try {
        const parsedValue = JSON.parse(storedValue);
        MasterCode = parsedValue?.value || 0;
      } catch (error) {
        console.error("Error parsing selectedValue from localStorage:", error);
      }
    }
    const dashboardsubCalls = [
      {
        endpoint: `Report/GetCompanySubDashBoardOSChartData`,
        setter: setSubDashboardData,
      },
      {
        endpoint: `Report/GetCompanySubDashBoardTopCustomers`,
        setter: setSubDashboardTopCustData,
      },
      {
        endpoint: "Report/GetCompanySubDashBoardTopSalesman",
        setter: setSubDashboardTopSalesManData,
      },
      {
        endpoint: `Report/GetCompanySubDashBoardTopStates`,
        setter: setSubDashboardTopStateData,
      },
      {
        endpoint: `Report/GetCompanySubDashBoardTopProduct`,
        setter: setSubDashboardTopProductData,
      },
      {
        endpoint: "Report/GetCompanySubDashBoardTopCategory",
        setter: setSubDashboardTopCategoryData,
      },
      {
        endpoint: `Report/GetCompanySubDashBoardMapData`,
        setter: setSubDashboardMapData,
      },
    ];

    for (const call of dashboardsubCalls) {
      await getGenericSubDashboardData(
        call.endpoint,
        ID,
        CompCode,
        FinYear,
        VchType,
        MasterCode,
        value,
        dispatch,
        call.setter,
        callFetch as any,
        setLoading
      );
    }

    const dashboardCalls: any = [
      {
        endpoint: "Report/GetCompanyDashBoardOtherData",
        setter: setDashboardData,
      },
      {
        endpoint: "Report/GetCompanyDashBoardExpenseData",
        setter: setDashExpenseCardData,
      },
      {
        endpoint: `Report/GetCompanyDashBoardSpData`,
        setter: setDashboardSpData,
      },
      {
        endpoint: "Report/GetCompanyDashBoardCriticalLData",
        setter: setDashboardCriticalData,
      },
      {
        endpoint: `Report/GetCompanyDashBoardAgeingFifoData`,
        setter: setDashboardAmountRecData,
        RType: 1,
      },
      {
        endpoint: `Report/GetCompanyDashBoardAgeingFifoData`,
        setter: setDashboardAmountPayData,
        RType: 2,
      },
      {
        endpoint: `Report/GetCompanyDashBoardSOPODATA`,
        setter: setDashboardSOPOData,
      },
      {
        endpoint: "Report/GetCompanyDashBoardBankCashBData",
        setter: setDashboardCashAndBankData,
      },
    ];
    let userTypeID = UserMRight === 4 || UserMRight === 5 ? UserMRight : 0;
    await dashboardCalls.forEach((call: any) =>
      fetchDashboardData({
        UserID: ID,
        CompCode: CompCode!,
        FinYear: FinYear!,
        VchType,
        MasterCode,
        userTypeID,
        endpoint: call.endpoint,
        dispatch,
        setter: call.setter,
        callFetch,
        RType: call.RType,
        setLoading,
      }).catch((error) =>
        console.error(`Error in fetching data from ${call.endpoint}:`, error)
      )
    );
    setLoading(false);
  };

  const clearAllCaches = async () => {
    try {
      // 1. Clear IndexedDB storage
      await clearPersistedStorage();
      // console.log("IndexedDB storage cleared.");

      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
          console.log("Service worker unregistered:", registration.scope);
        }

        if (window.caches) {
          const cacheNames = await window.caches.keys();
          await Promise.all(
            cacheNames.map((cacheName) => {
              console.log(`Clearing cache: ${cacheName}`);
              return window.caches.delete(cacheName);
            })
          );
          console.log("All service worker caches cleared.");
        }
      }

      const meta = document.createElement("meta");
      meta.httpEquiv = "Cache-Control";
      meta.content = "no-cache, no-store, must-revalidate";
      document.head.appendChild(meta);

      const meta2 = document.createElement("meta");
      meta2.httpEquiv = "Pragma";
      meta2.content = "no-cache";
      document.head.appendChild(meta2);

      const meta3 = document.createElement("meta");
      meta3.httpEquiv = "Expires";
      meta3.content = "0";
      document.head.appendChild(meta3);

      console.log("Browser cache control headers set to prevent caching.");
    } catch (error) {
      console.error("Error clearing caches:", error);
    }
  };
  const handleBackNavigation = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate(-1);
  };
  // Exclusion logic for specific paths
  const exclusionArray = [
    "/reactjs/template/dream-pos/index-three",
    "/reactjs/template/dream-pos/index-one",
  ];
  if (exclusionArray.includes(location.pathname)) {
    return null;
  }
  const handleFormSave = useCallback(
    async (data: any) => {
      try {
        let payload = {
          UserID: Number(ID),
          PWD: data.password,
        };

        console.log("Master-Json", JSON.stringify(payload));
        let url = `Report/ChangePassword?CompCode=${CompCode}&FY=${FinYear}`;
        await submitHandler({
          url: url,
          method: "POST",
          data: payload,
          setLoading: () => { },
          onSuccess: () => {
            // form.reset();
            dispatch(closeModal());
            navigate("/signin");
            sessionStorage.clear();
            persistor.purge();
            // tableListHandler(parseInt(id));
          },
          onError: (error: unknown) => {
            console.error("Error saving form:", error);
            // updateState({ loading: false });
          },
        });
      } catch (error) {
        console.error("Error saving form:", error);
        // updateState({ loading: false });
      }
    },
    [dispatch]
  );
  const handleFormCancel = useCallback(() => {
    // form.reset();
    dispatch(closeModal());
  }, [dispatch]);

  const formButtons = useMemo(
    () => [
      { label: "Cancel", variant: "secondary", onClick: handleFormCancel },
      {
        label: "Save",
        variant: "primary",
        onClick: () => {
          // Trigger form submission via onSave
          const modalContent = document.querySelector(".reusable-modal");
          if (modalContent) {
            const form = modalContent.querySelector("form");
            if (form) {
              form.dispatchEvent(
                new Event("submit", { cancelable: true, bubbles: true })
              );
            }
          }
        },
      },
    ],
    [handleFormCancel, handleFormSave]
  );

  const handleCommonModal = useCallback(() => {
    dispatch(
      openModal({
        title: "Reset Password",
        content: (
          <ResetPasswordModal
            onSubmit={handleFormSave}
            onSave={() => {
              // Trigger form submission
              const modalContent = document.querySelector(".reusable-modal");
              if (modalContent) {
                const form = modalContent.querySelector("form");
                if (form) {
                  form.dispatchEvent(
                    new Event("submit", { cancelable: true, bubbles: true })
                  );
                }
              }
            }}
          />
        ),
        size: "lg",
        backdrop: "static",
        footerButtons: formButtons,
        className: "reusable-modal",
      })
    );
  }, [dispatch]);

  return (
    <div className="header">
      {loading && <CenteredLoader />}
      {/* Logo */}
      <div
        className={`header-left ${toggle ? "" : "active"}`}
        onMouseLeave={expandMenu}
        onMouseOver={expandMenuOpen}
      >
        <Link
          to="/"
          className="logo logo-normal"
        // onClick={(e) => e.preventDefault()}
        >
          <img src="https://market99.com/cdn/shop/files/M_LOGO.png?v=1695998992&width=130" alt="Logo" />
        </Link>
        <Link
          to="/"
          className="logo logo-white"
        // onClick={(e) => e.preventDefault()}
        >
          <img src="https://market99.com/cdn/shop/files/M_LOGO.png?v=1695998992&width=130" alt="Logo" />
        </Link>
        <Link to="/" className="logo-small" onClick={(e) => e.preventDefault()}>
          <img src="https://market99.com/cdn/shop/files/M_LOGO.png?v=1695998992&width=130" alt="Logo" />
        </Link>
        <Link
          id="toggle_btn"
          to="#"
          style={{
            display:
              location.pathname.includes("tasks") ||
                location.pathname.includes("compose")
                ? "none"
                : "",
          }}
          onClick={handlesidebar}
        >
          <FeatherIcon icon="chevrons-left" className="feather-16" />
        </Link>
      </div>
      {/* /Logo */}
      <Link
        id="mobile_btn"
        className="mobile_btn"
        to="#"
        onClick={sidebarOverlay}
      >
        <span className="bar-icon">
          <span />
          <span />
          <span />
        </span>
      </Link>
      {/* Header Menu */}
      <ul className="nav user-menu">
        {/* Search */}
        <li className="nav-item nav-searchinputs">
          <h5>{CompnayName}</h5>
          <h5 className="text-muted">{Caption || ""}</h5>
        </li>
        {/* /Search */}

        {/* Select Store */}
        <li className="nav-item dropdown has-arrow main-drop select-store-dropdown"></li>
        {/* /Select Store */}

        {/* Flag */}
        {navigationTranData?.length > 0 && (
          <li className="nav-item dropdown has-arrow flag-nav nav-item-box">
            <Link
              className="nav-link dropdown-toggle"
              data-bs-toggle="dropdown"
              to="#"
              role="button"
              onClick={(e) => {
                e.preventDefault();
              }}
            >
              <FeatherIcon icon="file-text" />
            </Link>
            <div className="dropdown-menu dropdown-menu-right">
              {navigationTranData?.map((item: any) => (
                <Link
                  to={item.Link}
                  className="dropdown-item"
                  key={item.UserName}
                >
                  {item?.UserName === "Order" ? (
                    <FeatherIcon icon="shopping-cart" className="me-2" />
                  ) : (
                    <FeatherIcon icon="file-text" className="me-2" />
                  )}{" "}
                  {item.UserName}
                </Link>
              ))}
            </div>
          </li>
        )}
        {/* /Flag */}
        {pathname === "/" && DBRight === 1 && (
          <li className="nav-item nav-item-box">
            <Link to="#" onClick={refreshHandler}>
              <RefreshCcw />
            </Link>
          </li>
        )}

        <li className="nav-item nav-item-box">
          <Link
            to="#"
            id="btnFullscreen"
            onClick={(e) => {
              toggleFullscreen();
              e.preventDefault();
            }}
            className={isFullscreen ? "Exit Fullscreen" : "Go Fullscreen"}
          >
            <FeatherIcon icon="maximize" />
          </Link>
        </li>
        <li
          className="nav-item nav-item-box"
          onClick={(e) => e.stopPropagation()}
        >
          {pathname === "/" ? (
            <Link to="/company" state={{ userDataStr: decryptedData }}>
              <ArrowLeft />
            </Link>
          ) : (
            <Link to="#" onClick={handleBackNavigation}>
              <ArrowLeft />
            </Link>
          )}
        </li>

        <li className="nav-item dropdown has-arrow main-drop">
          <Link
            to="#"
            className="dropdown-toggle nav-link userset"
            data-bs-toggle="dropdown"
          >
            <span className="user-info">
              <span className="user-letter">
                <ImageWithBasePath
                  src="https://market99.com/cdn/shop/files/M_LOGO.png?v=1695998992&width=130"
                  alt="img"
                  className="img-fluid"
                />
              </span>
              <span className="user-detail">
                <span className="user-name">{UserName}</span>
                <span className="user-role"></span>
              </span>
            </span>
          </Link>
          <div className="dropdown-menu menu-drop-user">
            <div className="profilename">
              <Link
                className="dropdown-item setting pb-0"
                to="/company"
                state={{ userDataStr: decryptedData }}
              >
                <ArrowLeft />
                Company
              </Link>
              <Link
                className="dropdown-item setting pb-0"
                to="#"
                onClick={handleCommonModal}
              >
                <Settings />
                Reset Password
              </Link>
              <Link
                className="dropdown-item logout pb-0"
                to="/signin"
                onClick={() => {
                  sessionStorage.clear();
                  localStorage.clear();
                  clearAllCaches();
                }}
              >
                <ImageWithBasePath
                  src="assets/img/icons/log-out.svg"
                  alt="img"
                  className="me-2"
                />
                Logout
              </Link>
            </div>
          </div>
        </li>
      </ul>
      {/* /Header Menu */}
      {/* Mobile Menu */}

      <div className="dropdown mobile-user-menu">
        <Link
          to="#"
          className="nav-link dropdown-toggle"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <i className="fa fa-ellipsis-v" />
        </Link>
        <div className="dropdown-menu dropdown-menu-right">
          <Link
            to="/company"
            className="dropdown-item"
            state={{ userDataStr: decryptedData }}
          >
            Company
          </Link>
          <Link to={routes.order} className="dropdown-item">
            Orders
          </Link>
          <Link to={routes.receipt} className="dropdown-item">
            {" "}
            Receipt
          </Link>
          <Link
            className="dropdown-item setting pb-0"
            to="#"
            onClick={handleCommonModal}
          >
            Reset Password
          </Link>
          <Link
            className="dropdown-item"
            to="signin"
            onClick={() => {
              sessionStorage.clear();
              localStorage.clear();
              persistor.purge();
            }}
          >
            Logout
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Header;
