import { BrowserRouter, Route, Routes } from "react-router-dom";

import routes from "./constants/routes";import { Suspense, lazy } from "react";
import PageLoader from "./components/PageLoader";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Enable2FA from "./pages/Enable2FA";
import Configure2FA from "./pages/Configure2FA";
import TwoFA from "./pages/2FAPage";
const Settings = lazy(() => import("./pages/Settings"));
const Workspace = lazy(() => import("./pages/Workspace"));
const Billing = lazy(() => import("./pages/Billing"));
const Home = lazy(() => import("./pages/Home"));
const Documents = lazy(() => import("./pages/Documents"));
const Qa = lazy(() => import("./pages/Qa"));
const Participates = lazy(() => import("./pages/Participates"));
const Log = lazy(() => import("./pages/Log"));
const Workflow = lazy(() => import("./pages/Workflow"));
const Profile = lazy(() => import("./pages/Profile"));
const ForgetPassword = lazy(() => import("./pages/ForgetPassword"));
const Success = lazy(() => import("./utils/Success"));

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={routes.Login} element={<Login/>}  />
        <Route path={routes.SignUp} element={<SignUp />} />
        <Route path={routes.Enable2FA} element={<Enable2FA />} />
        <Route path={routes.Configure2FA} element={<Configure2FA />} />
        <Route path={routes.Code} element={<TwoFA />} />
        <Route path={routes.Settings} element={<Suspense fallback={<PageLoader/>}><Settings /></Suspense>} />
        <Route path={routes.Billing} element={<Suspense fallback={<PageLoader/>}><Billing /></Suspense>} />
        <Route path={routes.Documents} element={<Suspense fallback={<PageLoader/>}><Documents /></Suspense>} />
        <Route path={routes.Workspace} element={<Suspense fallback={<PageLoader/>}><Workspace /></Suspense> } />
        <Route path={routes.Profile} element={<Suspense fallback={<PageLoader/>}><Profile /></Suspense>} />
        <Route path={routes.Home} element={<Suspense fallback={<PageLoader/>}><Home /></Suspense>} />
        <Route path={routes.Workflow} element={<Suspense fallback={<PageLoader/>}><Workflow /></Suspense>} />
        <Route path={routes.Participates} element={<Suspense fallback={<PageLoader/>}><Participates /></Suspense>} />
        <Route path={routes.Qa} element={<Suspense fallback={<PageLoader/>}><Qa /></Suspense>} />
        <Route path={routes.Log} element={<Suspense fallback={<PageLoader/>}><Log /></Suspense>} />
        <Route path={routes.Forget_Pass} element={<Suspense fallback={<PageLoader/>}><ForgetPassword /></Suspense>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
