import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import Select from "../components/Select"; // Assuming Select component has been typed
import Modal from "../components/Modal";
import { SERVER_BASE_URL } from "../constants/urles";
import { useSelector } from "react-redux";
import moment from 'moment'
import DynamicSelect from "../components/DynamicSelect";
import { useParams } from "react-router-dom";
import AlertModal from "../components/Alert";
import * as FileSaver from 'file-saver';
import JSZip from "jszip";
import EmptyDataPlaceholder from "../components/EmptyDataPlaceholder";
import axios, { AxiosProgressEvent, AxiosResponse } from "axios";
import UseUserTeamInfo from "../components/FetchRoleAndTeam";
import PageLoader from "../components/PageLoader";
import { useDropzone } from "react-dropzone";

interface folderListInterface {
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

interface CategoryInterface {
  name: string;
}

interface User {
  firstName: string;
  lastName: string;
  participates: null | any;
}

interface questionInterface {
  id: number
}

interface Document {
  name: string;
  size: string;
  documentNumber: string;
  dateUploaded: string;
  folderId:number;
  lastUpdated: string;
  question: questionInterface | null;
  category: CategoryInterface | string; // Use union type to allow for both string and CategoryInterface
  uploadedBy: string;
  team: string;
  categoryId: number;
  createdAt: string | number;
  docNum: number;
  file: string;
  id: number;
  updatedAt: string | number;
  user: User;
  isEditable: boolean;
  isDownloadable: boolean;
}


interface MyDocument {
  document: Document[];
  id: number;
  name: string;
  totalSize: number;
  number: number;
}

interface uploadfile {
  name: string;
  size: number;
}
const Documents: React.FC = () => {
  const [uploadfileFolderId, setuploadfileFolderId] = useState<number>(0)
  const [uploadfileCategoryId, setuploadfileCategoryId] = useState<number>(0)
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [deleteShow, setdeleteShow] = useState<boolean>(false)
  const [deleteId, setdeleteId] = useState<number>(0)
  const [uploadProgress, setuploadProgress] = useState<number>(0)
  const [updatedProgress, setupdatedProgress] = useState<number>(0)
  const [folderId, setfolderId] = useState<number>(0)
  const [showDeleteQAModal, setShowDeleteQAModal] = useState<boolean>(false);
  const [category, setcategory] = useState<string>('')
  const [showFolderModal, setShowFolderModal] = useState<boolean>(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState<boolean>(false);
  const [alertShow, setalertShow] = useState<boolean>(false)
  const [message, setmessage] = useState<string>('')
  const [typeOfAlert, settypeOfAlert] = useState<string>('')
  const [showDocsModal, setShowDocsModal] = useState<boolean>(false);
  const [showEditdocModal, setshowEditdocModal] = useState<boolean>(false)
  const [showCheckboxModal, setShowCheckboxModal] = useState<boolean>(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedUpdatedFile, setselectedUpdatedFile] = useState<File | null>(null)
  const [folderList, setfolderList] = useState<folderListInterface[]>([])
  const [categoryList, setcategoryList] = useState<FolderCategoriesInterface[]>([])
  const [documents, setdocuments] = useState<MyDocument[]>([])
  const [selectedDocuments, setSelectedDocuments] = useState<Document[]>([])
  const [editUserId, seteditUserId] = useState<number>(0)
  const [isEditingEnabled, setIsEditingEnabled] = useState<boolean>(true);
  const [updatedFolderShow, setupdatedFolderShow] = useState<boolean>(false)
  const [loading, setloading] = useState<boolean>(true)
  const [updatedFolderName, setupdatedFolderName] = useState<string>('')
  const [isDownloadingEnabled, setisDownloadingEnabled] = useState<boolean>(true)
  const [uploadDoc, setuploadDoc] = useState<uploadfile>({ name: '', size: 0 })
  const params = useParams()
  const modalRef = useRef<HTMLDivElement>(null);
  const handleCheckboxChange = () => {
    setIsEditingEnabled(!isEditingEnabled);
  };

  const handleDownloadingEnabled = () => {
    setisDownloadingEnabled(!isDownloadingEnabled);
  };

  const handleShowEditMdaol = async (document: Document, id: number) => {
    setuploadfileCategoryId(document.categoryId)
    setuploadfileFolderId(id)
    setIsEditingEnabled(document.isEditable)
    setisDownloadingEnabled(document.isDownloadable)
    setdeleteId(document.id)
    // seteditUserId(document.user.)
    setshowEditdocModal(true)
  }

  const handleFilesInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      setSelectedFiles(fileArray);
    }
  };


  const handleDownloadcheckbox = (document: Document) => {
    setSelectedDocuments((prevSelected) => {
      const isSelected = prevSelected.some((selectedDoc) => selectedDoc.id === document.id);

      if (isSelected) {
        // Document is already selected, remove it
        return prevSelected.filter((selectedDoc) => selectedDoc.id !== document.id);
      } else {
        // Document is not selected, add it
        return [...prevSelected, document];
      }
    });
  };



  const { token } = useSelector((state: any) => state.userToken)
  const { userId } = useSelector((state: any) => state.userid)
  const userTeamInfo = UseUserTeamInfo(userId);
  const hasQA = [3].includes(Number(userTeamInfo.roleName))
  const hasDocumentUploadPermission = [1, 2, 3].includes(Number(userTeamInfo.roleName));
  const handleUploadFiles = async (): Promise<void> => {
    try {
      const formData = new FormData();

      formData.append('folderId', String(uploadfileFolderId));
      formData.append('categoryId', String(uploadfileCategoryId));

      // formData.append('file',selectedFiles)
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append('file', selectedFiles[i])
      }
      formData.append('isEditable', isEditingEnabled.toString());
      formData.append('isDownloadable', isDownloadingEnabled.toString());
      interface FormDataObject {
        [key: string]: string;
      }

      // Create an empty object with the defined type
      let formDataObject: FormDataObject = {};

      formData.forEach((value, key) => {
        formDataObject[key] = value.toString();
      });

      let jsonString = JSON.stringify(formDataObject);
      console.log(selectedFiles)
      console.log(jsonString);
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'workspaceid': `${params.id}`,
        },
        onUploadProgress: (progressEvent: any) => {
          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          console.log(`Upload Progress: ${progress}%`);
          setuploadProgress(progress);
        },
      };

      const response = await axios.post(`${SERVER_BASE_URL}/documents`, formData, config);

      if (response.status !== 200) {
        throw new Error(response.data?.error ? response.data?.error : response.data.msg);
      }

      const documentData = response.data;

      console.log(documentData);

      setmessage('Documents Added Successfully..!');
      settypeOfAlert('success');
      setalertShow(true);
      setShowDocsModal(false);
      handleFetchDocuments()
      setuploadProgress(0);
      const inputs = modalRef.current?.querySelectorAll('input');
      const selects = modalRef.current?.querySelectorAll('select');

      inputs?.forEach((input) => {
        input.value = '';
      });

      selects?.forEach((select) => {
        select.value = '';
      });

    } catch (error: any) {
      setuploadProgress(0);
      console.error('Error during documents upload:', error);

      const errorMessage = error.response?.data?.error || error.response?.data?.msg || error?.message;

      setmessage(errorMessage);
      settypeOfAlert('error');
      setalertShow(true);
      setShowDocsModal(false);
    }
  };


  const handleEditDoc = async (): Promise<void> => {
    try {
      const formData = new FormData();
      console.log(selectedFiles)
      formData.append('folderId', String(uploadfileFolderId));
      formData.append('categoryId', String(uploadfileCategoryId));
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append('file', selectedFiles[i])
      }
      formData.append('isEditable', isEditingEnabled.toString())
      formData.append("isDownloadable", isDownloadingEnabled.toString())

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'workspaceid': `${params.id}`,
        },
        onUploadProgress: (progressEvent: any) => {
          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          console.log(`Upload Progress: ${progress}%`);
          setupdatedProgress(progress);
        },
      };

      const response = await axios.put(`${SERVER_BASE_URL}/documents/${deleteId}`, formData, config);

      if (response.status !== 200) {
        throw new Error(response.data?.error);
      }

      const documentData = response.data;

      console.log(documentData);

      setmessage('Documents Updated Successfully..!');
      settypeOfAlert('success');
      setalertShow(true);
      setshowEditdocModal(false);
      setupdatedProgress(0);
      setuploadDoc({ name: "", size: 0 })
      handleFetchDocuments()
    } catch (error: any) {
      setupdatedProgress(0);
      console.error('Error during documents upload:', error);

      const errorMessage = error.response?.data?.error || error.message;

      setmessage(errorMessage);
      settypeOfAlert('error');
      setalertShow(true);
      setshowEditdocModal(false);
    }
  }

  const handleAddDocumentFolder = async (): Promise<void> => {
    setShowFolderModal(false)
    const parameter = {
      name: selectedFolder,
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
        settypeOfAlert("error")
        setmessage(folderData.error)
        setalertShow(true)
        console.error("Login failed:", folderData || response);
        return;
      }
      settypeOfAlert("success")
      setmessage("Folder Added Successfully..!")
      setalertShow(true)
      handleFetchDocumentFolder()
    } catch (error) {
      console.error("Error during folder Create:", error);
    }
  }

  const handleCategory = async (): Promise<void> => {
    const parameter = {
      name: category,
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
      setmessage("Category Added Successfully..!");
      setalertShow(true)
      setShowAddCategoryModal(false)
      handleFetchDocumentCategory()
    } catch (error) {
      console.error("Error during folder Create:", error);
    }
  }

  const handleDeleteDocument = async (): Promise<void> => {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/documents/${deleteId}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
          'workspaceid': `${params.id}`,
        },
      });

      const documentData = await response.json();
      if (!response.ok) {
        settypeOfAlert('error')
        setmessage(documentData.error);
        setalertShow(true)
        setShowDeleteQAModal(false)
        return;
      }
      settypeOfAlert('success')
      setmessage("Document Deleted Successfully..!");
      setalertShow(true)
      handleFetchDocuments()
      setShowDeleteQAModal(false)
    } catch (error) {
      console.error("Error during folder Create:", error);
    }
  }

  const handleDeleteDocumentfolder = async (): Promise<void> => {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/folders/${folderId}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
          'workspaceid': `${params.id}`,
        },
      });

      const documentData = await response.json();
      if (!response.ok) {
        settypeOfAlert('error')
        setmessage(documentData.error);
        setalertShow(true)
        setdeleteShow(false)
        return;
      }
      settypeOfAlert('success')
      setmessage("Folder Deleted Successfully..!");
      setalertShow(true)
      handleFetchDocuments()
      setdeleteShow(false)
    } catch (error) {
      console.error("Error during folder Create:", error);
    }
  }

  const handleFetchDocumentFolder = async (): Promise<void> => {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/folders`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
          'workspaceid': `${params.id}`,
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

  const handleFetchDocuments = async (): Promise<void> => {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/documents`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
          'workspaceid': `${params.id}`,
        }
      });

      const folderData = await response.json();
      if (!response.ok) {
        setloading(false)
        console.error("Login failed:", folderData || response);
        return;
      }
      setdocuments(folderData?.data)
      setloading(false)
    } catch (error) {
      setloading(false)
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
          'workspaceid': `${params.id}`,
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
  const handleUpdatedDocumentFolder = async (): Promise<void> => {
    try {
      const parameter = {
        name: updatedFolderName,
      }
      const response = await fetch(`${SERVER_BASE_URL}/folders/${folderId}`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
          'workspaceid': `${params.id}`,
        },
        body: JSON.stringify(parameter),
      });

      const folderData = await response.json();
      if (!response.ok) {
        settypeOfAlert('error')
        setmessage(folderData?.error);
        setalertShow(true)
        setupdatedFolderShow(false)
        return;
      }
      settypeOfAlert('success')
      setmessage("Folder Updated Successfully..!");
      setalertShow(true)
      setupdatedFolderShow(false)
      handleFetchDocuments()
    } catch (error) {
      console.log(error)
    }
  }
const downloadFile = (fileUrl: string, name: string) => {
  const link = document.createElement('a');
  link.href = fileUrl;

  // Set the Content-Disposition header to suggest a filename for the browser
  // and indicate that it should be treated as an attachment.
  link.setAttribute('download', name);

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

  const getCategoryNameById = (categoryId:number) => {
    const category = folderList.find((cat:folderListInterface) => cat.id === categoryId);
    return category ? category.name : 'Unknown Category';
  };
  const handleDownloadAll = () => {
    // Filter selected documents based on the isDownload key
    const downloadableDocuments = selectedDocuments?.filter(document => document.isDownloadable);
  
    if (downloadableDocuments.length <= 0) {
      setShowCheckboxModal(true);
      return;
    }
  
    const zip = new JSZip();
  
    // Organize documents into folders based on categories
    const categoriesMap = new Map<string, JSZip>();
    
    downloadableDocuments.forEach((document) => {
      const category =  getCategoryNameById(document.folderId);
      
      // Create a folder for the category if not exists
      const categoryFolder = categoriesMap.get(category) || zip.folder(category) || zip;
      const content = document.file;
  
      // Add file to the category folder
      categoryFolder.file(document.name, content);
      
      // Update the map with the latest category folder
      categoriesMap.set(category, categoryFolder);
    });
  
    // Generate the zip file
    zip.generateAsync({ type: 'blob' }).then((blob) => {
      FileSaver.saveAs(blob, `downloadableDocuments.zip`);
    });
  };
  

  const handleFolderDocuments = (documents: Document[], name: string) => {
    // Filter documents based on the isDownload key
    const downloadableDocuments = documents?.filter(document => document.isDownloadable);
  
    if (downloadableDocuments.length <= 0) {
      setmessage("The folder is empty; there are no downloadable documents.")
      settypeOfAlert("error")
      setalertShow(true)
      return;
    }
  
    const zip = new JSZip();
  
    downloadableDocuments.forEach((document) => {
      const content = document.file;
      zip.file(`${document.name}.txt`, content);
    });
  
    // Generate the zip file
    zip.generateAsync({ type: 'blob' }).then((blob) => {
      FileSaver.saveAs(blob, `${name}.zip`);
    });
  };
  

  const hadleRemove = () => {
    setuploadProgress(0)
    setuploadDoc({ name: '', size: 0 })
    setSelectedFiles([])
    setselectedUpdatedFile(null)
    setupdatedProgress(0)
  }
  const convertFileSize = (fileSizeInBytes: number): string => {
    const kilobyte = 1024; // 1 kilobyte = 1024 bytes

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





  const filteredDocuments = documents?.filter((folder) =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (folder.document && folder.document.some(doc => doc.name.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const handleSelectFolderDoucument = (folderDocuments: Document[]) => {
    setSelectedDocuments((prevSelected) => {
      const newDocuments = folderDocuments.filter(
        (document) => !prevSelected.some((selectedDoc) => selectedDoc.id === document.id)
      );

      const updatedSelection = prevSelected.filter(
        (selectedDoc) => !folderDocuments.some((document) => document.id === selectedDoc.id)
      );

      return [...updatedSelection, ...newDocuments];
    });
  };



  useEffect(() => {
    handleFetchDocumentCategory()
    handleFetchDocumentFolder()
    handleFetchDocuments()
  }, [])

  return (
    <>
      <Navbar />
      <div className="top-action-bar d-flex flex-wrap">
        <div className="flex-fill d-flex flex-wrap justify-content-center justify-content-sm-start">
          {
            hasDocumentUploadPermission && <button
              type="button"
              className="btn btn-dark"
              onClick={() => setShowDocsModal(true)}
            >
              <i className="icon-upload"></i> Upload
            </button>
          }
          {
            hasDocumentUploadPermission && <button type="button" className="btn btn-secondary" onClick={handleDownloadAll}>
              Download All
            </button>
          }
          {
            hasDocumentUploadPermission && <button
              type="button"
              className="btn btn-dark"
              onClick={() => setShowFolderModal(true)}
            >
              New Folder
            </button>
          }
        </div>
        <div className="top-action-bar-search">
          <input type="text" className="form-control" onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)} placeholder="Search" />
        </div>
      </div>
      {
        loading ? <PageLoader /> : <div className="inner-scroller">
          <div className="table-responsive">
            {
              filteredDocuments?.length > 0 ? <table className="documents-table table">
                <thead>
                  <tr>
                    <th>
                      <div className="form-check d-flex align-items-center mb-0">
                        <label className="form-check-label" htmlFor="name1">
                          Name
                        </label>
                      </div>
                    </th>
                    <th>Size</th>
                    <th>Document #</th>
                    <th>Date uploaded</th>
                    <th>Last updated</th>
                    <th>Question No</th>
                    <th>Category</th>
                    <th>Uploaded / Created by</th>
                    <th>Team</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                {
                  filteredDocuments?.length > 0 && filteredDocuments?.map((folder, folderIndex) => (
                    <tbody>
                      <tr className="with-folder">
                        <td>
                          <div className="d-flex align-items-center">
                            <i className="icon-folder"></i>
                            <div className="form-check d-flex align-items-center mb-0">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="name2"
                                onChange={() => handleSelectFolderDoucument(folder?.document || [])}
                              />
                              <label
                                className="form-check-label text-black text-decoration-underline"
                                htmlFor="name2"
                              >
                                {folder?.name}
                              </label>
                            </div>
                          </div>
                        </td>
                        <td>{convertFileSize(folder.totalSize)}</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td className="text-start">
                          {
                            hasDocumentUploadPermission  && <button
                              type="button"
                              className="td-icon-btn"
                              onClick={() => handleFolderDocuments(folder.document, folder.name)}
                            >
                              <i className="icon-download"></i>
                            </button>
                          }
                          {
                            hasDocumentUploadPermission && <button type="button" className="td-icon-btn" onClick={() => { setfolderId(folder.id); setdeleteShow(true) }}>
                              <i className="icon-trash"></i>
                            </button>
                          }
                          {
                            hasDocumentUploadPermission && <button type="button" className="td-icon-btn" onClick={() => { setupdatedFolderName(folder.name); setupdatedFolderShow(true); setfolderId(folder.id) }}>
                              <i className="icon-edit"></i>
                            </button>
                          }
                        </td>
                      </tr>
                      {
                        folder?.document?.length > 0 && folder?.document?.map((document, index) => (
                          <tr className="folder-stage-1">
                            <td>
                              <div className="form-check d-flex align-items-center mb-0">
                               {
                                document.isDownloadable &&  <input
                                className="form-check-input"
                                type="checkbox"
                                id={`documentCheckbox-${document.id}`}
                                checked={typeof document.id === "number" ? selectedDocuments.some((doc) => doc.id === document.id) : false}
                                onChange={() => handleDownloadcheckbox(document)}
                              />
                               }
                                <label
                                  className="form-check-label text-black text-decoration-underline"
                                  htmlFor="name3"
                                >
                                  {document?.name}
                                </label>
                              </div>
                            </td>
                            <td>{convertFileSize(parseInt(document.size))}</td>
                            <td>{document?.docNum}</td>
                            <td className="text-black">{moment(document.createdAt).format('MMMM D, YYYY')}</td>
                            <td>{moment(document.updatedAt).format('MMMM D, YYYY')}</td>
                            <td>{document?.question?.id}</td>
                            <td className="text-black">
                              {typeof document.category === 'string' ? document.category : document.category?.name}
                            </td>
                            <td>{document?.user.firstName} {document?.user.lastName}</td>
                            <td>{document?.user.participates.teams.name}</td>
                            <td className="text-start">
                              {
                                hasDocumentUploadPermission && document.isDownloadable && <button
                                  type="button"
                                  className="td-icon-btn"
                                  onClick={() => downloadFile(document.file, document.name)}
                                // onClick={() => setShowCheckboxModal(true)}
                                disabled={!document.isDownloadable}
                                >
                                  <i className="icon-download"></i>
                                </button>
                              }
                              {
                                hasDocumentUploadPermission && <button type="button" className="td-icon-btn" onClick={() => { setShowDeleteQAModal(true); setdeleteId(document.id) }}>
                                  <i className="icon-trash"></i>
                                </button>
                              }
                              {
                                 hasDocumentUploadPermission &&  <button type="button" disabled={!document.isEditable} className="td-icon-btn" onClick={() => handleShowEditMdaol(document, folder.id)}>
                                  <i className="icon-edit"></i>
                                </button>
                              }
                            </td>
                          </tr>
                        ))
                      }

                    </tbody>
                  ))
                }

              </table> : <EmptyDataPlaceholder
                type="uploadData"
                message="Start by uploading a file or create folder"
                hasButton={true}
              />
            }
          </div>
        </div>
      }

      

      <Modal
        show={showFolderModal}
        onSave={handleAddDocumentFolder}
        onSaveBtnText="Save"
        onCancel={() => setShowFolderModal(false)}
      >
        <div className="form-group">
          <label htmlFor="" className="form-label">
            Name of the folder
          </label><input
            type="text"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedFolder(e.target.value)}
            className="form-control"
          />
        </div>
      </Modal>

      <Modal
        show={updatedFolderShow}
        onSave={handleUpdatedDocumentFolder}
        onSaveBtnText="Save"
        onCancel={() => setupdatedFolderShow(false)}
      >
        <div className="form-group">
          <label htmlFor="" className="form-label">
            Name of the folder
          </label>
          <input
            type="text"
            value={updatedFolderName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setupdatedFolderName(e.target.value)}
            className="form-control"
          />
        </div>
      </Modal>
      <Modal
        show={showAddCategoryModal}
        onSave={handleCategory}
        onSaveBtnText="Save"
        onCancel={() => setShowAddCategoryModal(false)}
      >
        <div className="form-group">
          <label htmlFor="" className="form-label">
            New Category
          </label>
          <input type="text" placeholder="New Category" onChange={(e: ChangeEvent<HTMLInputElement>) => setcategory(e.target.value)} className="form-control" />
        </div>
      </Modal>
      <Modal
        className="docs-modal align-items-start"
        show={showDocsModal}
        onSave={handleUploadFiles}
        onSaveBtnText="Attach files"
        onCancel={() => setShowDocsModal(false)}
        modalRef={modalRef}
      >
        <h5 className="modal-title text-center">Upload and attach files</h5>
        <p className="modal-desc text-center">
          Upload and attach files to this workspace.
        </p>
        <div className="form-group">
          <label htmlFor="" className="form-label">
            Document Type<span className="text-danger">*</span>
          </label>
          <DynamicSelect
            placeholder="Document Type"
            options={categoryList}
            addBtnText="+ New Category"
            defaultValue={uploadfileCategoryId}
            onAddBtnClick={() => [
              setShowAddCategoryModal(true),
              setShowDocsModal(false),
            ]}
            onChange={(e) => setuploadfileCategoryId(e)}
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
            defaultValue={uploadfileFolderId}
            onAddBtnClick={() => [
              setShowFolderModal(true),
              setShowDocsModal(false),
            ]}
            onChange={(e) => setuploadfileFolderId(e)}
          />
        </div>
        <div className="file-upload-box">
          <div className="file-upload-icon position-absolute">
            <i className="icon-upload"></i>
            <input
              type="file"
              multiple
              className="position-absolute"
              onChange={handleFilesInputChange}
            />

          </div>
          <div  className="drag-drop-area">
          <p>files here or click to select</p>
      </div>
        </div>
        {
          selectedFiles.length > 0 && 
            selectedFiles?.map((file) =>{
              return  <div className="file-upload-box"><div className="uploaded__files-list">
            <div>{file.name}</div>
          </div>
          </div>})
        }
        {
          uploadProgress != 0 &&
          <div className="file-uploaded-items">
            <div className="file-uploaded-item">
              <div className="d-flex">
            
                <div className="flex-fill">
                 {
                  selectedFiles?.map((item,index) =>{
                    return  <span className="file-uploaded-fname">
                    {item.name}
                  </span>
                  })
                 }
                  <span className="file-uploaded-fsize">{convertFileSize(selectedFiles.reduce((acc, file) => acc + file.size, 0))}</span>
                </div>
                <button type="button" className="file-uploaded-fdelete-btn" onClick={hadleRemove}>
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
        }
        
        {/* <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id="enable"
            disabled={hasQA}
            checked={isEditingEnabled}
            onChange={handleCheckboxChange}
          />
          <label className="form-check-label" htmlFor="enable">
            Enable Editing
            <span className="d-block">
              Participants will be able to {isEditingEnabled ? "edit" : "view"} the file.
            </span>
          </label>
        </div> */}
      </Modal>
      <Modal
        className="docs-modal align-items-start"
        show={showEditdocModal}
        onSave={handleEditDoc}
        onSaveBtnText="Save"
        onCancel={() => setshowEditdocModal(false)}
      >
        <h5 className="modal-title text-center">Upload and attach files</h5>
        <p className="modal-desc text-center">
          Upload and attach files to this workspace.
        </p>
        <div className="form-group">
          <label htmlFor="" className="form-label">
            Document Type<span className="text-danger">*</span>
          </label>
          <DynamicSelect
            placeholder="Document Type"
            options={categoryList}
            addBtnText="+ New Type"
            defaultValue={uploadfileCategoryId}
            onAddBtnClick={() => [
              setShowAddCategoryModal(true),
              setShowDocsModal(false),
            ]}
            onChange={(e) => setuploadfileCategoryId(e)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="" className="form-label">
            Folder<span className="text-danger">*</span>
          </label>
          <DynamicSelect
            placeholder="Folder"
            options={folderList}
            defaultValue={uploadfileFolderId}
            addBtnText="+ New Folder"
            onAddBtnClick={() => [
              setShowFolderModal(true),
              setShowDocsModal(false),
            ]}
            onChange={(e) => setuploadfileFolderId(e)}
          />
        </div>
        <div className="file-upload-box">
          <div className="file-upload-icon">
            <i className="icon-upload"></i>
            <input
              type="file"
              onChange={handleFilesInputChange}
              className="position-absolute"
            />
          </div>
          <p>
            <span>Click to upload</span>
          </p>
        </div>

        {
          uploadProgress != 0 &&
          <div className="file-uploaded-items">
            <div className="file-uploaded-item">
              <div className="d-flex">
                <div className="flex-fill">
                  <span className="file-uploaded-fname">
                    {uploadDoc.name}
                  </span>
                  <span className="file-uploaded-fsize">{convertFileSize(uploadDoc.size)}</span>
                </div>
                <button type="button" className="file-uploaded-fdelete-btn" onClick={hadleRemove}>
                  <i className="icon-trash"></i>
                </button>
              </div>
              <div className="file-upload-progress d-flex align-items-center">
                <div className="progress flex-fill">
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{ width: `${updatedProgress}%` }}
                    aria-valuenow={updatedProgress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  ></div>
                </div>
                <span>{uploadProgress}%</span>
              </div>
            </div>
          </div>
        }
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id="enable"
            checked={isDownloadingEnabled}
            onChange={handleDownloadingEnabled}
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
            checked={isEditingEnabled}
            onChange={handleCheckboxChange}
          />
          <label className="form-check-label" htmlFor="enable">
            Enable Editing
            <span className="d-block">
              Participants will be able to {isEditingEnabled ? "edit" : "view"} the file.
            </span>
          </label>
        </div> */}
      </Modal>
      <Modal
        className="warning-modal"
        show={showCheckboxModal}
        hideSaveBtn={true}
        onCancel={() => setShowCheckboxModal(false)}

      >
        <div className="modal-icon">
          <i className="icon-alert-circle"></i>
        </div>
        <h6 className="modal-title">Please select checkbox!</h6>
        <p className="modal-description text-center">
          Please select the documents you would like to download.
        </p>
      </Modal>

      <Modal
        className="delete-modal"
        show={deleteShow}
        onSave={handleDeleteDocumentfolder}
        onSaveBtnText="Remove"
        onSaveBtnClassName="btn-danger"
        onCancel={() => setdeleteShow(false)}
      >
        <div className="modal-icon">
          <i className="icon-alert-circle"></i>
        </div>
        <h6 className="modal-title">
          Delete{" "}
          <a href="#" className="text-dark text-decoration-underline">
            Folder
          </a>
          ?
        </h6>
        <p className="modal-description text-center">
          Are you sure you want to delete the Folder? This action cannot be
          undone.
        </p>
      </Modal>
      <Modal
        className="delete-modal"
        show={showDeleteQAModal}
        onSave={handleDeleteDocument}
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
            Document 
          </a>
          ?
        </h6>
        <p className="modal-description text-center">
          Are you sure you want to delete the Document? This action cannot be
          undone.
        </p>
      </Modal>
      <AlertModal setShow={setalertShow} show={alertShow} msg={message} type={typeOfAlert} />
    </>
  );
};

export default Documents;
