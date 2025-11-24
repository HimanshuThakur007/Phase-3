import React, { memo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/store";
import ReusableModal from "../component/ReusableModal";
import { closeModal } from "../../redux/modalSlice";

const ModalContainer: React.FC = () => {
  const dispatch = useDispatch();
  const { isOpen, config } = useSelector((state: RootState) => state.modal);

  if (!isOpen || !config) return null;

  return (
    <ReusableModal
      isOpen={isOpen}
      onClose={() => dispatch(closeModal())}
      title={config.title}
      children={config.content}
      footerButtons={config.footerButtons}
      size={config.size || "lg"}
      centered={config.centered ?? true}
      closeButton={config.closeButton ?? true}
      className={config.className}
      backdrop={config.backdrop ?? true}
    />
  );
};

export default memo(ModalContainer);
