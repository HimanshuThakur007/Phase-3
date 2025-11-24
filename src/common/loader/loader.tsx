import React, { useEffect, useState, memo } from "react";
import { Route, Routes, useLocation } from "react-router-dom";

const Loader: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const location = useLocation();

  const showLoader = () => {
    setLoading(true);
  };

  const hideLoader = () => {
    setLoading(false);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    showLoader();
    const timeoutId = setTimeout(() => {
      hideLoader();
    }, 600);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [location.pathname]);

  return (
    <div>
      {loading && (
        <div id="global-loader">
          <div className="whirly-loader"></div>
        </div>
      )}
      <Routes>
        <Route path="/" element={null} />
      </Routes>
    </div>
  );
};

export default memo(Loader);
