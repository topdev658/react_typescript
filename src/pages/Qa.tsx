import React, { ChangeEvent, useEffect, useState } from "react";
import Modal from "../components/Modal";
import Navbar from "../components/Navbar";
import Select from "../components/Select";
import avatarImg from "../assets/img/avatar.jpg";
import { SERVER_BASE_URL } from "../constants/urles";
import { useSelector } from "react-redux";
import DynamicSelect from "../components/DynamicSelect";
import moment from "moment";
import axios from 'axios'
import { useParams } from "react-router-dom";
import AlertModal from "../components/Alert";
import EmptyDataPlaceholder from "../components/EmptyDataPlaceholder";
import UseUserTeamInfo from "../components/FetchRoleAndTeam";
import PageLoader from "../components/PageLoader";
import  uplode  from "../assets/img/uplode.jpg";
import { useDropzone } from "react-dropzone";
import { Col, Dropdown, Row, Table } from "react-bootstrap";
interface teamsInterface {
  createdAt: string,
  id: number,
  name: string,
  updatedAt: string,
  workspaceId: number
}
interface FolderCategoriesInterface {
  createdAt: string,
  id: number,
  name: string,
  updatedAt: string,
  workspaceId: number
}
interface folderListInterface {
  createdAt: string,
  id: number,
  name: string,
  updatedAt: string,
  workspaceId: number
}
interface User {
  firstName: string;
  lastName: string;
}
interface Answer {
  answer: string;
  user: User;
}
interface documentInterface {
  name: string;
  file: string
};
interface QuestionInterface {
  createdAt: string;
  document: documentInterface;
  from: number;
  id: number;
  isClosed: boolean;
  isHighPriority: boolean;
  isNew: boolean;
  answer: Answer[];
  queFrom: { name: string };
  question: string;
  sendForApproval: boolean;
  to: number;
  topic: string;
  updatedAt: string;
  user: User;
  queNum: number;
  queTo: { name: string };
  userId: number;
  workspaceId: number;
}

const singleQuestionResponse: QuestionInterface = {
  createdAt: "",
  document: {
    name: "",
    file: ""
  },
  from: 21,
  id: 3,
  isClosed: false,
  isHighPriority: true,
  isNew: true,
  queFrom: { name: "" },
  question: "",
  sendForApproval: false,
  to: 2,
  answer: [],
  topic: "",
  updatedAt: "",
  user: { firstName: "", lastName: "" },
  userId: 2,
  workspaceId: 21,
  queNum: 0,
  queTo: {
    name: ""
  }
};
interface uploadfile {
  name: string;
  size: number;
}
interface workSpaceInterface {
  isQANotification: boolean | undefined;
  isTeamSpecificQA: boolean | undefined;
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  purpose: string;
  type: string;
  user: {
    email: string;
    mobile: string;
    setting: any; // You might want to replace 'any' with the actual type
  };
}

const initialProfile: workSpaceInterface = {
  id: 4,
  name: "",
  isQANotification: false,
  isTeamSpecificQA: false,
  description: "",
  imageUrl: "",
  purpose: "",
  type: "",
  user: {
    email: "",
    mobile: "",
    setting: null
  }
};

const Qa: React.FC = () => {
  const [showQAModal, setShowQAModal] = useState<boolean>(false);
  const [selectedTeamto, setSelectedTeamto] = useState<number>(0);
  const [selectedDoc, setselectedDoc] = useState<string>('')
  const [selectedTeamFrom, setselectedTeamFrom] = useState<number>(0)
  const [folderName, setfolderName] = useState<string>('')
  const [deleteId, setdeleteId] = useState<number>(0)
  const [updateId, setupdateId] = useState<number>(0)
  const [selectedUploadCategory, setSelectedUploadCategory] = useState<number>(0);
  const [selectedFolder, setSelectedFolder] = useState<number>(0);
  const [showFolderModal, setShowFolderModal] = useState<boolean>(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState<boolean>(false);
  const [showDocsModal, setShowDocsModal] = useState<boolean>(false);
  const [showDeleteQAModal, setShowDeleteQAModal] = useState<boolean>(false);
  const [teamsList, setteamsList] = useState<teamsInterface[]>([])
  const [folderList, setfolderList] = useState<folderListInterface[]>([])
  const [categoryList, setcategoryList] = useState<FolderCategoriesInterface[]>([])
  const { token } = useSelector((state: any) => state.userToken)
  const { userId } = useSelector((state: any) => state.userid)
  const { workType } = useSelector((state: any) => state.workSpace)
  const [alertShow, setalertShow] = useState<boolean>(false)
  const [message, setmessage] = useState<string>('')
  const [typeOfAlert, settypeOfAlert] = useState<string>('')
  const [showQaEdit, setshowQaEdit] = useState<boolean>(false)
  const [activeQuestion, setactiveQuestion] = useState<number>(1)
  const [questionsList, setquestionsList] = useState<QuestionInterface[]>([])
  const [profileDetail, setprofileDetail] = useState<workSpaceInterface>(initialProfile)
  const [selectedQuestion, setselectedQuestion] = useState<QuestionInterface>(singleQuestionResponse)
  const [questionTopic, setquestionTopic] = useState<string>('')
  const [categoryName, setcategoryName] = useState<string>('')
  const [answer, setanswer] = useState<string>('')
  const [question, setquestion] = useState<string>('')
  const [selectedFile, setselectedFile] = useState<File[]>([])
  const [documentId, setdocumentId] = useState<string>('')
  const [isEditingEnabled, setIsEditingEnabled] = useState<boolean>(true);
  const [isDownloadingEnabled, setisDownloadingEnabled] = useState<boolean>(true)
  const [isHighPriority, setisHighPriority] = useState<boolean>(false)
  const [isClose, setisClose] = useState<boolean>(false)
  const [isSendApproved, setisSendApproved] = useState<boolean>(false)
  const [loading, setloading] = useState<boolean>(true)
  const [questionNo, setquestionNo] = useState<number>(0)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [uploadDoc, setuploadDoc] = useState<uploadfile>({ name: '', size: 0 })
  const [isSegration, setisSegration] = useState<boolean>(false)
  const params = useParams()
  const userTeamInfo = UseUserTeamInfo(userId);
  const hasAdminPermission = [2].includes(Number(userTeamInfo.roleName));
  const hasQAPermission = [3].includes(Number(userTeamInfo.roleName));
  console.log(userTeamInfo)
  const hasSuperAdminPermission = [1].includes(Number(userTeamInfo.roleName));
  const hasSuperAdminAndQAPermission = [1, 2, 3].includes(Number(userTeamInfo.roleName));

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles: File[]) => {
      setselectedFile(acceptedFiles);
      setuploadDoc({ name: acceptedFiles[0].name, size: acceptedFiles[0].size });
    },
  });
  const handleShowDelete = (team: number, userid: number) => {
    if (hasSuperAdminPermission && team == userTeamInfo.teamNo) {
      return true;
    }

    if (hasAdminPermission && team == userTeamInfo.teamNo) {
      return true;
    }

    if (hasQAPermission && userid == userTeamInfo.userId) {
      return true;
    }
    return false;
  }


  const handleShowSegration = (team: number, secTeam: number) => {
    if (isSegration) {
      if (userTeamInfo?.teamName === "Internal Team" || userTeamInfo?.teamNo === team || userTeamInfo.teamNo === secTeam) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }

  }
  const handleEditableEnabled = () => {
    setIsEditingEnabled(!isEditingEnabled);
  };

  const handleDownloadingEnabled = () => {
    setisDownloadingEnabled(!isDownloadingEnabled);
  };
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files && event.target.files;
    if (files) {
      setuploadDoc({ name: files[0].name, size: files[0].size });
      const fileArray = Array.from(files);
      setselectedFile(fileArray);
      setselectedDoc(files[0].name)
    }
  };

  const convertFileSize = (fileSizeInBytes: number): string => {
    const kilobyte = 1024;

    if (fileSizeInBytes < kilobyte) {
      return `${fileSizeInBytes} bytes`;
    } else if (fileSizeInBytes < kilobyte * 1024) {
      const fileSizeInKB = fileSizeInBytes / kilobyte;
      return `${fileSizeInKB.toFixed(2)} KB`;
    } else if (fileSizeInBytes < kilobyte * 1024 * 1024) {
      const fileSizeInMB = fileSizeInBytes / (kilobyte * 1024);
      return `${fileSizeInMB.toFixed(2)} MB`;
    } else {
      const fileSizeInGB = fileSizeInBytes / (kilobyte * 1024 * 1024);
      return `${fileSizeInGB.toFixed(2)} GB`;
    }
  };

  const handleUploadFile = async (): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append('folderId', String(selectedFolder));
      formData.append('categoryId', String(selectedUploadCategory));
      for (let i = 0; i < selectedFile.length; i++) {
        formData.append('file', selectedFile[i])
      }
      formData.append('isEditable', isEditingEnabled.toString());
      formData.append('isDownloadable', isDownloadingEnabled.toString());

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'workspaceid': `${params.id}`,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent: any) => {
          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          console.log(`Upload Progress: ${progress}%`);
          setUploadProgress(progress);
        },
      };

      const response = await axios.post(`${SERVER_BASE_URL}/documents`, formData, config);

      if (response.status !== 200) {
        throw new Error(response.data?.error);
      }

      const documentData = response.data;

      console.log(documentData);

      setmessage('Document Added Successfully..!');
      settypeOfAlert('success');
      setalertShow(true);
      setdocumentId(documentData?.data[0]?.id);
      setselectedDoc(documentData?.data?.name);
      setShowDocsModal(false);
      setShowQAModal(true);
      setUploadProgress(0);
    } catch (error: any) {
      setUploadProgress(0);
      console.error('Error during document upload:', error);

      const errorMessage = error.response?.data?.error || error.message;

      setmessage(errorMessage);
      settypeOfAlert('error');
      setalertShow(true);
      setShowDocsModal(false);
    }
  };

  const handleAddNewFolder = async () => {
    const parameter = {
      name: folderName,
    }
    try {
      const response = await fetch(`${SERVER_BASE_URL}/folders`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
          'workspaceid': `${params.id}`,
        },
        body: JSON.stringify(parameter),
      });

      const folderData = await response.json();
      if (!response.ok) {
        setShowAddCategoryModal(false)
        settypeOfAlert('error')
        setmessage(folderData?.error);
        setalertShow(true)
        setShowDocsModal(true)
        console.error("category failed:", folderData || response);
        return;
      }
      settypeOfAlert('success')
      setmessage("New Folder Added Added Successfully..!");
      setalertShow(true)
      setShowFolderModal(false)
      handleFetchDocumentFolder()
      setShowDocsModal(true)
    } catch (error) {
      console.error("Error during folder Create:", error);
    }
  }
  const handleAddNewCategory = async () => {
    const parameter = {
      name: categoryName,
    }
    try {
      const response = await fetch(`${SERVER_BASE_URL}/categories`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
          'workspaceid': `${params.id}`,
        },
        body: JSON.stringify(parameter),
      });

      const folderData = await response.json();
      if (!response.ok) {
        setShowAddCategoryModal(false)
        settypeOfAlert('error')
        setmessage(folderData?.error);
        setalertShow(true)
        setShowDocsModal(true)
        console.error("category failed:", folderData || response);
        return;
      }
      settypeOfAlert('success')
      setmessage("New Folder Added Added Successfully..!");
      setalertShow(true)
      setShowAddCategoryModal(false)
      handleFetchDocumentCategory()
      setShowDocsModal(true)
    } catch (error) {
      console.error("Error during folder Create:", error);
    }
  }

  const handleFetch = async (): Promise<void> => {
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
      setteamsList(teamsData?.data)
    } catch (error) {
      console.error("Error during fetch teams:", error);
    }
  }

  const handleFetchquestionDetails = async (id: number): Promise<void> => {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/questions/${id}`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
          "workspaceid": `${params.id}`
        }
      });

      const questionData = await response.json();
      if (!response.ok) {
        console.error("fetch failed:", questionData || response);
        return;
      }
      console.log(questionData)
      setselectedQuestion(questionData?.data[0])
    } catch (error) {
      console.error("Error during fetch question details:", error);
    }
  }

  const handleFetchDocumentFolder = async (): Promise<void> => {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/folders`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
          "workspaceid": `${params.id}`
        }
      });

      const folderData = await response.json();
      if (!response.ok) {
        console.error("fetch folders failed:", folderData || response);
        return;
      }
      setfolderList(folderData?.data)
    } catch (error) {
      console.error("Error during folder Create:", error);
    }
  }
  const handleFetchDocumentCategory = async (): Promise<void> => {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/categories`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
          "workspaceid": `${params.id}`
        }
      });

      const folderData = await response.json();
      if (!response.ok) {
        console.error("Login failed:", folderData || response);
        return;
      }
      setcategoryList(folderData?.data)
    } catch (error) {
      console.error("Error during folder Create:", error);
    }
  }
  const resetModalState = () => {
    setquestionTopic('');
    setSelectedTeamto(0);
    setquestion('');
    setisHighPriority(false);
    setselectedDoc('');
  };
  const handleAddQuestion = async (): Promise<void> => {
    try {
      const baseParameter = {
        topic: questionTopic,
        to: selectedTeamto,
        from: selectedTeamFrom,
        question: question,
        sendForApproval: isSendApproved,
        isHighPriority: isHighPriority,
        isClosed: isClose,
        isNew: false,
      };

      // Conditionally include documentId if documented is not equal to 0
      const parameter = documentId != '' ? { ...baseParameter, documentId } : baseParameter;
      const response = await fetch(`${SERVER_BASE_URL}/questions`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
          "workspaceid": `${params.id}`
        },
        body: JSON.stringify(parameter),
      });

      const authResponse = await response.json();
      if (!response.ok) {
        setmessage(authResponse.error)
        settypeOfAlert("error")
        setalertShow(true)
        setShowQAModal(false)
        return;
      }
      setmessage("Question Added Successfully...!");
      settypeOfAlert("success")
      setalertShow(true)
      setShowQAModal(false)
      handleFetchQuestion()
      resetModalState()
    } catch (error) {

    }
  }

  const handleEdit = (question: QuestionInterface) => {
    setquestionTopic(question.topic)
    setquestionNo(question.queNum)
    setSelectedTeamto(question.to)
    setselectedTeamFrom(question.from)
    setquestion(question.question)
    setupdateId(question.id)
    setisHighPriority(question.isHighPriority)
    setisClose(question.isClosed)
    setisSendApproved(question.sendForApproval)
    setshowQaEdit(true)
  }

  const handleEditQuestion = async (): Promise<void> => {
    try {
      const baseParameter = {
        topic: questionTopic,
        to: selectedTeamto,
        from: selectedTeamFrom,
        question: question,
        sendForApproval: isSendApproved,
        isHighPriority: isHighPriority,
        isClosed: isClose,
        isNew: false,
      };

      // Conditionally include documentId if documented is not equal to 0
      const parameter = documentId != '' ? { ...baseParameter, documentId } : baseParameter;
      const response = await fetch(`${SERVER_BASE_URL}/questions/${updateId}`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
          "workspaceid": `${params.id}`
        },
        body: JSON.stringify(parameter),
      });

      const authResponse = await response.json();
      if (!response.ok) {
        setmessage(authResponse.error)
        settypeOfAlert("error")
        setalertShow(true)
        setshowQaEdit(false)
        return;
      }
      setmessage("question Updated Successfully...!");
      settypeOfAlert("success")
      setalertShow(true)
      setshowQaEdit(false)
      handleFetchQuestion()
    } catch (error) {

    }
  }

  const handleCloseThread = async (id: number): Promise<void> => {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/questions/${id}/close-thread`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
          "workspaceid": `${params.id}`
        },
      });

      console.log(response.ok)
      console.log(response)
      // const authResponse = await response.json();
      if (!response.ok) {
        // setmessage(authResponse.error)
        settypeOfAlert("error")
        setalertShow(true)
        return;
      }
      setmessage("Thread Closed successfully...!");
      settypeOfAlert("success")
      setalertShow(true)
      handleFetchQuestion()
      handleFetchquestionDetails(id)
    } catch (error) {

    }
  }

  const handleFetchQuestion = async (): Promise<void> => {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/questions`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
          "workspaceid": `${params.id}`
        },
      });

      const questionData = await response.json();
      if (!response.ok) {
        setloading(false)
        console.error("failed to add question", questionData || response);
        return;
      }
      console.log(questionData)
      setquestionsList(questionData?.data)
      setloading(false)
      // handleFetchquestionDetails(questionData?.data[0].id)
    } catch (error) {
      setloading(false)
      console.log(error)
    }
  }

  const handleDeleteQuestion = async (): Promise<void> => {
    try {
      setShowDeleteQAModal(false)
      const response = await fetch(`${SERVER_BASE_URL}/questions/${deleteId}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
          "workspaceid": `${params.id}`
        },
      });

      const questionData = await response.json();
      if (!response.ok) {
        setmessage(questionData.error)
        settypeOfAlert('error')
        setalertShow(true)
        console.error("failed to add question", questionData || response);
        return;
      }
      setmessage("Question Deleted Successfully...")
      settypeOfAlert('success')
      setalertShow(true)
      handleFetchQuestion()
    } catch (error) {
      console.log(error)
    }
  }

  const handleSubmitAnswer = async (id: number): Promise<void> => {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/questions/answer/${id}`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
          "workspaceid": `${params.id}`
        },
        body: JSON.stringify({ answer: answer }),
      });

      const authResponse = await response.json();
      if (!response.ok) {
        setmessage(authResponse.error)
        settypeOfAlert("error")
        setalertShow(true)
        setShowQAModal(false)
        return;
      }
      setmessage("Answer Submited Successfully...!");
      settypeOfAlert("success")
      setalertShow(true)
      handleFetchQuestion()
      handleFetchquestionDetails(id)
      setanswer('')
    } catch (error) {

    }
  }
  const handleFetchProfile = async (): Promise<void> => {
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
      const profileDetails = profileData.data[0]
      setisSegration(profileDetails?.setting?.isTeamSpecificQA)
    } catch (error) {
      console.log(error)
    }
  }
  const styleColor = {
    background: 'linear-gradient(to right, #008000, #800080)',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
    display: 'inline-block',
  };
  useEffect(() => {
    handleFetch()
    handleFetchDocumentCategory()
    handleFetchDocumentFolder()
    handleFetchQuestion()
    handleFetchProfile()
  }, [])


  return (
    <div className="wrapper qa-page">
      <Navbar />
      <div className="top-action-bar-2 newdrops">
        <div className="dropmainbar">
          
        {
          hasSuperAdminAndQAPermission && <div className="add-btn-wrap d-flex align-items-center">
          <button
            type="button"
            className="add-btn"
            onClick={() => setShowQAModal(true)}
          >
            <i className="icon-plus"></i>
          </button>
          <span>New Q&A</span>
        </div>
        }
        <div className="priority-badge style-2">
          <i className="icon-alert-circle"></i>
          <span>High Priority</span>
        </div>
        <div className="priority-badge">
          <i className="icon-check-circle"></i>
          <span>Q&A Thread closed/ Resolved</span>
        </div>

        </div>

      </div>
      {
        questionsList?.length <= 0 && <Row>

        <Col md={{span:6, order:1}} className="inp"  xs={{ span: 12, order: 2 }}>
        <div className="">
<img src={uplode} alt="uplode"  className="newuplode"/>
<p className="nex-text">Click on 'New Q&A' to Start Asking Questions</p>
      </div>
        </Col>

        <Col md={{span:1, order:2}}>
        <div className="vertical-line"></div>
        </Col>

        <Col md={{span:5, order:3}} className="inps" xs={{ span: 12, order: 1 }} >
          <div className="newInp">
            No Q&A to show
          </div>
        </Col>
      </Row>
      }
      {loading ? (
        <PageLoader />
      ) : (
        <div className="newQAWrapper">
          <div className="sectionQA">
            <div className="newQABoxesWrapper"> 
            {
              questionsList?.length > 0 ? questionsList?.map((question) =>{
                return <div  className={`newQABox ${activeQuestion == question.id && 'active'}`} onClick={() => { handleFetchquestionDetails(question.id); setactiveQuestion(question.id) }}>
                  {
                     handleShowSegration(question.to, question.from) && <Row >
                     <Col xs={12} sm={4} className="line-space">
                       <div className="d-flex">
                         {
                           handleShowDelete(question.from, question.userId) && <button
                           type="button"
                           className="btn border-0 p-3 qaDeleteButton"
                           onClick={() => { setShowDeleteQAModal(true); setdeleteId(question.id) }}
                           >
                           <i className="icon-trash del"></i>
                         </button>
                         }
                         
                         <Table borderless>
                           <tbody >
                             <tr >
                               <td>
                                 <strong className="f-size ">To:</strong>
                               </td>
                               <td className="greyText f-size ">{question.queTo.name}</td>
                             </tr>
                             <tr className="">
                               <td>
                                 <strong className="f-size ">From:</strong>
                               </td>
                               <td className="greyText  f-size"  style={{ whiteSpace: 'nowrap' }}>{question.queFrom.name}</td>
                             </tr>
                             <tr>
                               <td>
                                 <strong className="f-size" style={{ whiteSpace: 'nowrap' }}>Q&A #:</strong>
                               </td>
                               <td className="greyText f-size">{question.queNum}</td>
                             </tr>
                             <tr>
                               <td>
                                 <strong className="f-size">By:</strong>
                               </td>
                               <td className="greyText f-size">{question.user.firstName} {question.user.lastName}</td>
                             </tr>
                           </tbody>
                         </Table>
                       </div>
                     </Col>
                     <Col xs={12} sm={6}>
                       <p className="qa__message-lines greyText f-size">
                         <strong className="text-black f-size">Topic:</strong>{question.topic}
                       </p>
                     </Col>
                     <Col xs={12} sm={2} className="">
                       <div className="h-100 d-flex flex-column align-items-end justify-content-between gap-2">
                         <div className="d-flex align-items-center gap-3">
                           {
                             question.isClosed && <div className="priority-badge">
                             <i className="icon-check-circle"></i>
                           </div>
                           }
                           {
                             question.isHighPriority && <div className="priority-badge style-2">
                             <i className="icon-alert-circle"></i>
                           </div>
                           }
                         </div>
                         {
                           question.isNew && <span className="textBadge">New</span>
                         }
                         <div className="newQaDate">Date:{moment(question?.createdAt).format('DD/MM/YYYY')}</div>
                       </div>
                     </Col>
                   </Row>
                  }
                
              </div>
              }):null
            }
            </div>
          </div>
            {
              questionsList?.length > 0 && selectedQuestion?.topic == '' && 
              <Col md={{span:1, order:2}}>
              {/* <div className="vertical-line"></div> */}
              </Col>
            }
          {
            selectedQuestion.topic !== "" ? <div className="sectionQA">
            <div className="newSelectedQAEditBox">
              <div className="d-flex">
              <div className="queHeading">Question No {selectedQuestion.queNum}</div>
              {
               selectedQuestion.isNew && hasSuperAdminPermission && userTeamInfo.userId == selectedQuestion.userId && <i className="icon-edit-2" 
                onClick={() => handleEdit(selectedQuestion)}></i>
              }
              </div>
              <div className="queBody">
                <Row className="gy-3">
                  <Col xs={12}>
                    <div className="d-flex align-items-center gap-3">
                      <strong>Topic / Subject</strong>{selectedQuestion.topic}
                    </div>
                  </Col>
                  <Col xs={12}>
                    <div className="d-flex align-items-center gap-3">
                      <strong>From</strong> {selectedQuestion.queFrom.name} <strong>To</strong>{" "}
                      {selectedQuestion.queTo.name}
                    </div>
                  </Col>
                  <Col xs={12}>
                    <strong>Question</strong>
                    <p>
                      {selectedQuestion.question}
                    </p>
                  </Col>
                  <Col xs={12}>
                    <div className="ansByTag d-flex justify-content-end">
                      Question by {selectedQuestion.user.firstName} {selectedQuestion.user.lastName}
                    </div>
                  </Col>
                  <Col xs={12}>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <div className="form-check style-rounded color-2 mb-0 me-3 d-flex align-items-center">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="highPriority1"
                          checked={selectedQuestion?.isHighPriority}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="highPriority1"
                        >
                          High Priority
                        </label>
                      </div>
                      <span className="attachedDocName">
                        Attached Document:{" "}
                        <a className="text-decoration-underline text-purple">
                          {selectedQuestion?.document?.name}
                        </a>
                      </span>
                    </div>
                  </Col>
                </Row>
              </div>
              {
                selectedQuestion?.answer?.length > 0 ?
                  <div className="currentAns">
                    <strong>Answer</strong>
                    {
                      selectedQuestion.answer?.map((answer) => {
                        return <>
                          <p>
                            {answer.answer}
                          </p>
                          <div className="ansByTag d-flex justify-content-end">
                            Answered by {answer.user.firstName} {answer.user.lastName}
                          </div>
                        </>
                      })
                    }
                  </div> : null
              }
              {
                !selectedQuestion.isClosed && <div className="newAns">
                <div className="currentAns">
                  <strong>Answer</strong>
                  <textarea
                    name=""
                    id=""
                    placeholder="Enter a Answer..."
                    disabled={!hasSuperAdminAndQAPermission}
                    value={answer}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setanswer(e.target.value)}
                  ></textarea>
                  <div className="ansByTag d-flex justify-content-end">
                    Answered by Tushar
                  </div>
                </div>
              </div>
              }
              
              {
                 handleShowDelete(selectedQuestion.from, selectedQuestion.userId) && <div className="check-current">
                 <div className="form-check style-rounded d-flex align-items-center">
                   <input
                     className="form-check-input"
                     type="checkbox"
                     id="name1"
                     checked={selectedQuestion.isClosed}
                     onChange={() => handleCloseThread(selectedQuestion.id)}
                   />
                   <label className="form-check-label" htmlFor="name1">
                     Close thread?
                   </label>
                 </div>
               </div>
              }
              
              <div className="form-action-btns d-flex">
                <button type="button" className="btn btn-outline-secondary" disabled={selectedQuestion.isClosed || !hasSuperAdminAndQAPermission }>
                  Cancel
                </button>
                <button type="button" onClick={() => handleSubmitAnswer(selectedQuestion.id)} disabled={selectedQuestion.isClosed || !hasSuperAdminAndQAPermission} className="btn btn-dark">
                  Submit
                </button>
              </div>
            </div>
          </div>: null
          }
        </div>
      )}

      <Modal
        className="qa-modal align-items-start"
        show={showQAModal}
        onSave={handleAddQuestion}
        onSaveBtnText="Submit"
        onCancel={() => setShowQAModal(false)}
      >
        <Row className="gy-2">
          <Col md={12} lg={12}>
            <div className="form-group m-0">
              <label htmlFor="" className="form-label">
                Topic / Subject
              </label>
              <input
                type="text"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setquestionTopic(e.target.value)
                }
                className="form-control"
                placeholder="Human Resource"
              />
            </div>
          </Col>
          <Col md={12} lg={7}>
            <div className="form-group m-0">
              <label htmlFor="" className="form-label">
                From
              </label>
              <DynamicSelect
                // placeholder="From Team"
                defaultValue={userTeamInfo.teamNo}
                options={teamsList}
                onAddBtnClick={() => [
                  setShowAddCategoryModal(true),
                  setShowDocsModal(false),
                ]}
                onChange={(e) => setselectedTeamFrom(e)}
              />
            </div>
          </Col>
          <Col md={12} lg={7}>
            <div className="form-group m-0">
              <label htmlFor="" className="form-label">
                To
              </label>
              <DynamicSelect
                // placeholder="To Team"
                options={teamsList}
                defaultValue={0}
                onAddBtnClick={() => [
                  setShowAddCategoryModal(true),
                  setShowDocsModal(false),
                ]}
                onChange={(e) => setSelectedTeamto(e)}
              />
            </div>
          </Col>
          <Col md={12} lg={12}>
            <div className="form-group m-0">
              <label htmlFor="" className="form-label">
                Question
              </label>
              <textarea
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setquestion(e.target.value)
                }
                className="form-control"
                rows={5}
                placeholder="Enter a Question..."
              ></textarea>
            </div>
            <div className="form-check style-rounded color-2 mb-0 d-flex align-items-center">
              <input
                className="form-check-input"
                type="checkbox"
                id="name1"
                checked={isHighPriority}
                onChange={() => setisHighPriority((pre) => !pre)}
              />
              <label className="form-check-label" htmlFor="name1">
                High Priority
              </label>
            </div>
          </Col>
          <Col md={12} lg={12}>
            <p style={styleColor}>{selectedDoc}</p>
            <button
              type="button"
              className="btn btn-dark mt-3"
              onClick={() => [setShowDocsModal(true), setShowQAModal(false)]}
            >
              <i className="icon-upload"></i> Upload
            </button>
          </Col>
          {
            uploadDoc && <Col md={12} lg={12}>
            <label htmlFor="" className="form-label">
              Attached Document
            </label>
            <div className="file-upload-box">
              <div className="uploaded__files-list">
                <div>{uploadDoc.name}</div>
              </div>
            </div>
          </Col>
          }
          <Col md={12} lg={6}></Col>
          <Col md={12} lg={6}></Col>
        </Row>
      </Modal>
      <Modal
        className="qa-modal align-items-start"
        show={showQaEdit}
        onSave={handleEditQuestion}
        onSaveBtnText="Submit"
        onCancel={() => setshowQaEdit(false)}
      >
        <h5 className="modal-title text-center">Question No {questionNo}</h5>
        <div className="form-group">
          <label htmlFor="" className="form-label">
            Topic / Subject
          </label>
          <input
            type="text"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setquestionTopic(e.target.value)
            }
            className="form-control"
            placeholder="Human Resource"
            value={questionTopic}
          />
        </div>
        <div className="row g-0">
          <div className="col-sm-7">
            <div className="form-group">
              <label htmlFor="" className="form-label">
                To
              </label>
              <DynamicSelect
                placeholder="To Team"
                options={teamsList}
                defaultValue={selectedTeamto}
                addBtnText="+ New Type"
                onAddBtnClick={() => [
                  setShowAddCategoryModal(true),
                  setShowDocsModal(false),
                ]}
                onChange={(e) => setSelectedTeamto(e)}
              />
            </div>
          </div>
          <div className="col-sm-7">
            <div className="form-group">
              <label htmlFor="" className="form-label">
                From
              </label>
              <DynamicSelect
                placeholder="From Team"
                options={teamsList}
                addBtnText="+ New Type"
                defaultValue={selectedTeamFrom}
                onAddBtnClick={() => [
                  setShowAddCategoryModal(true),
                  setShowDocsModal(false),
                ]}
                onChange={(e) => setselectedTeamFrom(e)}
              />
            </div>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="" className="form-label">
            Question
          </label>
          <textarea
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setquestion(e.target.value)
            }
            className="form-control"
            rows={5}
            value={question}
            placeholder="Enter a Question..."
          ></textarea>
        </div>
        <div className="form-check style-rounded color-2 mb-0 d-flex align-items-center">
          <input
            className="form-check-input"
            type="checkbox"
            id="name1"
            checked={isHighPriority}
            onChange={() => setisHighPriority((pre) => !pre)}
          />
          <label className="form-check-label" htmlFor="name1">
            High Priority
          </label>
        </div>
        <p className="my-1" style={styleColor}>
          {selectedDoc}
        </p>
        <button
          type="button"
          className="btn btn-dark qa-upload-btn"
          onClick={() => [setShowDocsModal(true), setShowQAModal(false)]}
        >
          <i className="icon-upload"></i> Upload
        </button>
      </Modal>
      <Modal
        show={showFolderModal}
        onSave={handleAddNewFolder}
        onSaveBtnText="Save"
        onCancel={() => setShowFolderModal(false)}
      >
        <div className="form-group">
          <label htmlFor="" className="form-label">
            Name of the folder
          </label>
          <input
            type="text"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setfolderName(e.target.value)
            }
            className="form-control"
          />
        </div>
      </Modal>
      <Modal
        show={showAddCategoryModal}
        onSave={handleAddNewCategory}
        onSaveBtnText="Save"
        onCancel={() => setShowAddCategoryModal(false)}
      >
        <div className="form-group">
          <label htmlFor="" className="form-label">
            New Category
          </label>
          <input
            type="text"
            className="form-control"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setcategoryName(e.target.value)
            }
          />
        </div>
      </Modal>
      <Modal
        className="docs-modal align-items-start"
        show={showDocsModal}
        onSave={handleUploadFile}
        onSaveBtnText="Attach files"
        onCancel={() => setShowDocsModal(false)}
      >
        <h5 className="modal-title text-start">Upload and attach files</h5>
        <p className="modal-desc text-start">
          Upload and attach files to this workspace.
        </p>
        <div className="form-group">
          <label htmlFor="" className="form-label">
            Category<span className="text-danger">*</span>
          </label>
          <DynamicSelect
            placeholder="Document Type"
            options={categoryList}
            defaultValue={0}
            addBtnText="+ New Type"
            onAddBtnClick={() => [
              setShowAddCategoryModal(true),
              setShowDocsModal(false),
            ]}
            onChange={(e) => setSelectedUploadCategory(e)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="" className="form-label">
            Folder<span className="text-danger">*</span>
          </label>
          <DynamicSelect
            placeholder="Folder"
            options={folderList}
            addBtnText="+ New Folder"
            defaultValue={0}
            onAddBtnClick={() => [
              setShowFolderModal(true),
              setShowDocsModal(false),
            ]}
            onChange={(e) => setSelectedFolder(e)}
          />
        </div>
        <div className="file-upload-box">
          <div className="file-upload-icon">
            <i className="icon-upload"></i>
            <input
              type="file"
              onChange={handleFileInputChange}
              className="position-absolute"
            />
          </div>
          <p>
            <span>Click to upload</span> 
          </p>
        </div>
        
        {
          selectedDoc && <div className="file-upload-box">
          <div className="uploaded__files-list">
            <div>{selectedDoc}</div>
          </div>
        </div>
        }
        
       
        {uploadProgress != 0 && (
          <div className="file-uploaded-items">
            <div className="file-uploaded-item">
              <div className="d-flex">
                <div className="flex-fill">
                  <span className="file-uploaded-fname">{uploadDoc.name}</span>
                  <span className="file-uploaded-fsize">
                    {convertFileSize(uploadDoc.size)}
                  </span>
                </div>
                <button
                  type="button"
                  className="file-uploaded-fdelete-btn"
                  onClick={() => setUploadProgress(0)}
                >
                  <i className="icon-trash"></i>
                </button>
              </div>
              <div className="file-upload-progress d-flex align-items-center">
                <div className="progress flex-fill">
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{ width: `${uploadProgress}%` }}
                    aria-valuenow={uploadProgress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  ></div>
                </div>
                <span>{uploadProgress}%</span>
              </div>
            </div>
          </div>
        )}
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id="enable"
            onChange={handleDownloadingEnabled}
            checked={isDownloadingEnabled}
          />
          <label className="form-check-label" htmlFor="enable">
            Enable Download
            <span className="d-block">
              Participants will be able to download the file, if disabled they
              will only be able to view it online
            </span>
          </label>
        </div>
        {/* <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id="enable"
            onChange={handleEditableEnabled}
            checked={isEditingEnabled}
          />
          <label className="form-check-label" htmlFor="enable">
            Enable Editing
            <span className="d-block">
              Participants will be able to edit the file, if disabled they will
              only be able to view it online
            </span>
          </label>
        </div> */}
      </Modal>
      <Modal
        className="delete-modal"
        show={showDeleteQAModal}
        onSave={handleDeleteQuestion}
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
      <AlertModal
        setShow={setalertShow}
        show={alertShow}
        msg={message}
        type={typeOfAlert}
      />
    </div>
  );
};

export default Qa;
