import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import workSpaceImg from "../assets/img/workspace-photo.svg";
import { SERVER_BASE_URL } from "../constants/urles";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import placeHolder from '../assets/img/placeHolder.jpeg'
import { mobileNumberAction, roleNoAction, workspaceType } from "../stateManagement/actions/useAction";
import UseUserTeamInfo from "../components/FetchRoleAndTeam";
interface WorkspaceDataInterface {
  createdAt: string;
  description: string;
  id: number;
  name: string;
  purpose: string;
  type: string;
  updatedAt: string;
  userId: number;
  imageUrl:string;
}
const Home: React.FC = () => {
  const {token} = useSelector((state:any) => state.userToken)
  const [workSpaceData, setworkSpaceData] = useState<WorkspaceDataInterface>({
    createdAt: "",
    description: "",
    id: 0,
    name: "",
    purpose: "",
    type: "",
    updatedAt: "",
    userId: 0,
    imageUrl:placeHolder
  })

  const dispatch = useDispatch()
  const {id} = useParams()
  const { userId } = useSelector((state: any) => state.userid)
  const userTeamInfo = UseUserTeamInfo(userId);
  
  const handleFetchWorkSpaceList = async () =>{
    try {
      const response = await fetch(`${SERVER_BASE_URL}/workspaces/${id}`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      const workSpace = await response.json();
      if (!response.ok) {
        console.error("Fetching Data failed:", workSpace || response);
        return;
      }
      console.log(workSpace.data)

      setworkSpaceData(workSpace.data)
      dispatch(workspaceType(workSpace.data.type))
    } catch (error) {
      console.error("Error during Fetch Data:", error);
    }
  }

  const handleFetchStorage = async () : Promise<void> =>{
    try {
      const response = await fetch(`${SERVER_BASE_URL}/workspaces/storage`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
          "workspaceid":`${id}`
        },
      });

      const storageData = await response.json();
      if (!response.ok) {
        console.error("failed to add question", storageData || response);
        return;
      }
      console.log(storageData)
      dispatch(mobileNumberAction(storageData.data))
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    dispatch(roleNoAction(userTeamInfo.roleName))
  }, [userTeamInfo.roleName])

  useEffect(() => {
    handleFetchWorkSpaceList()
    handleFetchStorage()
  }, [])
  
  return (
    <>
      <Navbar />
      <div className="workspace-wrap">
        <div className="workspace-inner">
          <div className="workspace-img">
            <img src={workSpaceData?.imageUrl ? `${workSpaceData?.imageUrl}` : placeHolder} alt="" />
          </div>
          <div className="workspace-con">
            <h1 className="workspace-title">Welcome to {workSpaceData?.name}</h1>
            <p>
              {workSpaceData?.description}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
