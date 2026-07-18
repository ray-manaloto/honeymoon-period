import { lazy, Suspense } from "react";
import type { DataProvider, Store } from "react-admin";
import { Admin, CustomRoutes, Layout, Resource } from "react-admin";
import { Route } from "react-router-dom";
import { createHoneymoonDataProvider, type HoneymoonDataProvider } from "./data-provider";
import { AppHeader } from "./header";
import { PeriodList } from "./period-list";

const defaultProvider = createHoneymoonDataProvider();
const CapturePage = lazy(() =>
  import("./capture").then(({ CapturePage }) => ({ default: CapturePage })),
);
const PeriodShow = lazy(() =>
  import("./period-show").then(({ PeriodShow }) => ({ default: PeriodShow })),
);

function AppLayout(props: React.ComponentProps<typeof Layout>) {
  return <Layout {...props} appBar={AppHeader} />;
}

function RouteLoadingState() {
  return (
    <div className="page-shell" role="status">
      Loading page…
    </div>
  );
}

function DeferredCapturePage() {
  return (
    <Suspense fallback={<RouteLoadingState />}>
      <CapturePage />
    </Suspense>
  );
}

function DeferredPeriodShow() {
  return (
    <Suspense fallback={<RouteLoadingState />}>
      <PeriodShow />
    </Suspense>
  );
}

export interface AppProps {
  dataProvider?: HoneymoonDataProvider;
  store?: Store;
  initialPath?: string;
}

export function App({ dataProvider = defaultProvider, store, initialPath }: AppProps) {
  if (initialPath && window.location.hash !== `#${initialPath}`) {
    window.history.replaceState(null, "", `/#${initialPath}`);
  }
  return (
    <Admin
      basename="/"
      dataProvider={dataProvider as DataProvider}
      layout={AppLayout}
      {...(store ? { store } : {})}
      disableTelemetry
      requireAuth={false}
      theme={{
        palette: {
          mode: "light",
          primary: { main: "#315f4d", contrastText: "#fffdf6" },
          secondary: { main: "#b55f3b" },
          background: { default: "#f5f1e7", paper: "#fffdf7" },
        },
        shape: { borderRadius: 12 },
        typography: {
          fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
        },
        components: {},
      }}
    >
      <Resource
        name={reactAdminResource}
        options={{ label: "Ranked ideas" }}
        list={PeriodList}
        show={DeferredPeriodShow}
      />
      <CustomRoutes>
        <Route path="/capture" element={<DeferredCapturePage />} />
      </CustomRoutes>
    </Admin>
  );
}

import { reactAdminResource } from "@honeymoon-period/generated";
