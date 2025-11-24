interface FetchDashboardOptions {
  UserID: any;
  CompCode: string;
  FinYear: string;
  RType?: number;
  endpoint: string;
  dispatch: any;
  setter: (data: any[]) => void;
  callFetch: any;
  setLoading?: (val: boolean) => void;
  queryParams?: Record<string, string | number>;
  VchType?: any;
  MasterCode?: any;
  userTypeID?:any;
}
export const fetchDashboardData = async ({
  UserID,
  CompCode,
  FinYear,
  VchType,
  MasterCode,
  userTypeID,
  RType,
  endpoint,
  dispatch,
  setter,
  callFetch,
  setLoading,
  queryParams = {},
}: FetchDashboardOptions): Promise<boolean> => {
  if (setLoading) setLoading(true);
  dispatch(setter([]));

  try {
    const params = new URLSearchParams({
      UserID,
      CompCode,
      FY: FinYear,
      VchType,
      MasterCode,
      userTypeID,
      ...(RType !== undefined ? { RType: RType.toString() } : {}),
      ...Object.fromEntries(
        Object.entries(queryParams).map(([key, value]) => [key, String(value)])
      ),
    });

    const url = `${endpoint}?${params.toString()}`;
    console.log("url from reuseApi", url);
    const { res, got } = await callFetch(url, "GET");

    if (res?.status === 200 && got?.Data) {
      dispatch(setter(got.Data));
      return true;
    } else {
      console.error("Failed to load dashboard data:", got);
      return false;
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return false;
  } finally {
    if (setLoading) setLoading(false);
  }
};

export const getDashBoardData = async (
  CompCode: any,
  FinYear: any,
  dispatch: any,
  setDashboardData: (data: any[]) => void,
  callFetch: (url: string, method: string) => Promise<{ res: any; got: any }>,
  setLoading?: (val: boolean) => void
) => {
  if (setLoading) setLoading(true);
  dispatch(setDashboardData([]));

  try {
    const url = `Report/GetCompanyDashBoardOtherData?CompCode=${CompCode}&FY=${FinYear}`;
    // console.log("Fetching dashboard data for CompCode:", CompCode);

    const { res, got } = await callFetch(url, "GET");
    // console.log("API Response (Dashboard)==>:", got);

    if (res?.status === 200 && got?.Data) {
      dispatch(setDashboardData(got.Data));
      return true;
    } else {
      console.error("Failed to load dashboard data:", got);
      return false;
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return false;
  } finally {
    if (setLoading) setLoading(false);
  }
};

export const getSpDashBoardData = async (
  CompCode: any,
  FinYear: any,
  dispatch: any,
  setDashboardSpData: (data: any[]) => void,
  callFetch: (url: string, method: string) => Promise<{ res: any; got: any }>,
  setLoading?: (val: boolean) => void
) => {
  if (setLoading) setLoading(true);
  dispatch(setDashboardSpData([]));

  try {
    const url = `Report/GetCompanyDashBoardSPData?CompCode=${CompCode}&FY=${FinYear}`;
    // console.log("Fetching dashboard data for CompCode:", CompCode);

    const { res, got } = await callFetch(url, "GET");
    // console.log("API Response (Dashboard):", got);

    if (res?.status === 200 && got?.Data) {
      dispatch(setDashboardSpData(got.Data));
      return true;
    } else {
      console.error("Failed to load dashboard data:", got);
      return false;
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return false;
  } finally {
    if (setLoading) setLoading(false);
  }
};

export const getCriticalDashBoardData = async (
  CompCode: any,
  FinYear: any,
  dispatch: any,
  setDashboardCriticalData: (data: any[]) => void,
  callFetch: (url: string, method: string) => Promise<{ res: any; got: any }>,
  setLoading?: (val: boolean) => void
) => {
  if (setLoading) setLoading(true);
  dispatch(setDashboardCriticalData([]));

  try {
    const url = `Report/GetCompanyDashBoardCriticalLData?CompCode=${CompCode}&FY=${FinYear}`;
    // console.log("Fetching dashboard data for CompCode:", CompCode);

    const { res, got } = await callFetch(url, "GET");
    // console.log("API Response (Dashboard):", got);

    if (res?.status === 200 && got?.Data) {
      dispatch(setDashboardCriticalData(got.Data));
      return true;
    } else {
      console.error("Failed to load dashboard data:", got);
      return false;
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return false;
  } finally {
    if (setLoading) setLoading(false);
  }
};
export const getSOPODashBoardData = async (
  CompCode: any,
  FinYear: any,
  dispatch: any,
  setDashboardSOPOData: (data: any[]) => void,
  callFetch: (url: string, method: string) => Promise<{ res: any; got: any }>,
  setLoading?: (val: boolean) => void
) => {
  if (setLoading) setLoading(true);
  dispatch(setDashboardSOPOData([]));

  try {
    const url = `Report/GetCompanyDashBoardSOPOData?CompCode=${CompCode}&FY=${FinYear}`;
    // console.log("Fetching dashboard data for CompCode:", CompCode);

    const { res, got } = await callFetch(url, "GET");
    // console.log("API Response (Dashboard):", got);

    if (res?.status === 200 && got?.Data) {
      dispatch(setDashboardSOPOData(got.Data));
      return true;
    } else {
      console.error("Failed to load dashboard data:", got);
      return false;
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return false;
  } finally {
    if (setLoading) setLoading(false);
  }
};
export const getCashAndBankDashBoardData = async (
  CompCode: any,
  FinYear: any,
  dispatch: any,
  setDashboardCashAndBankData: (data: any[]) => void,
  callFetch: (url: string, method: string) => Promise<{ res: any; got: any }>,
  setLoading?: (val: boolean) => void
) => {
  if (setLoading) setLoading(true);
  dispatch(setDashboardCashAndBankData([]));

  try {
    const url = `Report/GetCompanyDashBoardBankCashBData?CompCode=${CompCode}&FY=${FinYear}`;
    // console.log("Fetching dashboard data for CompCode:", CompCode);

    const { res, got } = await callFetch(url, "GET");
    // console.log("API Response (Dashboard):", got);

    if (res?.status === 200 && got?.Data) {
      dispatch(setDashboardCashAndBankData(got.Data));
      return true;
    } else {
      console.error("Failed to load dashboard data:", got);
      return false;
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return false;
  } finally {
    if (setLoading) setLoading(false);
  }
};
export const getAmtPayDashBoardData = async (
  CompCode: any,
  FinYear: any,
  dispatch: any,
  setDashboardAmountPayData: (data: any[]) => void,
  callFetch: (url: string, method: string) => Promise<{ res: any; got: any }>,
  setLoading?: (val: boolean) => void
) => {
  if (setLoading) setLoading(true);
  dispatch(setDashboardAmountPayData([]));

  try {
    const url = `Report/GetCompanyDashBoardAgeingFifoData?CompCode=${CompCode}&FY=${FinYear}&RType=1`;
    // console.log("Fetching dashboard data for CompCode:", CompCode);

    const { res, got } = await callFetch(url, "GET");
    // console.log("API Response (Dashboard):", got);

    if (res?.status === 200 && got?.Data) {
      dispatch(setDashboardAmountPayData(got.Data));
      return true;
    } else {
      console.error("Failed to load dashboard data:", got);
      return false;
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return false;
  } finally {
    if (setLoading) setLoading(false);
  }
};
export const getAmtRecDashBoardData = async (
  CompCode: any,
  FinYear: any,
  dispatch: any,
  setDashboardAmountRecData: (data: any[]) => void,
  callFetch: (url: string, method: string) => Promise<{ res: any; got: any }>,
  setLoading?: (val: boolean) => void
) => {
  if (setLoading) setLoading(true);
  dispatch(setDashboardAmountRecData([]));

  try {
    const url = `Report/GetCompanyDashBoardAgeingFifoData?CompCode=${CompCode}&FY=${FinYear}&RType=2`;
    // console.log("Fetching dashboard data for CompCode:", CompCode);

    const { res, got } = await callFetch(url, "GET");
    // console.log("API Response (Dashboard):", got);

    if (res?.status === 200 && got?.Data) {
      dispatch(setDashboardAmountRecData(got.Data));
      return true;
    } else {
      console.error("Failed to load dashboard data:", got);
      return false;
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return false;
  } finally {
    if (setLoading) setLoading(false);
  }
};

// ========================================dashBoard-after-toggel===================================

export const getSubDashboardData = async (
  CompCode: any,
  FinYear: any,
  RType: number,
  dispatch: any,
  setSubDashboardData: (data: any[]) => void,
  callFetch: (url: string, method: string) => Promise<{ res: any; got: any }>,
  setLoading?: (val: boolean) => void // optional state loader
) => {
  if (setLoading) setLoading(true);

  try {
    const url = `Report/GetCompanySubDashBoardOSChartData?CompCode=${CompCode}&FY=${FinYear}&RType=${RType}`;
    // console.log("Fetching Dashboard Data from URL:", url);

    const { res, got } = await callFetch(url, "GET");
    // console.log("SubDashboard API Response:", got);

    if (res?.status === 200 && got?.Data) {
      dispatch(setSubDashboardData(got.Data));
    } else {
      console.log("Failed to fetch dashboard data");
      dispatch(setSubDashboardData([]));
    }
  } catch (error: any) {
    console.error("Error fetching sub dashboard data:", error);
    console.log(error.message || "Unexpected error");
    dispatch(setSubDashboardData([]));
  } finally {
    if (setLoading) setLoading(false);
  }
};
export const getSubDashboardTopCustData = async (
  CompCode: any,
  FinYear: any,
  RType: number,
  dispatch: any,
  setSubDashboardData: (data: any[]) => void,
  callFetch: (url: string, method: string) => Promise<{ res: any; got: any }>,
  setLoading?: (val: boolean) => void // optional state loader
) => {
  if (setLoading) setLoading(true);

  try {
    const url = `Report/GetCompanySubDashBoardTopCustomers?CompCode=${CompCode}&FY=${FinYear}&RType=${RType}`;
    // console.log("Fetching Dashboard Data from URL:", url);

    const { res, got } = await callFetch(url, "GET");
    // console.log("SubDashboard API Response:", got);

    if (res?.status === 200 && got?.Data) {
      dispatch(setSubDashboardData(got.Data));
    } else {
      console.log("Failed to fetch dashboard data");
      dispatch(setSubDashboardData([]));
    }
  } catch (error: any) {
    console.error("Error fetching sub dashboard data:", error);
    console.log(error.message || "Unexpected error");
    dispatch(setSubDashboardData([]));
  } finally {
    if (setLoading) setLoading(false);
  }
};
export const getSubDashboardTopSalesmanData = async (
  CompCode: any,
  FinYear: any,
  RType: number,
  dispatch: any,
  setSubDashboardData: (data: any[]) => void,
  callFetch: (url: string, method: string) => Promise<{ res: any; got: any }>,
  setLoading?: (val: boolean) => void // optional state loader
) => {
  if (setLoading) setLoading(true);

  try {
    const url = `Report/GetCompanySubDashBoardTopSalesman?CompCode=${CompCode}&FY=${FinYear}&RType=${RType}`;
    // console.log("Fetching Dashboard Data from URL:", url);

    const { res, got } = await callFetch(url, "GET");
    // console.log("SubDashboard API Response:", got);

    if (res?.status === 200 && got?.Data) {
      dispatch(setSubDashboardData(got.Data));
    } else {
      console.log("Failed to fetch dashboard data");
      dispatch(setSubDashboardData([]));
    }
  } catch (error: any) {
    console.error("Error fetching sub dashboard data:", error);
    console.log(error.message || "Unexpected error");
    dispatch(setSubDashboardData([]));
  } finally {
    if (setLoading) setLoading(false);
  }
};
export const getSubDashboardTopStatesData = async (
  CompCode: any,
  FinYear: any,
  RType: number,
  dispatch: any,
  setSubDashboardData: (data: any[]) => void,
  callFetch: (url: string, method: string) => Promise<{ res: any; got: any }>,
  setLoading?: (val: boolean) => void // optional state loader
) => {
  if (setLoading) setLoading(true);

  try {
    const url = `Report/GetCompanySubDashBoardTopStates?CompCode=${CompCode}&FY=${FinYear}&RType=${RType}`;
    // console.log("Fetching Dashboard Data from URL:", url);

    const { res, got } = await callFetch(url, "GET");
    // console.log("SubDashboard API Response:", got);

    if (res?.status === 200 && got?.Data) {
      dispatch(setSubDashboardData(got.Data));
    } else {
      console.log("Failed to fetch dashboard data");
      dispatch(setSubDashboardData([]));
    }
  } catch (error: any) {
    console.error("Error fetching sub dashboard data:", error);
    console.log(error.message || "Unexpected error");
    dispatch(setSubDashboardData([]));
  } finally {
    if (setLoading) setLoading(false);
  }
};
export const getSubDashboardTopProductData = async (
  CompCode: any,
  FinYear: any,
  RType: number,
  dispatch: any,
  setSubDashboardData: (data: any[]) => void,
  callFetch: (url: string, method: string) => Promise<{ res: any; got: any }>,
  setLoading?: (val: boolean) => void // optional state loader
) => {
  if (setLoading) setLoading(true);

  try {
    const url = `Report/GetCompanySubDashBoardTopProduct?CompCode=${CompCode}&FY=${FinYear}&RType=${RType}`;
    // console.log("Fetching Dashboard Data from URL:", url);

    const { res, got } = await callFetch(url, "GET");
    // console.log("SubDashboard API Response:", got);

    if (res?.status === 200 && got?.Data) {
      dispatch(setSubDashboardData(got.Data));
    } else {
      console.log("Failed to fetch dashboard data");
      dispatch(setSubDashboardData([]));
    }
  } catch (error: any) {
    console.error("Error fetching sub dashboard data:", error);
    console.log(error.message || "Unexpected error");
    dispatch(setSubDashboardData([]));
  } finally {
    if (setLoading) setLoading(false);
  }
};
export const getSubDashboardTopCategoryData = async (
  CompCode: any,
  FinYear: any,
  RType: number,
  dispatch: any,
  setSubDashboardData: (data: any[]) => void,
  callFetch: (url: string, method: string) => Promise<{ res: any; got: any }>,
  setLoading?: (val: boolean) => void // optional state loader
) => {
  if (setLoading) setLoading(true);

  try {
    const url = `Report/GetCompanySubDashBoardTopCategory?CompCode=${CompCode}&FY=${FinYear}&RType=${RType}`;
    // console.log("Fetching Dashboard Data from URL:", url);

    const { res, got } = await callFetch(url, "GET");
    // console.log("SubDashboard API Response:", got);

    if (res?.status === 200 && got?.Data) {
      dispatch(setSubDashboardData(got.Data));
    } else {
      console.log("Failed to fetch dashboard data");
      dispatch(setSubDashboardData([]));
    }
  } catch (error: any) {
    console.error("Error fetching sub dashboard data:", error);
    console.log(error.message || "Unexpected error");
    dispatch(setSubDashboardData([]));
  } finally {
    if (setLoading) setLoading(false);
  }
};
export const getSubDashboardMapData = async (
  CompCode: any,
  FinYear: any,
  RType: number,
  dispatch: any,
  setSubDashboardData: (data: any[]) => void,
  callFetch: (url: string, method: string) => Promise<{ res: any; got: any }>,
  setLoading?: (val: boolean) => void // optional state loader
) => {
  if (setLoading) setLoading(true);

  try {
    const url = `Report/GetCompanySubDashBoardMapData?CompCode=${CompCode}&FY=${FinYear}&RType=${RType}`;
    // console.log("Fetching Dashboard Data from URL:", url);

    const { res, got } = await callFetch(url, "GET");
    // console.log("SubDashboard API Response:", got);

    if (res?.status === 200 && got?.Data) {
      dispatch(setSubDashboardData(got.Data));
    } else {
      console.log("Failed to fetch dashboard data");
      dispatch(setSubDashboardData([]));
    }
  } catch (error: any) {
    console.error("Error fetching sub dashboard data:", error);
    console.log(error.message || "Unexpected error");
    dispatch(setSubDashboardData([]));
  } finally {
    if (setLoading) setLoading(false);
  }
};

export const getGenericSubDashboardData = async (
  endpoint: string,
  userID: any,
  CompCode: string,
  FinYear: string,
  VchType: any,
  MasterCode: any,
  RType: number,
  dispatch: any,
  setter: (data: any[]) => void,
  callFetch: (url: string, method: string) => Promise<{ res: any; got: any }>,
  setLoading?: (val: any) => void
  // loadingSetter?:any
) => {
  if (setLoading) {
    setLoading(true);
    // dispatch(setLoading(true));
  }
  try {
    const url = `${endpoint}?userID=${userID}&CompCode=${CompCode}&FY=${FinYear}&RType=${RType}&VchType=${VchType}&MasterCode=${MasterCode}`;
    console.log("url-subDash", url);
    const { res, got } = await callFetch(url, "GET");
    // dispatch(setter([]));
    if (res?.status === 200 && got?.Data) {
      dispatch(setter(got.Data));
    } else {
      console.error(`Failed to fetch dashboard data from ${endpoint}`);
      dispatch(setter([]));
    }
  } catch (error: any) {
    console.error(
      `Error fetching dashboard data from ${endpoint}:`,
      error.message || error
    );
    dispatch(setter([]));
  } finally {
    if (setLoading) {
      setLoading(false);
      // dispatch(setLoading(false));
    }
  }
};
