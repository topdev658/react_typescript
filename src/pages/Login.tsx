import React,{FC,useState} from "react";
import { Link, useNavigate } from "react-router-dom"
import logoImg from "../assets/img/logo-dark.svg";
import routes  from "../constants/routes";
import { SERVER_BASE_URL } from "../constants/urles";
import { useDispatch } from "react-redux";
import { mobileNumberAction, userActions, userIdAction } from "../stateManagement/actions/useAction";
import AlertModal from "../components/Alert";
import { login } from "../components/Login";
import PageLoader from "../components/PageLoader";
interface LoginCredentials {
  email: string;
  password: string;
}
interface ErrorInterFace {
  email:string,
  password:string
}
const Login: React.FC = () => {
  const [loginCredentials, setLoginCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [error, seterror] = useState({
    email:"",
    password:""
  })
  const [alertShow, setalertShow] = useState<boolean>(false)
  const [message, setmessage] = useState<string>('')
  const [loading, setloading] = useState<boolean>(false)
  const [typeOfAlert, settypeOfAlert] = useState<string>('')
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const handleInputChange = ( e: React.ChangeEvent<HTMLInputElement>): void => {
    seterror(prevError => ({ ...prevError, [name]: "" }))
    const { name, value } = e.target;
    setLoginCredentials((prevCredentials : LoginCredentials) => ({
      ...prevCredentials,
      [name]: value,
    }));
  };

  const isEmailValid = (email: string): boolean => {
    return /\S+@\S+\.\S+/.test(email);
  };
  
  const isPasswordValid = (password: string): boolean => {
    return password.length >= 6;
  };
  
  const handleFetchProfile = async (token:string): Promise<void> => {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/profile/`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });

      const profileResponse = await response.json();
      if (!response.ok) {
        console.error("Cannot Access pofile", profileResponse || response);
        return;
      }
      const { is2FAEnabled } = profileResponse.data
  
     return is2FAEnabled;
    } catch (error) {
      console.error("Error during Profile Fetch", error);
    }
  }

  const handleSubmit = async(e: React.FormEvent):  Promise<void> => {
    e.preventDefault();
    if (!loginCredentials.email) {
      seterror(prevError => ({ ...prevError, email: "Email is required" }));
      return;
    }
  
    if (!isEmailValid(loginCredentials.email)) {
      seterror(prevError => ({ ...prevError, email: "Please enter a valid email address" }));
      return;
    }
    
    if (!loginCredentials.password) {
      seterror(prevError => ({ ...prevError, password: "Password is required" }));
      return;
    }
    
    if (!isPasswordValid(loginCredentials.password)) {
      seterror(prevError => ({ ...prevError, password: "Please enter a password with at least 6 characters" }));
      return;
    }
    try {
     setloading(true)
    const { success, token, error,userId,is2FaEnable,mobile } = await login(loginCredentials)
    if (success) {
      setloading(false)
      setmessage('Login Successfully...');
      settypeOfAlert('success');
      setalertShow(true);
      if (token) {
        dispatch(userActions(token));
        dispatch(userIdAction(userId))
        if(is2FaEnable){
          try {
            const response = await fetch(`${SERVER_BASE_URL}/auth/send-two-factor`, {
              method: "POST",
              headers: {
                'Authorization': `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({mobile:mobile}),
            });
        
            const authResponse = await response.json();
            if (!response.ok) {
              setmessage(authResponse?.error)
              settypeOfAlert("error")
              setalertShow(true)
              return;
            }
          } catch (error) {
            console.error("Error during Auth:", error);
          }
          navigate(routes.Code)
        }else{
          navigate(routes?.Workspace);
        }
      }
    } else {
      setloading(false)
      setmessage(error || 'Login failed');
      settypeOfAlert('error');
      setalertShow(true);
    }
  } catch (error) {
    setloading(false)
    console.error("Error during Login:", error);
  }
  };
  return (
    <div className="login-wrap d-flex flex-column">
      {loading && <PageLoader/>}
      <div className="logo-wrap d-flex align-items-center justify-content-center">
        <div className="logo">
          <img src={logoImg} alt="something" />
        </div>
        <h1 className="logo-wrap-title mb-0">Workspace</h1>
      </div>
      <div className="login-form-wrap text-center position-relative">
        <form onSubmit={handleSubmit}>
          <h2 className="login-form-title">Login</h2>
          <div className="login-form-inner mx-auto">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input type="email" value={loginCredentials?.email} onChange={handleInputChange} name="email" id="email" className="form-control" />
              {error?.email && <div style={{color:"red"}}>{error?.email}</div>}
            </div>
            <div className="form-group">
              <label htmlFor={"password"} className="form-label">
                Password
              </label>
              <input type="password" onChange={handleInputChange} value={loginCredentials?.password} name="password" id={"password"} className="form-control" />
              {error?.password && <div style={{color:"red"}}>{error.password}</div>}
            </div>
            <div className="login-form-submit-wrap">
              <button type="submit" className="btn btn-dark with-shadow">
                Login
              </button>
            </div>
            <Link
              to={routes.Forget_Pass}
              className="login-reset-link d-inline-block text-decoration-underline"
            >
              Forgot Password
            </Link>
            <div className="login-already-signup">
              Don’t have an account? <Link to={routes.SignUp}>Sign up</Link>
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
      <AlertModal setShow={setalertShow} show={alertShow} msg={message} type={typeOfAlert}/>
    </div>
  );
};

export default Login;
