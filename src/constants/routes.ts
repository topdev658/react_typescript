

type Routes = {
  Login: string;
  SignUp: string;
  Enable2FA: string;
  Configure2FA: string;
  Settings: string;
  Billing: string;
  Documents: string;
  Workspace: string;
  Profile: string;
  Home: string;
  Workflow: string;
  Participates: string;
  Qa: string;
  Log: string;
  Forget_Pass:string;
  Reset_Pass:string;
  Payment_success:string;
  Code:string;
};

const routes : Routes = {
  Login: "/",
  SignUp: "/sign-up",
  Enable2FA: "/enable2fa",
  Configure2FA: "/configure2fa",
  Code:'/code',
  Settings: "/settings/:id",
  Billing: "/billing",
  Documents: "/documents/:id",
  Workspace: "/workspace",
  Profile: "/profile",
  Home: "/home/:id",
  Workflow: "/workflow/:id",
  Participates: "/participates/:id",
  Qa: "/qa/:id",
  Log: "/log/:id",
  Payment_success : "/payment_success",
  Forget_Pass:"/forget_pass",
  Reset_Pass:"/reset_password"
};
export default routes;
