import { Route } from "react-router-dom";
import React, { Suspense } from "react";
import { all_routes } from "./all_routes";
// import CenteredLoader from "../common/component/CenteredLoader";

import Phase3Page from "../feature-modules/phase3";
import GraphicalRepresentation from "../feature-modules/phase3/graphicalRepresentation";
import SchemePage from "../feature-modules/phase3/schemePage";
import DiscountPage from "../feature-modules/phase3/DiscountApply";
import StockComparison from "../feature-modules/phase3/StockComparison";

const DynamicPage = React.lazy(() => import("../feature-modules/dynamicpages"));
const Phse3DynamicTable = React.lazy(
  () => import("../feature-modules/phase3/DynamicTable")
);
const DynamicTable = React.lazy(
  () => import("../feature-modules/dynamicpages/dynamictable")
);

const routes = all_routes;

export const publicRoutes = [
  {
    id: 2,
    path: routes.dynamicpage,
    name: "Pages",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <DynamicPage />
      </Suspense>
    ),
    route: Route,
  },
];

//================================routes for pages without auth=====================================================

export const pagesRoute = [
  {
    id: 3,
    path: routes.dynamiclist,
    name: "Pages List",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <DynamicTable />
      </Suspense>
    ),
    route: Route,
  },
  {
    id: 7,
    path: routes.summries,
    name: "summries",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <Phase3Page />
      </Suspense>
    ),
    route: Route,
  },
  {
    id: 6,
    path: routes.dashboard,
    name: "Dashboard",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        {/* <Dashboard /> */}
        {/* <Phase3Page /> */}
        <GraphicalRepresentation />
      </Suspense>
    ),
    route: Route,
  },
  {
    id: 10,
    path: routes.schemes,
    name: "Schemes And Display",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <SchemePage />
      </Suspense>
    ),
    route: Route,
  },
  {
    id: 11,
    path: routes.discountPage,
    name: "DiscountPage",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <DiscountPage />
      </Suspense>
    ),
    route: Route,
  },
  {
    id: 9,
    path: routes.stockComparison,
    name: "Stock Comparison",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <StockComparison/>
      </Suspense>
    ),
    route: Route,
  },
  {
    id: 8,
    path: routes.dynamictable,
    name: "dynamictable",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <Phse3DynamicTable />
      </Suspense>
    ),
    route: Route,
  },
];
