import React, { ReactNode, memo } from "react";
import { Modal, Button } from "react-bootstrap";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footerButtons?: Array<{
    label: string;
    variant?: string;
    onClick: () => void;
    disabled?: boolean;
  }>;
  size?: "sm" | "lg" | "xl";
  centered?: boolean;
  closeButton?: boolean;
  className?: string;
  backdrop?: boolean | "static";
}

const ReusableModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footerButtons = [],
  size = "lg",
  centered = true,
  closeButton = true,
  className = "",
  backdrop = true,
}) => {
  return (
    <Modal
      show={isOpen}
      onHide={onClose}
      size={size}
      centered={centered}
      backdrop={backdrop}
      className={className}
      aria-labelledby="reusable-modal-title"
    >
      {title && (
        <Modal.Header closeButton={closeButton}>
          <Modal.Title
            id="reusable-modal-title"
            style={{ textAlign: "center", width: "100%" }}
          >
            {title}
          </Modal.Title>
        </Modal.Header>
      )}
      <Modal.Body>{children}</Modal.Body>
      {footerButtons.length > 0 && (
        <Modal.Footer>
          {footerButtons.map((button, index) => (
            <Button
              key={index}
              variant={button.variant || "primary"}
              onClick={button.onClick}
              disabled={button.disabled}
            >
              {button.label}
            </Button>
          ))}
        </Modal.Footer>
      )}
    </Modal>
  );
};

export default memo(ReusableModal);
