import React, { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoImg from "../assets/img/logo-dark.svg";
import routes from "../constants/routes";
import Modal from "../components/Modal";
import { SERVER_BASE_URL } from "../constants/urles";
import { useSelector } from "react-redux";
import { count } from "console";
import AlertModal from "../components/Alert";
const Enable2FA: React.FC = () => {
  const [show2FA, setShow2FA] = useState(false);
  const [mobile, setmobile] = useState<string>('')
  const [countryCode, setcountryCode] = useState<string>('')
  const [alertShow, setalertShow] = useState<boolean>(false)
  const [message, setmessage] = useState<string>('')
  const [typeOfAlert, settypeOfAlert] = useState<string>('')
  const navigate = useNavigate();

  const {token} = useSelector((state:any) => state.userToken)

  const handleEnable2FactorAuth = async(e:FormEvent): Promise<void>=>{
    e.preventDefault()
    try {
      const response = await fetch(`${SERVER_BASE_URL}/auth/send-two-factor`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({mobile:`${countryCode}${mobile}`}),
      });
  
      const authResponse = await response.json();
      if (!response.ok) {
        setmessage(authResponse?.error)
        settypeOfAlert("error")
        setalertShow(true)
        return;
      }
      setmessage("Set 2FA successful")
      settypeOfAlert("error")
      setalertShow(true)
      navigate(routes?.Configure2FA)
    } catch (error) {
      console.error("Error during Auth:", error);
    }
  }
  const getPlaceholder = (countryCode:string): string => {
    switch (countryCode) {
      case '+1':
        return 'e.g., 212-456-7890';
      case '+44':
        return 'e.g., 020 7123 4567';
      case '+91':
        return 'e.g., +91 22 1234 5678';
      case '+61':
        return 'e.g., (02) 1234 5678';
      default:
        return 'Enter phone number';
    }
  };
  return (
    <>
      <div className="login-wrap enable-2fa-wrap d-flex flex-column">
        <div className="logo-wrap d-flex align-items-center justify-content-center">
          <div className="logo">
            <img src={logoImg} alt="" />
          </div>
          <h1 className="logo-wrap-title mb-0">Workspace</h1>
        </div>
        <div className="login-form-wrap text-center position-relative">
          <form>
            <h2 className="login-form-title">2FA</h2>
            <div className="login-form-back-arrow">
              <i className="icon-arrow-left"></i>
            </div>
            <div className="login-form-inner mx-auto">
              <div className="form-check d-inline-flex align-items-center">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="enable2fa"
                  checked={show2FA}
                  onChange={() => setShow2FA(true)}
                />
                <label className="form-check-label" htmlFor="enable2fa">
                  Enable 2FA (recommended)
                </label>
              </div>
              <div className="form-action-btns d-flex">
                <Link
                  to={routes.Workspace}
                  className="btn btn-outline-secondary"
                >
                  SKIP
                </Link>
                <Link to={routes.Configure2FA} className="btn btn-dark">
                  NEXT
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
      <Modal
        className="otp-setup-modal"
        show={show2FA}
        onSave={handleEnable2FactorAuth}
        onSaveBtnText="Verify"
        onCancel={() => setShow2FA(false)}
      >
        <h5 className="modal-title">2FA Setup</h5>
        <div className="phone-input-wrap">
          <select className="phone-code" onChange={(e:React.ChangeEvent<HTMLSelectElement>) => setcountryCode(e.target.value)}>
            <option value="+1">USA</option>
            <option value="+44">UK</option>
            <option value="+91">India</option>
            <option value="+61">Australia</option>
          </select>
          <input
            type="text"
            className="phone-input"
            placeholder={getPlaceholder(countryCode)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setmobile(e.target.value)}
          />
          <i className="icon-alert-circle"></i>
        </div>
        <p>We will send you text with a 6-digit code</p>
      </Modal>
      <AlertModal setShow={setalertShow} show={alertShow} msg={message} type={typeOfAlert}/>
    </>
  );
};

export default Enable2FA;
