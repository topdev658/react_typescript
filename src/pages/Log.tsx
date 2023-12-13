import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { SERVER_BASE_URL } from "../constants/urles";
import AlertModal from "../components/Alert";
import { saveAs } from 'file-saver';
import JSZip from "jszip";
import * as XLSX from 'xlsx';
import UseUserTeamInfo from "../components/FetchRoleAndTeam";
import moment from "moment";

interface LogProps {}
interface LogActivity {
  activity: string;
  data: {
    activity: string;
    createdAt: string;
    id: number;
    data: Record<string, any>; // Adjust the type based on your metadata structure
    userId: number;
    workspaceid: number;
  }[];
}
type LogItemType = {
  createdAt: string;
  userId: number;
  workspaceid: number;
  // ... other fields
};
const Log: React.FC<LogProps> = () => {
  const [activity, setActivity] = useState<string[]>([]);
  const [alertShow, setalertShow] = useState<boolean>(false)
  const [message, setmessage] = useState<string>('')
  const [typeOfAlert, settypeOfAlert] = useState<string>('')
  const params = useParams()
  const {token} = useSelector((state:any) => state.userToken)
  const { userId } = useSelector((state: any) => state.userid)
  const userTeamInfo =  UseUserTeamInfo(userId);
  console.log(userTeamInfo)
  const hasQA = [3].includes(Number(userTeamInfo.roleName))
  const hasSuperAdminPermission = [1, 2].includes(Number(userTeamInfo.roleName));
  const handleCheckboxChange = (value: string) => {
    setActivity((prevActivity) => {
      if (prevActivity.includes(value)) {
        return prevActivity.filter((item) => item !== value);
      } else {
        return [...prevActivity, value];
      }
    });
  };



 
  const flattenObject = (obj: Record<string, any>, parentKey = ''): Record<string, any> => {
    return Object.keys(obj).reduce((acc, key) => {
      const newKey = parentKey ? `${parentKey}.${key}` : key;
      const value = obj[key];
  
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        return { ...acc, ...flattenObject(value, newKey) };
      } else {
        return { ...acc, [newKey]: value };
      }
    }, {});
  };
  
  const mapDocumentUpload = (item: any): Record<string, any> => ({
    'Uploaded At': new Date(item.createdAt).toLocaleString(),
    'UserName': item.userId,
    'File Name': item.metadata.fileName,
    'Size': item.metadata.size,
    'Category': item.metadata.categoryId,
    'Folder Name': item.metadata.folderId,
  });
  
  const mapParticipantAddRemove = (item: any): Record<string, any> => ({
    'Date': new Date(item.createdAt).toLocaleString(),
    'Name/Email of the User': item.metadata.name,
    'Workspace Name': item.workspaceid,
    'Team Name': item.metadata.teamId,
    'Is Invited': item.metadata.isInvited,
    'Status': item.metadata.Status,
  });

  const mapTeamAddRemove = (item: any): Record<string, any> => ({
    'Date': new Date(item.createdAt).toLocaleString(),
    'Name/Email of the User': item.metadata.name,
    'Team Name': item.metadata.teamId,
    'Status': item.metadata.Status,
  });

  const mapQAndA = (item: any): Record<string, any> => ({
    'Question No':item.id,
    'Date': new Date(item.createdAt).toLocaleString(),
    'Name/Email of the User': item.metadata.name,
    'Name of the Team (to)': item.metadata.to,
    'Name of the Team (from)': item.metadata.from,
    'New':item.metadata.isNew,
    'Topic':item.metadata.topic,
    'Document':item.metadata.document,
    'High-Priority':item.metadata.isHighPriority,
    'Question':item.metadata.question,
    'Status': item.metadata.Status,
  });

  const getActivityMapFunction = (activityType: string): ((item: any) => Record<string, any>) => {
    switch (activityType) {
      case 'Document Upload':
        return mapDocumentUpload;
      case 'Participant Add Remove':
        return mapParticipantAddRemove;
      case 'Team Add Remove':
        return mapTeamAddRemove;
      case 'Q A Summary':
        return mapQAndA;
      default:
        return (item: any) => ({});
    }
  };
  
  const handleDownloadLogs = async (): Promise<void> => {
    try {
      const paramsData = activity.map((item) => item.replace(/\s+/g, ' ')).join(',');
  
      // Encode the string
      const finalParams = encodeURIComponent(paramsData);
      const response = await fetch(`${SERVER_BASE_URL}/logs/download?activity=${finalParams}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          "workspaceid":`${params.id}`
        },
      });
  
      const logs: { data: LogActivity[]; error?: string } = await response.json();
      if (!response.ok) {
        setmessage(logs.error || 'Error occurred while fetching logs.');
        settypeOfAlert('error');
        setalertShow(true);
        return;
      }
  
      const zip = new JSZip();
      logs.data.forEach((activity) => {
        const mapFunction = getActivityMapFunction(activity.activity);
        const flattenedData = activity.data.map(mapFunction);
  
        const headers = Object.keys(flattenedData[0]);
        const worksheetData: any[][] = [headers, ...flattenedData.map((item) =>
          headers.map((key) => String(item[key] || ''))
        )];
  
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, activity.activity);
  
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        zip.file(`${activity.activity}.xlsx`, excelBuffer);
      });
  
      zip.generateAsync({ type: 'blob' }).then((content) => {
        saveAs(content, 'activities.zip');
      });
  
      setmessage('Logs Downloaded Successfully..!');
      settypeOfAlert('success');
      setalertShow(true);
    } catch (error) {
      console.error('Error during logs download:', error);
    }
  };
  
  


  

const activities = [
    "Document Upload",
    "Participant Add Remove",
    "Team Add Remove",
    "Q A Summary",
];

  
  return (
    <>
    <Navbar />
    <div className="top-action-bar style-2 d-flex flex-wrap">
      <div className="flex-fill d-flex flex-wrap justify-content-start">
        {/* {hasSuperAdminPermission && */}
        <button type="button" className="btn btn-dark" disabled={hasQA} onClick={handleDownloadLogs}>
          Download Logs
        </button>
{/* } */}
      </div>
    </div>
    <div className="inner-scroller log-page">
      <div className="table-responsive">
        <table className="log-table table">
          <thead>
            <tr>
              <th>
                <div className="form-check d-flex align-items-center mb-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="name1"
                    value='File Name'
                    onChange={() => setActivity(activity.length > 0 ? [] : activities)}
                  />
                  <label className="form-check-label" htmlFor="name1">
                    File name
                  </label>
                </div>
              </th>
              <th className="empty-cell"></th>
            </tr>
          </thead>
          
<tbody>
  {activities.map((activityItem) => (
    <tr key={activityItem}>
      <td>
        <div className="form-check d-flex align-items-center mb-0">
          <input
            className="form-check-input"
            type="checkbox"
            id={activityItem}
            value={activityItem}
            onChange={() => handleCheckboxChange(activityItem)}
            checked={activity.includes(activityItem)}
          />
          <label className="form-check-label text-black" htmlFor={activityItem}>
            {activityItem}
          </label>
        </div>
      </td>
    </tr>
  ))}
</tbody>
        </table>
      </div>
    </div>
    <AlertModal setShow={setalertShow} show={alertShow} msg={message} type={typeOfAlert} />
  </>
  );
};

export default Log;
