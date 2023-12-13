import React, { ReactNode, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import avatarImg from "../assets/img/icons/Portrait_Placeholder.png";
import Modal from "../components/Modal";
import Select from "../components/Select";
import { SERVER_BASE_URL } from "../constants/urles";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import AlertModal from "../components/Alert";
import UserSelect from "../components/UserSelect";
import RoleSelect from "../components/WorkFlowTeam/RoleSelect";
import PageLoader from "../components/PageLoader";
import UseUserTeamInfo from "../components/FetchRoleAndTeam";

interface ParticipatesProps {}

interface User {
  firstName: string;
  lastName: string;
  email: string;
  imageUrl:string;
}
interface rolesInter {
  role:string
}
interface Participate {
  id: number;
  userId: number | null;
  email: string;
  roles:rolesInter[];
  isInvited: boolean;
  user: User | null;

}

// Define the Team type
interface Team {
  id: number;
  name: string;
  workspaceId: number;
  participates: Participate[];
}
interface RoleInfo {
  value: number;
  label: string;
}
const Participates: React.FC<ParticipatesProps> = () => {
  const [selectedTeam, setselectedTeam] = useState<number>(1)
  const [deleteId, setdeleteId] = useState<number>(0)
  const [specificId, setspecificId] = useState<number>(0)
  const [loading, setloading] = useState<boolean>(true)
  const [showAddTeamModal, setShowAddTeamModal] = useState<boolean>(false);
  const [teamName, setteamName] = useState<string>('')
  const [teamsList, setteamsList] = useState<Team[]>([])
  const [roleInfo, setroleInfo] = useState<RoleInfo[]>([])
  const [showNameModal, setShowNameModal] = useState<boolean>(false);
  const [alertShow, setalertShow] = useState<boolean>(false)
  const [message, setmessage] = useState<string>('')
  const [typeOfAlert, settypeOfAlert] = useState<string>('')
  const [showRemoveTeam, setshowRemoveTeam] = useState<boolean>(false)
  const [showRemoveMefirstodal, setShowRemoveMemberModal] = useState<boolean>(
    false
  );
  const [showInviteTeamModal, setShowInviteTeamModal] = useState<boolean>(
    false
  );
  const params = useParams()
  const {token} = useSelector((state:any) => state.userToken)
  const { userId } = useSelector((state: any) => state.userid)
  const {workType} = useSelector((state:any) => state.workSpace)
  const userTeamInfo =  UseUserTeamInfo(userId);
  console.log(userTeamInfo)
  const hasSuperAdminPermission = [1].includes(Number(userTeamInfo.roleName));
  const hasSuperAdminAndAdminPermission = [1, 2].includes(Number(userTeamInfo.roleName));
  const canShowAddTeamButton = (teamName:number) => {
    if (userTeamInfo.roleName === 1) {
      return true;
    }
  
    if (hasSuperAdminAndAdminPermission && userTeamInfo?.teamName && userTeamInfo?.teamNo === teamName) {
      return true;
    }
  
    return false;
  };
  
  const [teamMembers, setTeamMembers] = useState([
    { email: "", roleId: "" },
  ]);

  const handleAddTeamMember = () => {
    setTeamMembers([...teamMembers, { email: "", roleId: "" }]);
  };

  const handleTeamMemberChange = (
    index: number,
    key: "email" | "roleId",
    value: string
  ) => {
    const updatedTeamMembers = [...teamMembers];
    updatedTeamMembers[index][key] = value;
    setTeamMembers(updatedTeamMembers);
  };

  const handleSaveTeamMembers = async () => {
    console.log("Team Members:", teamMembers);
    try {
      const paramsData = {participatesData:teamMembers}
      const response = await fetch(`${SERVER_BASE_URL}/teams/participate/${selectedTeam}`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
          "workspaceid": `${params.id}`
        },
        body: JSON.stringify(paramsData),
      });

      const participate = await response.json();
      if (!response.ok) {
        setmessage(participate.error ? participate.error : participate.msg)
        settypeOfAlert("error")
        setalertShow(true)
        setShowInviteTeamModal(false);
        return;
      }
      setmessage("Participate Added Successfully..!");
      settypeOfAlert("success")
      setalertShow(true)
      setShowInviteTeamModal(false);
      handleFetch()
    } catch (error) {
      console.error("Error during folder Create:", error);
    }
  };
  const handleAddTeam = async (): Promise<void> => {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/teams`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
          "workspaceid": `${params.id}`
        },
        body: JSON.stringify({name:teamName}),
      });

      const teamData = await response.json();
      if (!response.ok) {
        setShowAddTeamModal(false)
        setmessage(teamData.error)
        settypeOfAlert("error")
        setalertShow(true)
        return;
      }
      setmessage("Team Added Successfully..!");
      settypeOfAlert("success")
      setalertShow(true)
      setShowAddTeamModal(false)
      handleFetch()
    } catch (error) {
      console.error("Error during folder Create:", error);
    }
  }

  const  handleEditTeam = async() =>{
    try {
      const response = await fetch(`${SERVER_BASE_URL}/teams/team/${specificId}`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
          "workspaceid": `${params.id}`
        },
        body:JSON.stringify({name:teamName})
      });

      const teamData = await response.json();
      if (!response.ok) {
        setShowNameModal(false)
        setmessage(teamData.error)
        settypeOfAlert("error")
        setalertShow(true)
        return;
      }
      setmessage("Team Updated Successfully..!");
      settypeOfAlert("success")
      setalertShow(true)
      setShowNameModal(false)
      handleFetch()
    } catch (error) {
      console.error("Error during folder Create:", error);
    }
  }

  const handleDeleteMember = async (): Promise<void> => {
    try {
      setShowRemoveMemberModal(false) 
      const response = await fetch(`${SERVER_BASE_URL}/teams/${deleteId}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
          "workspaceid": `${params.id}`
        },
        body: JSON.stringify({name:teamName}),
      });

      const teamData = await response.json();
      if (!response.ok) {
        setShowAddTeamModal(false)
        setmessage(teamData.error)
        settypeOfAlert("error")
        setalertShow(true)
        return;
      }
      setmessage("Member Removed Successfully..!");
      settypeOfAlert("success")
      setalertShow(true)
      setShowAddTeamModal(false)
      handleFetch()
    } catch (error) {
      console.error("Error during folder Create:", error);
    }
  }

  const handleDeleteTeam = async () =>{
    try {
      const response = await fetch(`${SERVER_BASE_URL}/teams/team/${deleteId}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
          "workspaceid": `${params.id}`
        },
        body: JSON.stringify({name:teamName}),
      });

      const teamData = await response.json();
      if (!response.ok) {
        setshowRemoveTeam(false)
        setmessage(teamData.error)
        settypeOfAlert("error")
        setalertShow(true)
        return;
      }
      setmessage("Team Deleted Successfully..!");
      settypeOfAlert("success")
      setalertShow(true)
      setshowRemoveTeam(false)
      handleFetch()
    } catch (error) {
      console.error("Error during folder Create:", error);
    }
  }
  const handleFetch = async (): Promise<void> => {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/teams/participate`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
          "workspaceid": `${params.id}`
        }
      });

      const teamsData = await response.json();
      if (!response.ok) {
        setloading(false)
        console.error("fetch failed:", teamsData || response);
        return;
      }
      console.log(teamsData)
      const sortedTeams = [...teamsData.data].sort((a, b) => {
        if (a.name === 'Internal Team') return -1;
        if (a.name === 'External Team' && b.name !== 'Internal Team') return -1;
        if (b.name === 'Internal Team' || b.name === 'External Team') return 1;
        return a.name.localeCompare(b.name);
      });
      setteamsList(sortedTeams)
      setloading(false)
    } catch (error) {
      setloading(false)
      console.error("Error during folder Create:", error);
    }
  }

  const handleFetchRoles = async (): Promise<void> => {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/auth/roles`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
          "workspaceid": `${params.id}`
        }
      });

      const rolesData = await response.json();
      if (!response.ok) {
        console.error("fetch failed:", rolesData || response);
        return;
      }
      console.log(rolesData)
      const simplifiedRoles = rolesData.roles.map((role: any) => ({
        value: role.id,
        label: role.role,
      }));
      setroleInfo(simplifiedRoles)
    } catch (error) {
      console.error("Error during folder Create:", error);
    }
  }
  useEffect(() => {
    handleFetch()
    handleFetchRoles()
  }, [])
  
  return (
    <>
    <Navbar />
    <div className="participates-wrap">
        <div className="d-flex align-items-center flex-wrap gap-5 mb-5">
         {
          hasSuperAdminPermission &&  <button
          type="button"
          className="part-team-add-btn__v2"
          onClick={() => setShowAddTeamModal(true)}
        >
          <span>
            <i className="icon-plus"></i>
          </span>
          Add Team
        </button>
         }
          <p className="participates-note">
            Please note you have originated this workspace as such you are the
            Internal Team
          </p>
        </div>
        {
          loading ? <PageLoader/> : <div className="participates__table--wrapper">
          <div className="row">
            {teamsList.map((team: Team,) => (
              <div className="col-sm-12 col-lg-6 col-xl-4">
                <div className="participates_table-box">
                  <div className="table_heading-row d-flex align-items-center justify-content-between gap-2">
                    <div className="team_details d-flex align-items-center gap-3">
                      <span>{team.name}</span>
                     {
                      canShowAddTeamButton(team.id) &&  <button
                      type="button"
                      className="btn add_team--button"
                      onClick={() => {
                        setShowInviteTeamModal(true);
                        setselectedTeam(team.id);
                      }}
                    >
                      <i className="icon-plus"></i>
                    </button>
                     }
                    
                    </div>
                    <div className="functions d-flex ">
                      {
                        hasSuperAdminPermission && <button type="button" className="btn btn-xs" onClick={() => {setdeleteId(team.id); setshowRemoveTeam(true)}}>
                        <i className="icon-trash"></i>
                      </button>
                      }
                      {
                        hasSuperAdminPermission && <button type="button" className="btn btn-xs" onClick={() => {setspecificId(team.id); setShowNameModal(true); setteamName(team.name)}}>
                        <i className="icon-edit"></i>
                      </button>
                      }
                      
                    </div>
                  </div>
                  <div className="table_body-content">
                    <div className="table-responsive">
                      <table className="table table-borderless part-team-table mb-0">
                        <tbody>
                        {
                  team.participates?.length > 0 ? team.participates?.map((participate,index) => (
                    <tr className="mb-2">
                  <td>
                    <div className="team-user-wrap">
                      <div className="team-user-img">
                        <img src={participate?.user?.imageUrl ? participate?.user?.imageUrl : avatarImg} alt="" />
                      </div>
                      <div className="team-user-con">
                        <span>{participate?.user?.firstName} {participate?.user?.lastName}</span>
                        <a href="mailto:candice@untitledui.com">
                          {participate?.email}
                        </a>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="team-user-role role-1">{participate.roles?.length > 0 && participate.roles[0].role}</span>
                  </td>
                  <td>
                    {
                      canShowAddTeamButton(team.id) && <button
                      type="button"
                      className="btn btn-link text-danger"
                      onClick={() => {setShowRemoveMemberModal(true); setdeleteId(participate.id)}}
                    >
                      Remove
                    </button>
                    }
                  </td>
                  <td>
                    {
                      participate?.isInvited && <button
                      type="button"
                      className="btn btn-link text-secondary"
                    >
                      Invited
                    </button>
                    }
                    
                  </td>
                </tr>
                  )) : null
                }
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        }
      </div>
    <Modal
      show={showAddTeamModal}
      onSave={handleAddTeam }
      onSaveBtnText="Save"
      onCancel={() => setShowAddTeamModal(false)}
    >
      <div className="form-group">
        <label htmlFor="" className="form-label">
          Name of the New Team
        </label>
        <input type="text" onChange={(e:React.ChangeEvent<HTMLInputElement>) => setteamName(e.target.value)} className="form-control" />
      </div>
    </Modal>
    <Modal
      show={showNameModal}
      onSave={handleEditTeam }
      onSaveBtnText="Save"
      onCancel={() => setShowNameModal(false)}
    >
      <div className="form-group">
        <label htmlFor="" className="form-label">
          Name of the New Team
        </label>
        <input type="text" value={teamName} onChange={(e:React.ChangeEvent<HTMLInputElement>) => setteamName(e.target.value)} className="form-control" />
      </div>
    </Modal>
    <Modal
      className="delete-modal"
      show={showRemoveMefirstodal}
      onSave={handleDeleteMember}
      onSaveBtnText="Remove"
      onSaveBtnClassName="btn-danger"
      onCancel={() => setShowRemoveMemberModal(false)}
    >
      <div className="modal-icon">
        <i className="icon-alert-circle"></i>
      </div>
      <h6 className="modal-title">Remove Member</h6>
      <p className="modal-description text-center">
        Are you sure you want to remove the member? This action cannot be
        undone and you will need to reinvite them!
      </p>
    </Modal>
    <Modal
      className="delete-modal"
      show={showRemoveTeam}
      onSave={handleDeleteTeam}
      onSaveBtnText="Remove"
      onSaveBtnClassName="btn-danger"
      onCancel={() => setshowRemoveTeam(false)}
    >
      <div className="modal-icon">
        <i className="icon-alert-circle"></i>
      </div>
      <h6 className="modal-title">Remove Team</h6>
      <p className="modal-description text-center">
        Are you sure you want to Delete the Team? This action cannot be
        undone and you will need to reinvite them!
      </p>
    </Modal>
    <Modal
      className="invite-team-modal"
      show={showInviteTeamModal}
      onSave={handleSaveTeamMembers}
      onSaveBtnText="Send Invite"
      onCancel={() => setShowInviteTeamModal(false)}
    >
      <div className="modal-icon">
        <i className="icon-user-plus"></i>
      </div>
      <h5 className="modal-title text-start">Invite Team Members</h5>
      <div className="invite-team-rows">
        {teamMembers.map((teamMember, index) => (
          <div className="invite-team-row row" key={index}>
            <div className="col-sm-6">
              <div className="form-group">
                <input
                  type="email"
                  className="form-control"
                  placeholder="you@untitledui.com"
                  value={teamMember.email}
                  onChange={(e) =>
                    handleTeamMemberChange(index, "email", e.target.value)
                  }
                />
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <RoleSelect
                  placeholder="Permission"
                  options={roleInfo}
                  onChange={(value) =>
                    handleTeamMemberChange(index, "roleId", value)
                  }
                />
              </div>
            </div>
          </div>
        ))}
        <div className="text-center">
          <button
            type="button"
            className="add-team-member-btn"
            onClick={handleAddTeamMember}
          >
            <i className="icon-plus"></i> Add another
          </button>
        </div>
      </div>
    </Modal>
    <AlertModal setShow={setalertShow} show={alertShow} msg={message} type={typeOfAlert} />
  </>
  );
};

export default Participates;
