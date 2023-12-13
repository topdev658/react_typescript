import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import avatarImg from "../assets/img/avatar.jpg";
import Select from "../components/Select";
import Modal from "../components/Modal";
import { DatePicker } from "antd";
import { WorkflowTeamAdd } from "../components/WorkFlowTeam/WorkFlowTeam";
import { SERVER_BASE_URL } from "../constants/urles";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import moment, { Moment, isDate } from "moment";
import dayjs, { Dayjs } from 'dayjs';
import UserSelect from "../components/UserSelect";
import AlertModal from "../components/Alert";
import * as XLSX from 'xlsx';
import DynamicSelect from "../components/DynamicSelect";
import UseUserTeamInfo from "../components/FetchRoleAndTeam";
import PageLoader from "../components/PageLoader";
interface WorkflowProps {}
interface taskInfoInter {
  name:string
}
interface User {
  firstName: string;
  lastName: string;
}
interface Participant {
  participates: any;
  id: number;
  userId: number | null;
  email: string;
  roleId: number | null;
  isInvited: boolean;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  roles: any[]; // You may want to define a proper type for roles
}
interface Task {
  id: number;
  name: string;
  workspaceId: number;
  dueDate: string | null;
  userId: number;
  teamId: number | null;
  allocate: number | null;
  taskNum: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  participates: any; // You may want to define a proper type for participates
}

interface ApiResponse {
  name: string;
  data: Task[];
}

interface selectInter {
  value:number;
  label:string
}
interface teamsInterface {
  createdAt: string,
  id: number,
  name: string,
  updatedAt: string,
  workspaceId: number
}
const Workflow: React.FC<WorkflowProps> = () => {
  const [selectedTeam, setSelectedTeam] = useState<number>(0);
  const [workflos, setworkflos] = useState<Task[]>([])
  const [filteredWorkflows, setfilteredWorkflows] = useState<Task[]>([])
  const [selectedParticipents, setSelectedParticipents] = useState<number | undefined>(0);
  const [updateId, setupdateId] = useState<number>(0)
  const [deleteId, setdeleteId] = useState<number>(0)
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [taskDelete, settaskDelete] = useState<boolean>(false)
  const [showTeamAddModal, setShowTeamAddModal] = useState<boolean>(false);
  const [selectedDate, setselectedDate] = useState<string | null>(null)
  const [alertShow, setalertShow] = useState<boolean>(false)
  const [loading, setloading] = useState<boolean>(true)
  const [allParticipants, setAllParticipants] = useState<selectInter[]>([])
  const [teamsList, setteamsList] = useState<teamsInterface[]>([])
  const [dueDate, setdueDate] = useState<Moment | null>(null)
  const [message, setmessage] = useState<string>('')
  const [typeOfAlert, settypeOfAlert] = useState<string>('')
  const [allocateId, setallocateId] = useState<number | undefined>(0)
  const [status, setstatus] = useState<string>('')
  const [isDatePickerOpen, setDatePickerOpen] = useState<boolean>(false)
  const [isToggled, setIsToggled] = useState(false);

  const handleToggle = () => {
    setSelectedRows(isToggled ? [] : filteredWorkflows.map((workflow) => workflow.id));
    setIsToggled(!isToggled);
  };
  const [taskInfo, settaskInfo] = useState<taskInfoInter>({
    name:''
  })
  const {token} = useSelector((state:any) => state.userToken)
  const { userId } = useSelector((state: any) => state.userid)
  const params = useParams()
  const userTeamInfo =  UseUserTeamInfo(userId);
  const hasSuperAdminAdminAndQAPermission = [1, 2, 3].includes(Number(userTeamInfo.roleName));
console.log(userTeamInfo)
  const [showInviteTeamModal, setShowInviteTeamModal] =
    useState<boolean>(false);

    const handleShowDelete = () =>{
      if(hasSuperAdminAdminAndQAPermission){
        return true;
      }
    }
    const [selectedRows, setSelectedRows] = useState<number[]>([]);

    
    const handleCheckboxChange = (taskId: number) => {
      setSelectedRows((prevSelectedRows) => {
        if (prevSelectedRows.includes(taskId)) {
          return prevSelectedRows.filter((id) => id !== taskId);
        } else {
          return [...prevSelectedRows, taskId];
        }
      });
    };
  
    const downloadExcel = () => {
      if(selectedRows.length <= 0){
        setmessage("Please Select Rows to download")
        settypeOfAlert("error")
        setalertShow(true)
        return
      }
      const excelData = workflos.map(entry => ({
        'Task No': entry.taskNum,
        'Task Name': entry.name,
        'Date Created': moment(entry.createdAt).format('MMMM D, YYYY'),
        'Due Date': entry.dueDate ? moment(entry.dueDate).format('MMMM D, YYYY') : '',
        'Created By': `${entry.user.firstName} ${entry.user.lastName}`,
        'Status': entry.status,
        'Allocate': entry.participates?.user.firstName,
        'Team': entry.participates?.teams.name,
      }));
    
      // Create a worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
    
      // Create a workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    
      // Save to file
      XLSX.writeFile(wb, 'taskList.xlsx');
    };
    const handleFetchWorkFlows = async ():Promise<void> =>{
      try {
        const response = await fetch(`${SERVER_BASE_URL}/workflows`, {
          method: "GET",
          headers: {
            'Authorization': `Bearer ${token}`,
            "Content-Type": "application/json",
            "workspaceid":`${params.id}`
          }
        });
    
        const workflow = await response.json();
        if (!response.ok) {
          setloading(false)
          setmessage(workflow.error)
          settypeOfAlert("error")
          setalertShow(true)
          return;
        }
        setworkflos(workflow.data)
        setfilteredWorkflows(workflow.data)
        setloading(false)
      } catch (error) {
        setloading(false)
        console.error("Error during Task Creating:", error);
      }
    }
    const handleFetchTeams = async (): Promise<void> => {
      try {
        const response = await fetch(`${SERVER_BASE_URL}/teams`, {
          method: "GET",
          headers: {
            'Authorization': `Bearer ${token}`,
            "Content-Type": "application/json",
            "workspaceid": `${params.id}`
          }
        });
  
        const teamsData = await response.json();
        if (!response.ok) {
          console.error("fetch failed:", teamsData || response);
          return;
        }
        console.log(teamsData)
        setteamsList([{ id: 0, name: "All" }, ...(teamsData?.data || [])]);
        setSelectedTeam(teamsData.data[0])
      } catch (error) {
        console.error("Error during fetch teams:", error);
      }
    }
    const handleFetchParticipates = async ():Promise<void> =>{
      try {
        const response = await fetch(`${SERVER_BASE_URL}/teams/participate`, {
          method: "GET",
          headers: {
            'Authorization': `Bearer ${token}`,
            "Content-Type": "application/json",
            "workspaceid":`${params.id}`
          }
        });
    
        const participate = await response.json();
        if (!response.ok) {
          setmessage(participate.error)
          settypeOfAlert("error")
          setalertShow(true)
          return;
        }

        const participants: Participant[] = participate.data.flatMap((team: Participant) => team.participates);

        const filteredParticipants = participants.filter(participant =>
          participant.user?.firstName !== undefined && participant.user?.lastName !== undefined
        );
        
        const mappedParticipants = filteredParticipants.map(participant => ({
          value: participant.id,
          label: `${participant.user?.firstName} ${participant.user?.lastName}`,
        }));
    setAllParticipants(mappedParticipants)
      } catch (error) {
        console.error("Error during Task Creating:", error);
      }
    }

    const handleSetDueDate = async (id: number, date: string): Promise<void> => {
      try {
        const parameter = {
          dueDate: date,
        };
    
        const response = await fetch(`${SERVER_BASE_URL}/workflows/duedate/${id}`, {
          method: "PUT",
          headers: {
            'Authorization': `Bearer ${token}`,
            "Content-Type": "application/json",
            "workspaceid": `${params.id}`,
          },
          body: JSON.stringify(parameter)
        });
    
        const workflow = await response.json();
        
        if (!response.ok) {
          setDatePickerOpen(false)
          setmessage(workflow.error);
          settypeOfAlert("error");
          setalertShow(true);
          return;
        }
    
        handleFetchWorkFlows()
        setDatePickerOpen(false)
        setmessage("due date changed successfully....!")
        settypeOfAlert("success")
        setalertShow(true)
      } catch (error) {
        console.error("Error during Task Creating:", error);
      }
    };
    const handleDelete = async (): Promise<void> => {
      try {    
        const response = await fetch(`${SERVER_BASE_URL}/workflows/${deleteId}`, {
          method: "DELETE",
          headers: {
            'Authorization': `Bearer ${token}`,
            "Content-Type": "application/json",
            "workspaceid": `${params.id}`,
          }
        });
    
        const workflow = await response.json();
        
        if (!response.ok) {
          setmessage(workflow.error);
          settypeOfAlert("error");
          setalertShow(true);
          return;
        }
        setmessage("Task Deleted Successfully...")
        settypeOfAlert('success')
        setalertShow(true)
        handleFetchWorkFlows()
      } catch (error) {
        console.error("Error during Task Creating:", error);
      }
    };
    const handleEditWorkFlow = async (): Promise<void> => {
      try {
        const parameter = {
          allocate: selectedParticipents,
          status:selectedStatus
        };
    
        const response = await fetch(`${SERVER_BASE_URL}/workflows/${updateId}`, {
          method: "PUT",
          headers: {
            'Authorization': `Bearer ${token}`,
            "Content-Type": "application/json",
            "workspaceid": `${params.id}`,
          },
          body: JSON.stringify(parameter)
        });
    
        const workflow = await response.json();
        
        if (!response.ok) {
          setmessage(workflow.error);
          settypeOfAlert("error");
          setalertShow(true);
          setShowInviteTeamModal(false) 
          return;
        }
        setmessage("Task Update Successfully...")
        settypeOfAlert("success")
        setalertShow(true)
        setShowInviteTeamModal(false) 
        handleFetchWorkFlows()
      } catch (error) {
        console.error("Error during Task Creating:", error);
      }
    };
    
    const handleDueDateChange = async (id: number, date: Dayjs | null): Promise<void> => {
      if (date) {
        const formattedDate = date.format("YYYY-MM-DD");
        try {
          await handleSetDueDate(id, formattedDate);
        } catch (error) {
          console.error("Error setting due date:", error);
        }
      }
    };
    
    const handleFilterStatus = (status:string) =>{
      if(status == "All"){
        setfilteredWorkflows(workflos)
        return
      }
      if(status){
      const statusMatch = workflos.filter((workflow) => workflow.status === status)
      setfilteredWorkflows(statusMatch)
      }
    }

    const handleFilterDueDate = (date:string) =>{
      if(date){
      const dueDateMatch = filteredWorkflows.filter((workflow:Task) => workflow.dueDate === date)
      setfilteredWorkflows(dueDateMatch)
      }else{
        setfilteredWorkflows(workflos)
      }
    }

    const handleFilterTeam = (id:number) =>{
      if(id === 0){
        setfilteredWorkflows(workflos)
        return
      }
      if(id){
      const teamidMatch = workflos.filter((workflow:Task) => workflow.teamId === id)
      setfilteredWorkflows(teamidMatch)
      }
    }


useEffect(() => {
  handleFetchWorkFlows()
  handleFetchParticipates()
  handleFetchTeams()
}, [])

  return (
    <>
      <Navbar />
      <div className="top-action-bar style-2 d-sm-flex flex-wrap align-items-center">
        <div className="d-flex align-items-center gap-5">
          {
            hasSuperAdminAdminAndQAPermission && <button type="button" className="part-team-add-btn__v2" onClick={() => setShowTeamAddModal(true)}>
            <span>
              <i className="icon-plus"></i>
            </span>
            Add Task
          </button>
          }
          
          {
            hasSuperAdminAdminAndQAPermission && <button type="button" className="btn btn-dark" onClick={downloadExcel}>
            Download
          </button>
          }
        </div>
        <div className="flex-fill task-filters d-flex flex-wrap justify-content-sm-end">
          <div className="form-group">
            <label htmlFor="" className="form-label">
              Status
            </label>
            <Select
              placeholder="Status"
              options={[
                { value: 1, label: "All" },
                { value: 2, label: "Pending" },
                { value: 3, label: "In Process" },
                { value: 4, label: "Complete" },
              ]}
              onChange={(e) => handleFilterStatus(e)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="" className="form-label">
              Due Date
            </label>
            {/* <select name="" id="" className="form-select"> */}
              <DatePicker className="form-select" onChange={(date) => handleFilterDueDate(date ? date.format('YYYY-MM-DD') : '')}/>
            {/* </select> */}
            
          </div>
          <div className="form-group">
            <label htmlFor="" className="form-label">
              Team 
            </label>
            <DynamicSelect
                placeholder="Team"
                options={teamsList}
                defaultValue={0}
                onChange={(e) => handleFilterTeam(e)}
              />
          </div>
        </div>
      </div>
      {
        loading  ? <PageLoader/> : <div className="inner-scroller task-page">
        <div className="table-responsive">
          <table className="task-table table">
            <thead>
              <tr>
                <th>
                  <div className="form-check d-flex align-items-center mb-0">
                  <input
      className="form-check-input"
      type="checkbox"
      id="name1"
      onChange={handleToggle}
      checked={isToggled}
    />


                    <label className="form-check-label" htmlFor="name1">
                      Task
                    </label>
                  </div>
                </th>
                <th className="text-center">Task No</th>
                <th className="text-center">Date Created</th>
                <th className="text-center">Due Date</th>
                <th className="text-center">Created By</th>
                <th className="text-center">Status</th>
                <th className="text-center">Allocate</th>
                <th className="text-center">Team</th>
                <th className="empty-cell"></th>
              </tr>
            </thead>
            <tbody>
              {
                filteredWorkflows && filteredWorkflows.length > 0 ? filteredWorkflows.map((workflow:Task) => (
                  <tr key={workflow.id}>
                <td>
                  <div className="form-check d-flex align-items-center mb-0">
                  <input
  className="form-check-input"
  type="checkbox"
  id="name3"
  checked={selectedRows.includes(workflow.id)}
  onChange={() => handleCheckboxChange(workflow.id)}
/>

                    <label
                      className="form-check-label text-black"
                      htmlFor="name3"
                    >
                      {workflow.name}
                    </label>
                  </div>
                </td>
                <td className="text-center">{workflow.taskNum}</td>
                <td className="text-black text-center">{moment(workflow.createdAt).format('MMMM D, YYYY')}</td>
                <td className="text-center">
                {
                  workflow.dueDate  != null ? workflow.dueDate : <DatePicker disabled={!hasSuperAdminAdminAndQAPermission}
                  bordered={false}
                  open={isDatePickerOpen}
                  placeholder="+ Set Due Date"
                  onOpenChange={(status) => setDatePickerOpen(status)}
                  onChange={(date) => handleDueDateChange(workflow.id, date)}
                />
                }<i
                className="icon-edit-2"
                onClick={() => {
                  setDatePickerOpen(!isDatePickerOpen);
                  setupdateId(workflow.id)
                  setselectedDate(workflow.dueDate ? workflow.dueDate : null);
                }}
              ></i>
                {
                  isDatePickerOpen && updateId === workflow.id && <DatePicker
      value={dayjs(selectedDate, { format: 'YYYY-MM-DD' })}
      onChange={(date) => handleDueDateChange(updateId, date)}
    />
                }
                </td>
                <td className="text-center">{workflow.user.firstName}</td>
                <td className="text-center">
                  <span className={`task-status ${workflow.status}`}>{workflow.status}</span>
                </td>
                <td>
                {
                     workflow.participates != null &&   <div className="team-user-wrap">
                    <div className="team-user-img">
                      <img src={ workflow.participates?.user.imageUrl} alt="" />
                    </div>
                     <div className="team-user-con">
                      <span>{ workflow.participates?.user.firstName} { workflow.participates?.user.lastName}</span>
                      <a href="mailto:candice@untitledui.com">
                        { workflow.participates?.user.email}
                      </a>
                    </div>
                  </div>
                    }
                </td>
                <td className="text-center">{workflow?.participates?.teams.name}</td>
                <td className="text-start">
                  {
                    hasSuperAdminAdminAndQAPermission && <button type="button" className="td-icon-btn" disabled={!hasSuperAdminAdminAndQAPermission} onClick={() => {setdeleteId(workflow.id); }}>
                    <i className="icon-trash"></i>
                  </button>
                  }
                 {
                  hasSuperAdminAdminAndQAPermission &&  <button
                  type="button"
                  className="td-icon-btn"
                  onClick={() => {setShowInviteTeamModal(true); setdueDate(dayjs(workflow.dueDate) as Moment | null);                    ;  setupdateId(workflow.id); setallocateId(workflow.allocate ? workflow.allocate : undefined); setstatus(workflow.status); setSelectedStatus(workflow.status); setSelectedParticipents(workflow.allocate ? workflow.allocate : undefined) }}
                >
                  <i className="icon-edit"></i>
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
      }
      <Modal
        show={showInviteTeamModal}
        onSave={handleEditWorkFlow}
        onSaveBtnText="Save"
        onCancel={() => setShowInviteTeamModal(false)}
      >
        <div className="modal-icon mx-auto">
          <i className="icon-user-plus"></i>
        </div>
        <h5 className="modal-title">Allocate to Participent</h5>
        <div className="form-group">
          <label htmlFor="" className="form-label color-2">
            Participant  {JSON.stringify(selectedParticipents)}
          </label>
          <UserSelect
            placeholder="Participant"
            options={allParticipants}
            onChange={(e) => setSelectedParticipents(e)}
            defaultValue={allocateId}
          />
        </div>
        <div className="form-group">
          <label htmlFor="" className="form-label color-2">
            Status
          </label>
          <Select
            placeholder="Status"
            defaultSelectedValue={status}
            options={[
              { value: 1, label: "Pending" },
              { value: 2, label: "In Process" },
              { value: 2, label: "Complete" },
            ]}
            onChange={(e) => setSelectedStatus(e)}
          />
        </div>
      </Modal>
      {/* <Modal
        // show={isDatePickerOpen}
        // onSave={() => setDatePickerOpen(false)}
        onSaveBtnText="Save"
        // onCancel={() => setDatePickerOpen(false)}
      >
        <div className="col-12 my-2">
            <div className="form-input">
              <label htmlFor="" className="form-label">
                Due Date 
              </label>
              <DatePicker
              // selected={moment(selectedDate).format('DD-MM-YYYY')}
  value={dayjs(selectedDate, { format: 'YYYY-MM-DD' })}
  onChange={(date) => handleDueDateChange(updateId, date)}
/>



            </div>
          </div>
      </Modal> */}
      <Modal
        className="delete-modal"
        show={taskDelete}
        onSave={handleDelete}
        onSaveBtnText="Remove"
        onSaveBtnClassName="btn-danger"
        onCancel={() => settaskDelete(false)}
      >
        <div className="modal-icon">
          <i className="icon-alert-circle"></i>
        </div>
        <h6 className="modal-title">
          Delete{" "}
          <a href="#" className="text-dark text-decoration-underline">
            Task 
          </a>
          ?
        </h6>
        <p className="modal-description text-center">
          Are you sure you want to delete the Task? This action cannot be
          undone.
        </p>
      </Modal>
      <WorkflowTeamAdd setmessage={setmessage} handleFetchWorkFlows={handleFetchWorkFlows} setalertShow={setalertShow} settypeOfAlert={settypeOfAlert}show={showTeamAddModal} setShow={setShowTeamAddModal} />
      <AlertModal setShow={setalertShow} show={alertShow} msg={message} type={typeOfAlert}/>
    </>
  );
};

export default Workflow;
