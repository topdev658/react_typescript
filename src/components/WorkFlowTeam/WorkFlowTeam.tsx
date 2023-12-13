import { Modal } from "react-bootstrap";
import React, { ChangeEvent, useEffect, useState } from "react";
import Select from "../Select";
import { DatePicker } from "antd";
import { useSelector } from "react-redux";
import { SERVER_BASE_URL } from "../../constants/urles";
import { useParams } from "react-router-dom";
interface taskinfo {
  name:string
}
interface WorkflowTeamProps {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  setalertShow:React.Dispatch<React.SetStateAction<boolean>>;
  settypeOfAlert:React.Dispatch<React.SetStateAction<string>>;
  setmessage:React.Dispatch<React.SetStateAction<string>>;
  handleFetchWorkFlows:() => Promise<void>;
}
interface taskInfoInter {
  name:string
}
export function WorkflowTeamAdd({ show, setShow,handleFetchWorkFlows,setmessage,settypeOfAlert,setalertShow}: WorkflowTeamProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [limit, setlimit] = useState<boolean>(false)
  const [taskInfo, settaskInfo] = useState<string>('')
  const [selectedParticipant, setSelectedParticipant] = useState<string>("");
  const onChange = (date: any, dateString: string) => {
    console.log(date, dateString);
  };
  const params = useParams()
  const {token} = useSelector((state:any) => state.userToken)
  const [characterCount, setCharacterCount] = useState<number>(0);

  useEffect(() => {
    setCharacterCount(taskInfo.length);
  }, [taskInfo]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const inputValue = e.target.value;
    if (inputValue.length <= 250) {
      settaskInfo(inputValue);
      setCharacterCount(inputValue.length);
      setlimit(false);
    } else {
      setlimit(true);
    }
  };
    const handleCreateworkFlows = async (e: React.FormEvent<HTMLFormElement>):Promise<void> =>{
      try {
        e.preventDefault()
        const body ={
          name:taskInfo
        }
        const response = await fetch(`${SERVER_BASE_URL}/workflows`, {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${token}`,
            "Content-Type": "application/json",
            "workspaceid" : `${params.id}`
          },
          body: JSON.stringify(body),
        });
    
        const workSpace = await response.json();
        if (!response.ok) {
          setmessage(workSpace.error)
          settypeOfAlert("error")
          setalertShow(true)
          setShow(false)
          return;
        }
        setmessage("WorkFlows Created Successfully...!")
        settypeOfAlert("success")
        setalertShow(true)
        setShow(false)
        handleFetchWorkFlows()
      } catch (error) {
        console.error("Error during Task Creating:", error);
      }
    }
  return (
    <Modal centered show={show} onHide={() => setShow(false)}>
      <Modal.Body>
        <form className="row gy-3" onSubmit={handleCreateworkFlows}>
          <div className="col-12">
            <div className="modal-icon mx-auto">
              <i className="icon-user-plus"></i>
            </div>
          </div>
          <div className="col-12">
            <div className="form-input">
              <label htmlFor="" className="form-label">
                Add Task
              </label>
              <textarea
                name=""
                id=""
                disabled={taskInfo.length >= 250}
                onChange={(e:ChangeEvent<HTMLTextAreaElement>) => settaskInfo(e.target.value)}
              ></textarea>
            </div>
          </div>
          {taskInfo.length >= 250 && (
            <p style={{ color: "red" }}>
              Maximum character limit exceeded (250 characters).
            </p>
          )}
          <p style={{ color: "grey" }}>
            {characterCount}/250 characters
          </p>
          <div className="col-12">
            <div className="row gy-3 gx-2">
              <div className="col-12 col-sm-6">
                <button
                  type="button"
                  className="btn btn-outline-secondary w-100"
                  onClick={() => setShow(false)}
                >
                  Cancel
                </button>
              </div>
              <div className="col-12 col-sm-6">
                <button type="submit" className="btn btn-dark w-100">
                  Create
                </button>
              </div>
            </div>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
}

