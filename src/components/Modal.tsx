import React, { ReactNode } from "react";

interface ModalProps {
  className?: string;
  show: boolean;
  onSave?: (event: React.FormEvent) => void;
  onSaveBtnText?: string;
  onSaveBtnClassName?: string;
  onCancel?: () => void;
  hideSaveBtn?: boolean;
  children: ReactNode;
  modalRef?:React.RefObject<HTMLDivElement>;
}

const Modal: React.FC<ModalProps> = ({
  className = "",
  show=false,
  onSave,
  onSaveBtnText = "",
  onSaveBtnClassName = "btn-dark",
  onCancel,
  hideSaveBtn = false,
  children,
  modalRef
}) => {
  return (
    <div className={`modal-wrap ${className} ${show ? "active" : ""}`} ref={modalRef}>
      <div className="modal-box">
        <div className="modal-box-con">{children}</div>
        <div className="form-action-btns d-flex">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
          {!hideSaveBtn && (
            <button
              type="button"
              className={`btn ${onSaveBtnClassName}`}
              onClick={onSave}
            >
              {onSaveBtnText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
