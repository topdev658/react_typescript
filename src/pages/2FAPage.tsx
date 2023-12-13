import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoImg from "../assets/img/logo-dark.svg";
import routes from "../constants/routes";
import { SERVER_BASE_URL } from "../constants/urles";
import { useSelector } from "react-redux";
import AlertModal from "../components/Alert";
const TwoFA: React.FC = () => {
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [alertShow, setalertShow] = useState<boolean>(false)
  const [message, setmessage] = useState<string>('')
  const [typeOfAlert, settypeOfAlert] = useState<string>('')
  const { token } = useSelector((state: any) => state.userToken)
  const { mobile } = useSelector((state: any) => state.userMobile)
  const navigate = useNavigate()
  const handleCodeChange = (index: number) => (e: ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = e.target.value.replace(/\D/g, "");
    setVerificationCode((prevCode) => {
      const newCode = prevCode.split('');
      newCode[index] = sanitizedValue;
      const nextIndex = (index + 1) % 6; // Calculate the next index
      if (nextIndex !== 0) {
        // Move focus to the next input
        const nextInput = document.getElementById(`otp-input-${nextIndex}`);
        nextInput?.focus();
      }
      return newCode.join('');
    });
  };

  const handleVerifyCode = async (e: FormEvent): Promise<void> => {
    e.preventDefault()
    try {
      const codeAsInteger = parseInt(verificationCode, 10);
      const response = await fetch(`${SERVER_BASE_URL}/auth/verify-two-factor`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: codeAsInteger }),
      });

      const verificationRespoonse = await response.json();
      if (!response.ok) {
        setmessage(verificationRespoonse?.error)
        settypeOfAlert("error")
        setalertShow(true)
        return;
      }
      setmessage("Verification Successfully...!")
      settypeOfAlert("success")
      setalertShow(true)
      navigate(routes?.Workspace)
    } catch (error) {
      console.error("Error during Verification:", error);
    }

  }

  return (
    <div className="login-wrap configure-2fa d-flex flex-column">
      <div className="logo-wrap d-flex align-items-center justify-content-center">
        <div className="logo">
          <img src={logoImg} alt="" />
        </div>
        <h1 className="logo-wrap-title mb-0">Workspace</h1>
      </div>
      <div className="login-form-wrap text-center position-relative">
        <form onSubmit={handleVerifyCode}>
          <h2 className="login-form-title">2FA</h2>
          <div className="login-form-inner mx-auto">
            <div className="form-resend-link">
              <a href="#" className="d-inline-block text-decoration-underline">
                Resend
              </a>
            </div>
            <div className="form-otp-wrap d-inline-block text-start">
              <label htmlFor="" className="form-label">
                Secure code
              </label>
              <div className="d-flex align-items-center justify-content-center w-100">
                {Array.from({ length: 6 }, (_, index) => (
                  <input
                    key={index}
                    id={`otp-input-${index}`}
                    type="text"
                    className="form-otp-input"
                    maxLength={1}
                    placeholder="0"
                    value={verificationCode[index] || ""}
                    onChange={handleCodeChange(index)}
                  />
                ))}
              </div>
            </div>
            <div className="form-action-btns d-flex">
              <button type="submit" className="btn btn-dark">
                Verify
              </button>
            </div>
          </div>
        </form>
      </div>
      <div className="footer-links-wrap text-center">
        <ul>
          <li className="d-inline-block">
            <a href="#" className="d-block text-decoration-underline">
              Privacy
            </a>
          </li>
          <li className="d-inline-block">
            <a href="#" className="d-block text-decoration-underline">
              Terms & Conditions
            </a>
          </li>
          <li className="d-inline-block">
            <a href="#" className="d-block text-decoration-underline">
              Contact Us
            </a>
          </li>
        </ul>
      </div>
      <AlertModal setShow={setalertShow} show={alertShow} msg={message} type={typeOfAlert} />
    </div>
  );
};

export default TwoFA;
