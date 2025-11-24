import React, { useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import CenteredLoader from "../../common/component/CenteredLoader";

const Dashboard: React.FC = () => {
  // const { decryptedData } = useSelector((state: RootState) => state.authData);
  // const { CompCode, FinYear, DBRight, ID, UserMRight } = decryptedData || {};
  // console.log("UserMRight", UserMRight);

  // const theme = useSelector((state: RootState) => state.root.theme);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const callFetch = useFetch();


  // Form setup
  const methods = useForm<{ toggleValue: number; uType4Value: any }>({
    defaultValues: {
      toggleValue: Number(localStorage.getItem("dashboardToggleValue")) || 2,
      uType4Value: null,
    },
  });
  const { watch, setValue } = methods;
  const toggleValue = watch("toggleValue");



  return (
    // <FormProvider {...methods}>
    <div className="page-wrapper">
      {/* {loading && <CenteredLoader />} */}
      <p className="d-flex justify-content-center align-items-center">Himanshu</p>
    </div>
    // </FormProvider>
  );
};

export default Dashboard;
