import React from 'react';
import uploadIcon from "../assets/img/upload_icon.png";
import addIcon from "../assets/img/add_icon.png";

interface EmptyProps {
  type: string;
  message: string;
  hasButton: boolean;
}

const EmptyDataPlaceholder: React.FC<EmptyProps> = ({ type, message, hasButton }) => {
  return (
    <div className='empty__data--placeholder'>
      <div className='placeholder-image'>
        <img src={type === "uploadData" ? uploadIcon : addIcon} alt="icon" className='img-fluid' />
      </div>
      <p className='fw-bold'>{message ? message : "Upload Data"}</p>
      {hasButton && (
        <button type='button' className='btn btn-dark'><i className="icon-upload"></i> Upload</button>
      )}
    </div>
  );
};

export default EmptyDataPlaceholder;
