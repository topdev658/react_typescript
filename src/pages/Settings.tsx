import { NavLink, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import workspaceImg from "../assets/img/placeHolder.jpeg";
import Select from "../components/Select";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Modal from "../components/Modal";
import { SERVER_BASE_URL } from "../constants/urles";
import { useSelector } from "react-redux";
import { profile } from "console";
import AlertModal from "../components/Alert";
import UseUserTeamInfo from "../components/FetchRoleAndTeam";

interface workSpaceInterface {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  purpose: string;
  type: string;
  setting: {
    isQANotification:boolean;
    isTeamSpecificQA:boolean;
  };
  user: {
    email: string;
    mobile: string; // You might want to replace 'any' with the actual type
  };
}

const initialProfile : workSpaceInterface = {
  id: 4,
  name: "",
  description: "",
  imageUrl: "",
  purpose: "",
  setting:{
    isTeamSpecificQA:false,
    isQANotification:false,
  },
  type: "",
  user: {
    email: "",
    mobile: "",
  }
};
const Settings: React.FC = () => {
  const [selectedPurpose, setSelectedPurpose] = useState<string>("");
  const [showWorkspaceNameModal, setShowWorkspaceNameModal] = useState<boolean>(
    false
  );
  const [showDescriptionModal, setShowDescriptionModal] = useState<boolean>(
    false
  );
  const [showEmailModal, setShowEmailModal] = useState<boolean>(false);
  const [showPhoneModal, setShowPhoneModal] = useState<boolean>(false);
  const [profilePicture, setprofilePicture] = useState<File | null>(null)
  const [updatename, setupdatename] = useState<string>('')
  const [profileDetail, setprofileDetail] = useState<workSpaceInterface>(initialProfile)
  const [alertShow, setalertShow] = useState<boolean>(false)
  const [message, setmessage] = useState<string>('')
  const [typeOfAlert, settypeOfAlert] = useState<string>('')
  const [oldPassword, setoldPassword] = useState<string>('')
  const [description, setdescription] = useState<string>('')
  const [ShowDeleteQAModal, setShowDeleteQAModal] = useState<boolean>(false)
  const id = localStorage.getItem("curentWS")
  const { token } = useSelector((state: any) => state.userToken)
  const params = useParams()
  const { userId } = useSelector((state: any) => state.userid)
  const userTeamInfo =  UseUserTeamInfo(userId);
  const hasQAPermission = [3,4].includes(Number(userTeamInfo.roleName));
  const navigate = useNavigate()
  const handleToggleModal = (type:string , message:string) =>{
    setmessage(message)
    settypeOfAlert(type)
    setalertShow(true)
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
      const response = await fetch(`${SERVER_BASE_URL}/workspaces/image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "workspaceid":`${params.id}`
        },
        body: formData,
      });
      const data = await response.json()
      if(!response.ok){
        setmessage(data.error)
        settypeOfAlert("error")
        setalertShow(true)
        return
      }
      setmessage("Profile Changed Successfully...!");
      settypeOfAlert("success")
      setalertShow(true)
      handleFetchProfile()
    } catch (error) {
      console.error("Error during Name Change:", error);
    }
  };
  const handleChangeName = async (): Promise<void> => {
    try {
      setShowWorkspaceNameModal(false)
      const paramter = {
        name:updatename,
        presentPassword:oldPassword
      }
      const response = await fetch(`${SERVER_BASE_URL}/workspaces/update-name`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
          "workspaceid":`${params.id}`
        },
        body: JSON.stringify(paramter),
      });

      const authResponse = await response.json();
      if (!response.ok) {
        handleToggleModal("error",authResponse.error)
        console.error("Cannot Update names", authResponse || response);
        return;
      }
      handleToggleModal("success","Name Changed Successfully...!")
      console.log(authResponse)
      handleFetchProfile()
    } catch (error) {
      console.error("Error during Name Change:", error);
    }
  }

  const handleUpdateDescription = async () =>{
    try {
      setShowDescriptionModal(false) 
      const paramter = {
        description:description
      }
      const response = await fetch(`${SERVER_BASE_URL}/workspaces/update-description`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
          "workspaceid":`${params.id}`
        },
        body: JSON.stringify(paramter),
      });

      const authResponse = await response.json();
      if (!response.ok) {
        handleToggleModal("error",authResponse.error)
        console.error("Cannot Update names", authResponse || response);
        return;
      }
      handleToggleModal("success","Name Changed Successfully...!")
      console.log(authResponse)
      handleFetchProfile()
    } catch (error) {
      console.error("Error during Name Change:", error);
    }
  }
  const handleUpdatePurpose = async (value:string) =>{
    try {
      const paramter = {
        purpose:value
      }
      const response = await fetch(`${SERVER_BASE_URL}/workspaces/update-purpose`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
          "workspaceid":`${params.id}`
        },
        body: JSON.stringify(paramter),
      });

      const authResponse = await response.json();
      if (!response.ok) {
        handleToggleModal("error",authResponse.error)
        console.error("Cannot Update Purpose", authResponse || response);
        return;
      }
      handleToggleModal("success","Purpose Changed Successfully...!")
      console.log(authResponse)
      handleFetchProfile()
    } catch (error) {
      console.error("Error during Name Change:", error);
    }
  }

  const handleChangeType = async (value:string) =>{
    try {
      const paramter = {
        type:value
      }
      const response = await fetch(`${SERVER_BASE_URL}/workspaces/update-type`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
          "workspaceid":`${params.id}`
        },
        body: JSON.stringify(paramter),
      });

      const authResponse = await response.json();
      if (!response.ok) {
        handleToggleModal("error",authResponse.error)
        console.error("Cannot Update Type", authResponse || response);
        return;
      }
      handleToggleModal("success","Type Changed Successfully...!")
      console.log(authResponse)
      handleFetchProfile()
    } catch (error) {
      console.error("Error during Name Change:", error);
    }
  }
  const handleChangeSetting = async (value:string) =>{
    try {
      const response = await fetch(`${SERVER_BASE_URL}/settings/${value}`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
          "workspaceid":`${params.id}`
        }
      });

      if (!response.ok) {
        const authResponse = await response.json();
        handleToggleModal("error",authResponse.error)
        console.error("Cannot Update Setting", authResponse || response);
        return;
      }
      handleToggleModal("success","Setting Changed Successfully...!")
      handleFetchProfile()
    } catch (error) {
      console.error("Error during Name Change:", error);
    }
  }
  const handleDelete = async () =>{
    try {
      setShowDeleteQAModal(false) 
      const response = await fetch(`${SERVER_BASE_URL}/workspaces/${params.id}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });

      const authResponse = await response.json();
      if (!response.ok) {
        handleToggleModal("error",authResponse.error)
        console.error("Cannot Update names", authResponse || response);
        return;
      }
      handleToggleModal("success","WorkSpace Deleted Successfully...!")
      navigate("/workspace")
    } catch (error) {
      console.error("Error during Name Change:", error);
    }
  }

  const handleFetchProfile = async () : Promise<void> =>{
    try {
      const response = await fetch(`${SERVER_BASE_URL}/workspaces/${params.id}/workspace-profile`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const profileData = await response.json();
      if (!response.ok) {
        console.error("failed to add question", profileData || response);
        return;
      }
      console.log(profileData)
      // if(profileDetail.is2fa)
      setprofileDetail(profileData.data[0])
      setSelectedPurpose(profileData.data[0].purpose)
    } catch (error) {
      console.log(error)
    }
  }
  
  useEffect(() => {
  
    console.log(userTeamInfo.roleName)
    if(hasQAPermission){
      setmessage("Access Denied")
      settypeOfAlert("error")
      setalertShow(true)
      setTimeout(() => {
        navigate(-1)
      }, 1000);
    }else{
      handleFetchProfile()
    }
  }, [userTeamInfo.roleName])
  
  return (
    <>
      <Navbar />
      <div className="secondary-nav-links mb-2">
        <ul>
          <li>
            <NavLink to={`/settings/${id}`}>Setting</NavLink>
          </li>
          <li>
            <NavLink to={"/billing"}>Billing</NavLink>
          </li>
        </ul>
      </div>
      <div className="settings-wrap">
        <div className="row">
          <div className="col-lg-12">
            <p className="participates-note text-center">
              Please note you have originated this workspace as such you are the
              Internal Team
            </p>
            <div className="settings-profile-wrap d-inline-block position-relative">
              <div className="settings-profile-img">
                <img src={profileDetail?.imageUrl ? profileDetail.imageUrl : workspaceImg} alt="" />
              </div>
              <button className="settings-profile-btn position-absolute">
                <i className="icon-camera"></i>
                <input type="file" className="position-absolute" onChange={(e) => handleProfilePicture(e)} />
              </button>
            </div>
          </div>
          <div className="col-lg-4 col-sm-6">
            <h5 className="settings-title">General Setting</h5>
            <div className="settings-group">
              <span className="settings-label">
                Name of Workspace{" "}
                <button
                  type="button"
                  className="btn btn-link text-purple"
                  onClick={() => {setShowWorkspaceNameModal(true); setupdatename(profileDetail?.name)}}
                >
                  Change
                </button>
              </span>
              <p className="settings-text">{profileDetail?.name}</p>
            </div>
            <div className="form-group setting-purpose-group">
              <label htmlFor="" className="form-label">
                Purpose
              </label>
              <Select
                placeholder="Purpose"
                options={[
                  { value: 1, label: "Pre-Seed Funding" },
                  { value: 2, label: "Seed Stage Funding" },
                  { value: 3, label: "Series A" },
                  { value: 4, label: "Series B onwards" },
                  { value: 5, label: "Pre IPO" },
                  { value: 6, label: "IPO" },
                  { value: 7, label: "Legal" },
                  { value: 8, label: "Financing(loans / credit)" },
                  { value: 9, label: "Joint Venture / Partnership" },
                  { value: 10, label: "Exit" },
                  { value: 11, label: "M-A" },
                  { value: 12, label: "Sale" },
                  { value: 13, label: "LP / GP Due Dilligence" },
                  { value: 14, label: "Capital Raise(Equality, Warrants-Others)" }
                ]}
                defaultSelectedValue={selectedPurpose}
                onChange={e =>handleUpdatePurpose(e)}
              />
            </div>
            <div className="settings-group">
              <span className="settings-label">
                Description{" "}
                <button
                  type="button"
                  className="btn btn-link text-purple"
                  onClick={() => setShowDescriptionModal(true)}
                >
                  Change
                </button>
              </span>
              <p className="settings-text">
               {profileDetail?.description}
              </p>
            </div>
          </div>
          <div className="col-lg-4 col-sm-6">
            <h5 className="settings-title">Data Center Location</h5>
            <div className="settings-group">
              <span className="settings-label">Australia - South East</span>
            </div>
            <div className="settings-group delete-workspace-group">
              <span className="settings-label d-block">Delete Workspace?</span>
              <button type="button" className="btn btn-danger" onClick={() => setShowDeleteQAModal(true)}>
                Delete
              </button>
            </div>
          </div>
          <div className="col-lg-4 col-sm-6">
            <h5 className="settings-title">Other Settings</h5>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                onChange={() => handleChangeSetting('notification')}
                checked={profileDetail.setting?.isQANotification}
                id="enableQnANotification"
              />
              <label
                className="form-check-label"
                htmlFor="enableQnANotification"
              >
                Notification on Q&A
                <span className="d-block">
                  Every time a question is asked or answered, the participants it's
                  been addressed to will receive a notification.
                </span>
              </label>
            </div>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                checked={profileDetail.setting.isTeamSpecificQA}
                role="switch"
                onChange={() => handleChangeSetting('teamQA')}
                id="enableTeamSpecificQnA"
              />
              <label
                className="form-check-label"
                htmlFor="enableTeamSpecificQnA"
              >
                Enable Team-specific Q&A Segregation
                <span className="d-block">
                  If enabled, only the team the question has been asked to will be
                  able to view and, as default, the Internal team can view all Q&A. If
                  disabled, everyone in the workspace can view everyone's Q&A.
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
      <Modal
        show={showWorkspaceNameModal}
        onSave={handleChangeName}
        onSaveBtnText="Save"
        onCancel={() => setShowWorkspaceNameModal(false)}
      >
        <h5 className="modal-title">Change WorkSpace Name</h5>
        <div className="form-group">
          <label htmlFor="" className="form-label">
            Present Password
          </label>
          <input type="password"  onChange={(e:ChangeEvent<HTMLInputElement>) => setoldPassword(e.target.value)} className="form-control" />
        </div>
        <div className="form-group">
          <label htmlFor="" className="form-label">
            New Name
          </label>
          <input type="text" className="form-control"value={updatename} onChange={(e:ChangeEvent<HTMLInputElement>) => setupdatename(e.target.value)} />
        </div>
      </Modal>
      <Modal
        show={showDescriptionModal}
        onSave={handleUpdateDescription}
        onSaveBtnText="Save"
        onCancel={() => setShowDescriptionModal(false)}
      >
        <div className="form-group">
          <label htmlFor="" className="form-label">
            Description
          </label>
          <textarea name="" id="" onChange={(e:ChangeEvent<HTMLTextAreaElement>) => setdescription(e.target.value)} rows={4} className="form-control"></textarea>
        </div>
      </Modal>
      <Modal
        show={showEmailModal}
        onSave={() => setShowEmailModal(false)}
        onSaveBtnText="Save"
        onCancel={() => setShowEmailModal(false)}
      >
        <h5 className="modal-title">Change Email</h5>
        <div className="form-group">
          <label htmlFor="" className="form-label">
            Present Password
          </label>
          <input type="password" onChange={(e:ChangeEvent<HTMLInputElement>) => setoldPassword(e.target.value)} className="form-control" />
        </div>
        <div className="form-group">
          <label htmlFor="" className="form-label">
            New Email
          </label>
          <input type="email" className="form-control" />
        </div>
      </Modal>
      <Modal
        show={showPhoneModal}
        onSave={() => setShowPhoneModal(false)}
        onSaveBtnText="Save"
        onCancel={() => setShowPhoneModal(false)}
      >
        <h5 className="modal-title">Change Phone No</h5>
        <div className="form-group">
          <label htmlFor="" className="form-label">
            Present Password
          </label>
          <input type="password" onChange={(e:ChangeEvent<HTMLInputElement>) => setoldPassword(e.target.value)} className="form-control" />
        </div>
        <div className="form-group">
          <label htmlFor="" className="form-label">
            Phone number
          </label>
          <div className="phone-input-wrap">
            <select className="phone-code">
              <option value="">US</option>
            </select>
            <input
              type="text"
              className="phone-input"
              placeholder={"+1 (555) 000-0000"}
            />
            <i className="icon-help-circle"></i>
          </div>
        </div>
      </Modal>
      <Modal
        className="delete-modal"
        show={ShowDeleteQAModal}
        onSave={handleDelete}
        onSaveBtnText="Remove"
        onSaveBtnClassName="btn-danger"
        onCancel={() => setShowDeleteQAModal(false)}
      >
        <div className="modal-icon">
          <i className="icon-alert-circle"></i>
        </div>
        <h6 className="modal-title">
          Delete{" "}
          <a href="#" className="text-dark text-decoration-underline">
            Document & Question
          </a>
          ?
        </h6>
        <p className="modal-description text-center">
          Are you sure you want to delete the question? This action cannot be
          undone.
        </p>
      </Modal>
      <AlertModal setShow={setalertShow} show={alertShow} msg={message} type={typeOfAlert}/>
    </>
  );
};

export default Settings;
