import React, { useEffect } from "react";
import { Modal } from "react-bootstrap";
import SuccessIcon from "../assets/img/icons/success_modal.svg";
import AlertIcon from "../assets/img/icons/alert_modal.svg";

interface AlertModalProps {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  type: string;
  msg: string;
}

const AlertModal: React.FC<AlertModalProps> = ({ show, setShow, type, msg }) => {
  const SUCCESS_MODAL_TIMEOUT = 1000;

  useEffect(() => {
      const timeoutId = setTimeout(() => {
        setShow(false);
      }, SUCCESS_MODAL_TIMEOUT);

      return () => clearTimeout(timeoutId);
  }, [setShow, type]);
  
  return (
    <Modal className={`centered-${type}`} show={show} onHide={() => setShow(false)}>
      <Modal.Header></Modal.Header>
      <Modal.Body>
        <div className="text-center px-4">
          <div className="modal__has--icon">
            {type === "success" ? (
              <img
                src={SuccessIcon}
                alt="icon"
                className="img-fluid"
              />
            ) : (
              <img
                src={AlertIcon}
                alt="icon"
                className="img-fluid"
              />
            )}
          </div>
          <h5 className="fw-bold mb-2" style={{ fontSize: "18px" }}>
            {msg}
          </h5>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="d-flex align-items-center gap-2 w-100">
          <button
            type="button"
            className="btn btn-outline-secondary w-100"
            onClick={() => setShow(false)}
          >
            Close
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default AlertModal;
