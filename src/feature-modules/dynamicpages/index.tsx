import React from "react";
import { dynamicController } from "./controller";
import Wrapper from "../../common/uicomponent/wrapper";
import { FormProvider } from "react-hook-form";
import CenteredLoader from "../../common/component/CenteredLoader";

const DynamicPage: React.FC = () => {
  const {
    Caption,
    form,
    formData,
    handleSubmit,
    // handleCancel,
    renderFieldComponent,
    loading,
    CompnayName,
  } = dynamicController();

  return (
    <Wrapper header={Caption ?? ""} subHeader={CompnayName}>
      {formData?.length === 0 && !loading ? (
        <img
          src="/26691.png"
          alt="No Data Found"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "80vh",
            objectFit: "contain",
          }}
        />
      ) : (
        <>
          {loading && <CenteredLoader />}
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <div
                className="card"
                // style={{ height: "70vh", overflowY: "auto" }}
              >
                <div className="card-body">
                  <div className="new-employee-field">
                    <div className="row">
                      {formData?.map((field: any, index) => (
                        <React.Fragment key={`field-wrapper-${index}`}>
                          {renderFieldComponent(field, index)}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-end mb-1">
                <button type="submit" className="btn btn-primary">
                  Show Report
                </button>
              </div>
            </form>
          </FormProvider>
        </>
      )}
    </Wrapper>
  );
};

export default DynamicPage;
