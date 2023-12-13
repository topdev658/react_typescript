import React, { useState,ChangeEvent,FormEvent } from "react";
import { Link } from "react-router-dom";
import logoImg from "../assets/img/logo-dark.svg";
import routes from "../constants/routes";
import { useNavigate } from "react-router-dom";
import { SERVER_BASE_URL } from "../constants/urles";
import AlertModal from "../components/Alert";
import { login } from "../components/Login";
import { useDispatch } from "react-redux";
import { userActions, userIdAction } from "../stateManagement/actions/useAction";

interface SignupInfo {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  mobile: string,
  confirmPassword:string
}

const SignUp: React.FC = () => {
  const [signupDetails, setSignupDetails] = useState<SignupInfo>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    mobile: "",
    confirmPassword:""
  });
  const [alertShow, setalertShow] = useState<boolean>(false)
  const [message, setmessage] = useState<string>('')
  const [typeOfAlert, settypeOfAlert] = useState<string>('')
  const [errors, setErrors] = useState<Partial<SignupInfo>>({});
  const [termsAgree, setTermsAgree] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const validateForm = (): boolean => {
    const newErrors: Partial<SignupInfo> = {};

    if (!signupDetails.firstName) {
      newErrors.firstName = "First Name is required";
    }

    if (!signupDetails.lastName) {
      newErrors.lastName = "Last Name is required";
    }

    if (!signupDetails.email) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(signupDetails.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!signupDetails.password) {
      newErrors.password = "Password is required";
    } else if (signupDetails.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!signupDetails.confirmPassword) {
      newErrors.confirmPassword = "Confirm Password is required";
    } else if (signupDetails.confirmPassword !== signupDetails.password) {
      newErrors.confirmPassword = "Passwords must match";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }; 

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
      setSignupDetails((prevValues: SignupInfo) => ({
        ...prevValues,
        [name]: value,
      }));

      setErrors((prevErrors: Partial<SignupInfo>) => ({
        ...prevErrors,
        [name]: "", 
      }));
  };

  const handleSignup = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    const { confirmPassword, ...signupDataToSend } = signupDetails;
    if(!termsAgree){
      window.alert("Please Accept Terms and condition")
      return
    }
    try {
      const response = await fetch(`${SERVER_BASE_URL}/auth/sign-up`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupDataToSend),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        setmessage(errorData?.error)
        settypeOfAlert("error")
        setalertShow(true)
        return;
      }
      setmessage("Signup Successfully....!")
      settypeOfAlert("success")
      setalertShow(true)
      const { success, token, error,userId } = await login({email:signupDataToSend?.email,password:signupDataToSend.password})
      if(token){
        dispatch(userActions(token));
        dispatch(userIdAction(userId))
        navigate(routes?.Enable2FA);
      }
    } catch (error) {
      console.error("Error during signup:", error);
    }
  };
  
  return (
    <div className="login-wrap signup-wrap d-flex flex-column">
    <div className="logo-wrap d-flex align-items-center justify-content-center">
      <div className="logo">
        <img src={logoImg} alt="" />
      </div>
      <h1 className="logo-wrap-title mb-0">Workspace</h1>
    </div>
    <div className="login-form-wrap text-center position-relative">
      <form onSubmit={handleSignup}>
        <h2 className="login-form-title">Create an Account</h2>
        <div className="login-form-inner mx-auto">
          <div className="form-group">
            <label htmlFor="companyName" className="form-label">
              Name of the Company
            </label>
            <input onChange={handleInputChange} type="text" name="companyName" id="companyName" className="form-control" />
          </div>
          <div className="form-group">
            <label htmlFor="firstName" className="form-label">
              First Name<span className="text-danger">*</span>
            </label>
            <input onChange={handleInputChange}  type="text" name="firstName" id="firstName" className="form-control" />
            {errors?.firstName && <div style={{color:"red",textAlign:"start"}}>{errors?.firstName}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="lastName" className="form-label">
              Last Name<span className="text-danger">*</span>
            </label>
            <input type="text" onChange={handleInputChange} name="lastName" id="lastName" className="form-control" />
            {errors?.lastName && <div style={{color:"red",textAlign:"start"}}>{errors?.lastName}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email<span className="text-danger">*</span>
            </label>
            <input onChange={handleInputChange}  type="text" name="email" id="email" className="form-control" />
            {errors?.email && <div style={{color:"red",textAlign:"start"}}>{errors?.email}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password<span className="text-danger">*</span>
            </label>
            <input onChange={handleInputChange}  type="password" name="password" id="password" className="form-control" />
            {errors?.password && <div style={{color:"red",textAlign:"start"}}>{errors?.password}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Re-Password<span className="text-danger">*</span>
            </label>
            <input onChange={handleInputChange} type="password" name="confirmPassword" id="confirmPassword" className="form-control" />
            {errors?.confirmPassword && <div style={{color:"red",textAlign:"start"}}>{errors?.confirmPassword}</div>}
          </div>
        </div>
        <div className="form-terms-agree">
          <div className="form-check d-inline-flex align-items-center">
            <input
              className="form-check-input"
              type="checkbox"
              value="termsAgree"
              id="termsAgree"
              checked={termsAgree}
              onChange={() => setTermsAgree(pre => !pre)}
            />
            <label
              className="form-check-label text-decoration-underline"
              htmlFor="termsAgree"
            >
              I agree to Terms & Conditions
            </label>
          </div>
        </div>
        <div className="login-form-submit-wrap">
          <button className="btn btn-dark with-shadow">
            Sign Up
          </button>
        </div>
        <div className="login-already-signup">
          Already have an account? <Link to={routes.Login}>Login</Link>
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
    <AlertModal setShow={setalertShow} show={alertShow} msg={message} type={typeOfAlert}/>
  </div>
  );
};

export default SignUp;
