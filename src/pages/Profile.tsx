import React, { ChangeEvent, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import avatarProfilePhoto from "../assets/img/placeHolder.jpeg";
import Modal from "../components/Modal";
import { SERVER_BASE_URL } from "../constants/urles";
import { useDispatch, useSelector } from "react-redux";
import { setSyntheticLeadingComments } from "typescript";
import AlertModal from "../components/Alert";
import { logoutAction } from "../stateManagement/actions/useAction";
import { FormEvent } from 'react'
import UseUserTeamInfo from "../components/FetchRoleAndTeam";
interface ProfileProps { }

interface usernames {
  firstName: string;
  lastName: string;
  [key: string]: string;
}

interface UserStateDetails {
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  phoneNumber: string;
  imageUrl: string,
  is2FAEnabled: boolean
}
interface EmailModalState {
  presentPassword: string;
  newEmail: string;
  confirmNewEmail: string;
}

interface PasswordModalState {
  presentPassword: string,
  newPassword: string,
  confirmPassword: string
}

interface MobileModalState {
  presentPassword: string,
  mobile: string
}

interface CompanyModalState {
  presentPassword: string,
  companyName: string,
  confirmName: string
}
const initialcompanyModalState: CompanyModalState = {
  presentPassword: "",
  companyName: "",
  confirmName: ""
}
const initialMobileModalState: MobileModalState = {
  presentPassword: "",
  mobile: ""
}
const initialPasswordModalState: PasswordModalState = {
  presentPassword: "",
  newPassword: "",
  confirmPassword: ""
}
const initialEmailModalState: EmailModalState = {
  presentPassword: "",
  newEmail: "",
  confirmNewEmail: "",
};

const Profile: React.FC<ProfileProps> = () => {
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [showEmailModal, setShowEmailModal] = useState<boolean>(false);
  const [showCompanyNameModal, setShowCompanyNameModal] = useState<boolean>(false);
  const [showNameModal, setShowNameModal] = useState<boolean>(false);
  const [alertShow, setalertShow] = useState<boolean>(false)
  const [message, setmessage] = useState<string>('')
  const [show2FA, setShow2FA] = useState(false);
  const [mobile, setmobile] = useState<string>('')
  const [countryCode, setcountryCode] = useState<string>('')
  const [typeOfAlert, settypeOfAlert] = useState<string>('')
  const [showPhoneModal, setShowPhoneModal] = useState<boolean>(false);
  const [profilePicture, setprofilePicture] = useState<File | null>(null)
  const [emailModalState, setEmailModalState] = useState<EmailModalState>(initialEmailModalState);
  const [passwordModalState, setpasswordModalState] = useState(initialPasswordModalState)
  const [mobileModalState, setmobileModalState] = useState(initialMobileModalState)
  const [companyModalState, setcompanyModalState] = useState(initialcompanyModalState)
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [verifyModal, setverifyModal] = useState<boolean>(false)
  const { userId } = useSelector((state: any) => state.userid)
  const userTeamInfo = UseUserTeamInfo(userId);
  const hasQAPermission = [3].includes(Number(userTeamInfo.roleName));
  const [userNameDetails, setuserNameDetails] = useState<usernames>({
    firstName: "",
    lastName: ""
  })

  const [userDetails, setUserDetails] = useState<UserStateDetails>({
    firstName: '',
    lastName: '',
    email: '',
    companyName: '',
    phoneNumber: '',
    imageUrl: '',
    is2FAEnabled: false
  });
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

  const handleVerifyCode = async (): Promise<void> => {
    try {
      const numericCode = parseInt(verificationCode, 10); // Convert verificationCode to integer
      if (isNaN(numericCode)) {
        return;
      }
      const response = await fetch(`${SERVER_BASE_URL}/auth/verify-two-factor`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: numericCode }),
      });

      const verificationRespoonse = await response.json();
      if (!response.ok) {
        setverifyModal(false)
        setmessage(verificationRespoonse?.error)
        settypeOfAlert("error")
        setalertShow(true)
        return;
      }
      setverifyModal(false)
      setmessage("Verification Successfully...!")
      settypeOfAlert("success")
      setalertShow(true)
    } catch (error) {
      console.error("Error during Verification:", error);
    }

  }
  const getPlaceholder = (): string => {
    switch (countryCode) {
      case '+1':
        return '212-456-7890';
      case '+44':
        return '020 7123 4567';
      case '+91':
        return '+91 22 1234 5678';
      case '+61':
        return '(02) 1234 5678';
      default:
        return 'Enter phone number';
    }
  };
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    const { name, value } = e.target;
    setEmailModalState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleToggleModal = (type: string, message: string) => {
    setmessage(message)
    settypeOfAlert(type)
    setalertShow(true)
  }

  const handlePasswordInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setpasswordModalState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleCompanyModalInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setcompanyModalState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleEnable2FactorAuth = async (e: FormEvent): Promise<void> => {
    e.preventDefault()
    try {
      const response = await fetch(`${SERVER_BASE_URL}/auth/send-two-factor`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mobile: `${countryCode}${mobile}` }),
      });

      const authResponse = await response.json();
      if (!response.ok) {
        setmessage(authResponse?.error)
        settypeOfAlert("error")
        setalertShow(true)
        return;
      }
      setmessage("Set 2FA successful")
      settypeOfAlert("success")
      setalertShow(true)
      setShow2FA(false)
      setverifyModal(true)
    } catch (error) {
      console.error("Error during Auth:", error);
    }
  }
  const handleFetchProfile = async (): Promise<void> => {
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
      const { firstName, lastName, is2FAEnabled, email, imageUrl, companyName, mobile: phoneNumber } = profileResponse.data
      setUserDetails({
        firstName,
        lastName,
        email,
        companyName,
        phoneNumber,
        imageUrl,
        is2FAEnabled
      });
      console.log(profileResponse)
    } catch (error) {
      console.error("Error during Profile Fetch", error);
    }
  }

  const handleProfilePicture = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const selectedFile = e.target.files ? e.target.files[0] : null;

    // Check if a file is selected
    if (!selectedFile) {
      return;
    }

    // Set the profile picture state
    setprofilePicture(selectedFile);

    // Create FormData and append the file
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(`${SERVER_BASE_URL}/profile/image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const authResponse = await response.json();
      if (!response.ok) {
        handleToggleModal("error", authResponse.error)
        return
      }
      handleToggleModal("success", "Profile Changed Successfully...!")
      handleFetchProfile()
    } catch (error) {
      console.error("Error during Name Change:", error);
    }
  };


  const handleMobileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setmobileModalState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setuserNameDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const { token } = useSelector((state: any) => state.userToken)

  const handleChangeName = async (): Promise<void> => {
    try {
      setShowNameModal(false)
      const response = await fetch(`${SERVER_BASE_URL}/profile/update-name/`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userNameDetails),
      });

      const authResponse = await response.json();
      if (!response.ok) {
        handleToggleModal("error", authResponse.error)
        console.error("Cannot Update names", authResponse || response);
        return;
      }
      handleToggleModal("success", "Name Changed Successfully...!")
      console.log(authResponse)
      handleFetchProfile()
    } catch (error) {
      console.error("Error during Name Change:", error);
    }
  }

  const handleToggle2FA = async (): Promise<void> => {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/profile/2FA`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const authResponse = await response.json();
      if (!response.ok) {
        handleToggleModal("error", authResponse.error)
        return;
      }
      if (!userDetails?.is2FAEnabled) {
        setShow2FA(true)
      }
      handleToggleModal("success", "2FA Status Changed Successfully...!")
      handleFetchProfile()
    } catch (error) {
      console.error("Error during 2FA Status Change:", error);
    }
  }

  const handleDeleteAccount = async (): Promise<void> => {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/profile/`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const authResponse = await response.json();
      if (!response.ok) {
        handleToggleModal("error", authResponse.error)
        return;
      }
      handleToggleModal("success", "Account Deleted Successfully...!")
      dispatch(logoutAction())
      navigate("/")
    } catch (error) {
      console.error("Error during 2FA Status Change:", error);
    }
  }

  const handleChangeEmail = async (): Promise<void> => {
    try {
      setShowEmailModal(false)
      const response = await fetch(`${SERVER_BASE_URL}/profile/update-email`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ presentPassword: emailModalState.presentPassword, email: emailModalState.newEmail }),
      });

      const authResponse = await response.json();
      if (!response.ok) {
        handleToggleModal("error", authResponse.error)
        return;
      }
      handleToggleModal("success", "Email Changed Successfully...!")
      handleFetchProfile()
    } catch (error) {

    }
  }

  const handlePasswordChange = async (): Promise<void> => {
    try {
      setShowPasswordModal(false)
      const { confirmPassword, ...passwordToSend } = passwordModalState
      const response = await fetch(`${SERVER_BASE_URL}/profile/update-password`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(passwordToSend),
      });

      const authResponse = await response.json();
      if (!response.ok) {
        handleToggleModal("error", authResponse.error)
        console.error("Cannot Update Password", authResponse || response);
        return;
      }
      handleToggleModal("success", "Password Changed Successfully...!")
    } catch (error) {

    }
  }

  const handleMobileChange = async (): Promise<void> => {
    try {
      setShowPhoneModal(false)
      const response = await fetch(`${SERVER_BASE_URL}/profile/update-mobile`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ presentPassword: mobileModalState.presentPassword, mobile: `${countryCode} ${mobileModalState?.mobile}` }),
      });

      const authResponse = await response.json();
      if (!response.ok) {
        handleToggleModal("error", authResponse.error)
        console.error("Cannot Update Mobile", authResponse || response);
        return;
      }
      handleToggleModal("success", "Mobile No Changed Successfully...!")
      handleFetchProfile()
    } catch (error) {

    }
  }

  const handleCompanyNameChange = async (): Promise<void> => {
    try {
      setShowCompanyNameModal(false)
      const response = await fetch(`${SERVER_BASE_URL}/profile/update-company`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ presentPassword: companyModalState.presentPassword, companyName: companyModalState?.companyName }),
      });

      const authResponse = await response.json();
      if (!response.ok) {
        handleToggleModal("error", authResponse.error)
        console.error("Cannot Update Company Name", authResponse || response);
        return;
      }
      handleToggleModal("error", "Company Name Changed Successfully...!")
      handleFetchProfile()
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {

    handleFetchProfile()
  }, [])

  return (
    <>
      <Navbar />
      <div className="secondary-nav-links mb-0">
        <ul>
          <li>
            <NavLink to={"/profile"}>Profile</NavLink>
          </li>
        </ul>
      </div>
      <div className="profile-wrap">
        <div className="upload-profile-wrap d-inline-block position-relative">
          <div className="upload-profile-img">
            <img src={userDetails?.imageUrl ? userDetails?.imageUrl : avatarProfilePhoto} alt="" />
          </div>
          <button className="upload-profile-btn position-absolute">
            <i className="icon-camera"></i>
            <input type="file" onChange={handleProfilePicture} className="position-absolute" />
          </button>
        </div>
        <div className="account-info">
          <div className="row">
            <div className="col-lg-4">
              <div className="form-group">
                <label className="form-label">Account Email</label>
                <div className="form-value-text d-flex align-items-center">
                  <span>{userDetails?.email}</span>
                  <button
                    type="button"
                    className="btn btn-link text-purple"
                    onClick={() => setShowEmailModal(true)}
                  >
                    Change
                  </button>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="form-group">
                <label className="form-label">Name of the company</label>
                <div className="form-value-text d-flex align-items-center">
                  <span>{userDetails?.companyName}</span>
                  <button
                    type="button"
                    className="btn btn-link text-purple"
                    onClick={() => setShowCompanyNameModal(true)}
                  >
                    Change
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-4">
              <div className="form-group">
                <label className="form-label">Present password</label>
                <div className="form-value-text d-flex align-items-center">
                  <span>********************</span>
                  <button
                    type="button"
                    className="btn btn-link text-purple"
                    onClick={() => setShowPasswordModal(true)}
                  >
                    Change
                  </button>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="form-group">
                <span className="form-label d-block">Delete Account?</span>
                <button type="button" className="btn btn-danger mt-3" onClick={handleDeleteAccount}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="profile-info">
          <div className="row">
            <div className="col-lg-4">
              <div className="form-group">
                <label className="form-label">Name</label>
                <div className="form-value-text d-flex align-items-center">
                  <span>{userDetails?.firstName} {userDetails?.lastName}</span>
                  <button
                    type="button"
                    className="btn btn-link text-purple"
                    onClick={() => setShowNameModal(true)}
                  >
                    Change
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-4">
              <div className="form-group">
                <label className="form-label" onClick={() => setverifyModal(true)}>Phone Number</label>
                <div className="form-value-text d-flex align-items-center">
                  <span>{userDetails?.phoneNumber}</span>
                  <button
                    type="button"
                    className="btn btn-link text-purple"
                    onClick={() => setShowPhoneModal(true)}
                  >
                    Change
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="enable-2fa">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              id="enable"
              onChange={handleToggle2FA}
              checked={userDetails?.is2FAEnabled}
            />
            <label className="form-check-label" htmlFor="enable">
              Enable 2FA
              <span className="d-block">
                We recommend that you have 2 Factor <br />
                Authentication enabled!
              </span>
            </label>
          </div>
        </div>
      </div>
      <Modal
        show={showPasswordModal}
        onSave={handlePasswordChange}
        onSaveBtnText="Save"
        onCancel={() => setShowPasswordModal(false)}
      >
        <h5 className="modal-title">Change Account Password</h5>
        <div className="form-group">
          <label htmlFor="" className="form-label">
            Present Password
          </label>
          <input type="password" name="presentPassword" onChange={handlePasswordInput} className={`form-control`} />
        </div>
        <div className="form-group">
          <label htmlFor="" className="form-label">
            New Password
          </label>
          <input type="password" name="newPassword" onChange={handlePasswordInput} className={`form-control`} />
        </div>
        <div className="form-group">
          <label htmlFor="" className="form-label">
            Confirm New Password
          </label>
          <input type="password" className={`form-control ${passwordModalState.newPassword !== passwordModalState.confirmPassword ? 'is-invalid' : ''}`} name="confirmPassword" onChange={handlePasswordInput} />
          {passwordModalState.newPassword !== passwordModalState.confirmPassword && (
            <div className="invalid-feedback">Password do not match.</div>
          )}
        </div>
      </Modal>
      <Modal
        show={showEmailModal}
        onSave={handleChangeEmail}
        onSaveBtnText="Save"
        onCancel={() => setShowEmailModal(false)}
      >
        <h5 className="modal-title">Change Email</h5>
        <div className="form-group">
          <label htmlFor="" className="form-label">
            Present Password
          </label>
          <input
            type="password"
            className="form-control"
            name="presentPassword"
            value={emailModalState.presentPassword}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="" className="form-label">
            New Email
          </label>
          <input
            type="email"
            className="form-control"
            name="newEmail"
            value={emailModalState.newEmail}
            onChange={handleInputChange}
          />
        </div>
      </Modal>
      <Modal
        show={showCompanyNameModal}
        onSave={handleCompanyNameChange}
        onSaveBtnText="Save"
        onCancel={() => setShowCompanyNameModal(false)}
      >
        <h5 className="modal-title">Change Company Name</h5>
        <div className="form-group">
          <label htmlFor="" className="form-label">
            Present Password
          </label>
          <input type="password" name="presentPassword" onChange={handleCompanyModalInput} className="form-control" />
        </div>
        <div className="form-group">
          <label htmlFor="" className="form-label">
            New Name
          </label>
          <input type="text" name='companyName' onChange={handleCompanyModalInput} className="form-control" />
        </div>
      </Modal>
      <Modal
        show={showNameModal}
        onSave={handleChangeName}
        onSaveBtnText="Save"
        onCancel={() => setShowNameModal(false)}
      >
        <h5 className="modal-title">Change Name of User</h5>
        {['firstName', 'lastName'].map((field) => (
          <div key={field} className="form-group">
            <label htmlFor="" className="form-label">
              {field === 'firstName' ? 'First' : 'Last'} Name
            </label>
            <input
              type="text"
              name={field}
              value={userNameDetails[field]}
              onChange={handleChange}
              className="form-control"
            />
          </div>
        ))}
      </Modal>
      <Modal
        show={showPhoneModal}
        onSave={handleMobileChange}
        onSaveBtnText="Save"
        onCancel={() => setShowPhoneModal(false)}
      >
        <h5 className="modal-title">Change Phone No</h5>
        <div className="form-group">
          <label htmlFor="" className="form-label">
            Present Password
          </label>
          <input type="password" name="presentPassword" onChange={handleMobileInput} className="form-control" />
        </div>
        <div className="form-group">
          <label htmlFor="" className="form-label" >
            Phone number
          </label>
          <div className="phone-input-wrap">
            <select className="phone-code" onChange={(e: ChangeEvent<HTMLSelectElement>) => setcountryCode(e.target.value)}>
              <option value="+1">US</option>
              <option value="+91">India</option>
            </select>
            <input
              type="text"
              className="phone-input"
              name="mobile"
              onChange={handleMobileInput}
              placeholder={getPlaceholder()}
            />
            <i className="icon-help-circle"></i>
          </div>
        </div>
      </Modal>
      <Modal
        className="otp-setup-modal"
        show={show2FA}
        onSave={handleEnable2FactorAuth}
        onSaveBtnText="Verify"
        onCancel={() => setShow2FA(false)}
      >
        <h5 className="modal-title">2FA Setup</h5>
        <div className="phone-input-wrap">
          <select className="phone-code" onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setcountryCode(e.target.value)}>
            <option value="+1">USA</option>
            <option value="+44">UK</option>
            <option value="+91">India</option>
            <option value="+61">Australia</option>
          </select>
          <input
            type="text"
            className="phone-input"
            placeholder={getPlaceholder()}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setmobile(e.target.value)}
          />
          <i className="icon-alert-circle"></i>
        </div>
        <p >We will send you text with a 6-digit code</p>
      </Modal>
      <Modal
        className="otp-setup-modal"
        show={verifyModal}
        onSave={handleVerifyCode}
        onSaveBtnText="Verify"
        onCancel={() => setverifyModal(false)}
      >
        <h2 className="login-form-title">2FA</h2>
        <div className="login-form-inner mx-auto">
          <div className="form-resend-link">
            <a href="#" className="d-inline-block text-decoration-underline">
              Resend
            </a>
          </div>
          <div className="form-otp-wrap mt-4 mb-2 w-100 d-inline-block text-start">
            <label htmlFor="" className="form-label">
              Secure code
            </label>
            <div className=" d-flex align-items-center justify-content-center w-100 mt-2">
              {Array.from({ length: 6 }, (_, index) => (
                <input
                  style={{ height: "40px", width: "40px" }}
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
        </div>
      </Modal>
      <AlertModal setShow={setalertShow} show={alertShow} msg={message} type={typeOfAlert} />
    </>
  );
};

export default Profile;
