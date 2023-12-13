import React, { ChangeEvent, useState } from "react";
import logoImg from "../assets/img/icons/logo-dark.svg";
import { SERVER_BASE_URL } from "../constants/urles";
import AlertModal from "../components/Alert";

const ForgetPassword = () => {
  const [passwordSent, setPasswordSent] = useState(false);
  const [alertShow, setalertShow] = useState<boolean>(false);
  const [message, setmessage] = useState<string>("");
  const [typeOfAlert, settypeOfAlert] = useState<string>("");
  const [email, setEmail] = useState(""); // State to store the user's email
  const apiUrl: string = `${SERVER_BASE_URL}/auth/forgot-password`;

  // Define the type for your response data
  interface ForgotPasswordData {
    msg: string;
  }

  interface ErrorResponse {
    error: string;
  }

  const handleResetPassword = async (): Promise<void> => {
	try {
	  const response = await fetch(`${SERVER_BASE_URL}/auth/forgot-password`, {
		method: "POST",
		headers: {
		  "Content-Type": "application/json",
		},
		body: JSON.stringify({
		  email:email
		}),
	  });
  
	  if (!response.ok) {
		const resetResponse = await response.json();
		console.error("Password reset failed:", resetResponse?.error);
		setmessage(resetResponse?.error || "An unknown error occurred");
		settypeOfAlert("error");
		setalertShow(true);
		return;
	  }
  
	  setmessage("Password reset successful!");
	  settypeOfAlert("success");
	  setalertShow(true);
	  setPasswordSent(true)
	} catch (error) {
	  console.error("Error during password reset:", error);
	  setmessage("An unknown error occurred");
	  settypeOfAlert("error");
	  setalertShow(true);
	}
  };
  

  return (
    <div className="login-wrap d-flex flex-column">
      <div className="logo-wrap d-flex align-items-center justify-content-center">
        <div className="logo">
          <img src={logoImg} alt="something" />
        </div>
        <h1 className="logo-wrap-title mb-0">Workspace</h1>
      </div>
      <div className="login-form-wrap text-center position-relative">
        <form>
          <div className="login-form-inner mx-auto">
            <div className={!passwordSent ? "mb-5" : "mb-0"}>
              <h2 className="login-form-title mb-4">
                {!passwordSent ? "Forgot Password?" : "Check your email"}
              </h2>
              <p style={{ fontSize: "14px" }}>
                {!passwordSent
                  ? "No worries we’ll send you reset instruction."
                  : "We have sent a password reset link!"}
              </p>
            </div>
            {!passwordSent && (
              <React.Fragment>
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    className="form-control"
                  />
                </div>
                <div className="login-form-submit-wrap">
                  <button type="button" onClick={handleResetPassword} className="btn btn-dark with-shadow">
                    Reset Password
                  </button>
                </div>
              </React.Fragment>
            )}
          </div>
        </form>
      </div>
      <AlertModal setShow={setalertShow} show={alertShow} msg={message} type={typeOfAlert} />
    </div>
  );
};

export default ForgetPassword;
