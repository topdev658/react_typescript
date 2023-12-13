import { useState } from 'react';

interface AddDocumentFolderProps {
  SERVER_BASE_URL: string;
  token: string;
  id: string;
  handleFetchDocumentFolder: () => void;
}

interface UseAddDocumentFolder {
  addDocumentFolder: (
    selectedFolder: string,
    setShowDocsModal: React.Dispatch<React.SetStateAction<boolean>>,
    setShowFolderModal: React.Dispatch<React.SetStateAction<boolean>>,
    handleAlert: (type: string, message: string) => void
  ) => Promise<void>;
}

const useAddDocumentFolder = ({
  SERVER_BASE_URL,
  token,
  id,
  handleFetchDocumentFolder,
}: AddDocumentFolderProps): UseAddDocumentFolder => {
  const addDocumentFolder = async (
    selectedFolder: string,
    setShowDocsModal: React.Dispatch<React.SetStateAction<boolean>>,
    setShowFolderModal: React.Dispatch<React.SetStateAction<boolean>>,
    handleAlert: (type: string, message: string) => void
  ): Promise<void> => {
    setShowFolderModal(false);

    const parameter = {
      name: selectedFolder,
    };

    try {
      const response = await fetch(`${SERVER_BASE_URL}/folders`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
          'workspaceid': `${id}`,
        },
        body: JSON.stringify(parameter),
      });

      const folderData = await response.json();

      if (!response.ok) {
        handleAlert("error", folderData.error);
        console.error("Folder addition failed:", folderData || response);
        return;
      }

      handleAlert("success", "Folder Added Successfully..!");
      handleFetchDocumentFolder();
      setShowDocsModal(true);
    } catch (error) {
      console.error("Error during folder creation:", error);
    }
  };

  return { addDocumentFolder };
};

export default useAddDocumentFolder;
