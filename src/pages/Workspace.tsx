import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Modal from "../components/Modal";
import Select from "../components/Select";
import { SERVER_BASE_URL } from "../constants/urles";
import { useSelector } from "react-redux";
import AlertModal from "../components/Alert";
interface createWorkSpace {
  name:string,
  description:string,
  purpose:string,
  type:string
}
interface purposeOtions {
  label:string,
  value:number
}

interface propsTypes {
  error?:string
}

const purposeOption =[
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
]


const Workspace: React.FC<propsTypes> = () => {
  const [showWorkspaceModal, setShowWorkspaceModal] = useState<boolean>(false);
  const [selectedPurpose, setSelectedPurpose] = useState<any | null>(null);
  const [alertShow, setalertShow] = useState<boolean>(false)
  const [message, setmessage] = useState<string>('')
  const [typeOfAlert, settypeOfAlert] = useState<string>('')
  const [workSpaceInfo, setworkSpaceInfo] = useState<createWorkSpace>({
    name:"",
    description:"",
    purpose:"",
    type:"Two Way"
  })
  const [workSpaceList, setworkSpaceList] = useState([])
  const {token} = useSelector((state:any) => state.userToken)
  const navitate = useNavigate()
  const handleCreateWorkSpace = async () =>{
    setShowWorkspaceModal(false)
    try {
      // setworkSpaceInfo({ 
      // name:"",
      // description:"",
      // purpose:"",
      // type:"One Way"})
      const response = await fetch(`${SERVER_BASE_URL}/workspaces`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(workSpaceInfo),
      });
      console.log(response)
      const workSpace = await response.json();
      if (!response.ok) {
        setmessage(workSpace.error)
        settypeOfAlert("error")
        setalertShow(true)
        return;
      }
      setmessage("Workspace Created Successfully...!")
      settypeOfAlert("success")
      setalertShow(true)
      handleFetchWorkSpaceList()
  
    } catch (error) {
      console.error("Error during workSpace Creating:", error);
    }
  }

  const handleFetchWorkSpaceList = async () =>{
    try {
      const response = await fetch(`${SERVER_BASE_URL}/workspaces`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      const workSpace = await response.json();
      if (!response.ok) {
        window.alert(workSpace.error);
        return;
      }
      console.log(workSpace)
      setworkSpaceList(workSpace?.data)
    } catch (error) {
      console.error("Error during Fetch Data:", error);
      
    }
  }

  const handleNavigate = (id:string): void =>{
    navitate(`/home/${id}`)
    localStorage.setItem("curentWS",JSON.stringify(id))
  }

  useEffect(() => {
    handleFetchWorkSpaceList()
  }, [])
  
  return (
    <>
      <Navbar />
      <div className="secondary-nav-links">
        <ul>
          <li>
            <NavLink to={"/workspace"}>Workspace</NavLink>
          </li>
        </ul>
      </div>
      <div className="top-action-bar-2 d-flex flex-wrap">
        <div className="add-btn-wrap d-flex align-items-center">
          <button
            type="button"
            className="add-btn"
            onClick={() => setShowWorkspaceModal(true)}
          >
            <i className="icon-plus"></i>
          </button>
          <span>New Workspace</span>
        </div>
      </div>
      <div className="inner-scroller">
        <div className="workspace-boxes d-flex flex-wrap">
          {
            workSpaceList?.map((item:any,index) =>{
              return <div onClick={() => handleNavigate(item.id)} style={{ backgroundImage: `url(https://workspaceappdocuments.blob.core.windows.net/${item.imageUrl})` }} className="workspace-box">
              <h5 className="workspace-box-title">{item.name}</h5>
              <div className="text-end">
                <span className="workspace-status">0</span>
              </div>
            </div>
            })
          }
        </div>
      </div>
      <Modal
        className="workspace-modal align-items-start"
        show={showWorkspaceModal}
        onSave={handleCreateWorkSpace}
        onSaveBtnText="Create"
        onCancel={() => setShowWorkspaceModal(false)}
      >
        <div className="form-group">
          <label htmlFor="" className="form-label">
            Name of Workspace
          </label>
          <input type="text" onChange={(e:React.ChangeEvent<HTMLInputElement>) => setworkSpaceInfo({...workSpaceInfo,name:e.target.value})} className="form-control" />
        </div>
        <div className="form-group">
          <label htmlFor="" className="form-label">
            Description
          </label>
          <textarea onChange={(e:React.ChangeEvent<HTMLTextAreaElement>) => setworkSpaceInfo({...workSpaceInfo,description:e.target.value})} name="" id="" rows={4} className="form-control"></textarea>
        </div>
        <div className="form-group">
          <Select
            placeholder="Purpose"
            options={purposeOption}
            onChange={(e) => setworkSpaceInfo({...workSpaceInfo,purpose:e})}
          />
        </div>
      </Modal>
      <AlertModal setShow={setalertShow} show={alertShow} msg={message} type={typeOfAlert}/>
    </>
  );
};

export default Workspace;
