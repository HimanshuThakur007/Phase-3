import { memo } from "react";
import { Toaster, toast, ToastPosition } from "react-hot-toast";

// Reusable Toast Component
interface ToastProps {
  position?: ToastPosition;
  reverseOrder?: boolean;
}

const Toast = ({
  position = "top-center",
  reverseOrder = false,
}: ToastProps) => {
  return <Toaster position={position} reverseOrder={reverseOrder} />;
};
export default memo(Toast);

export const showSuccessToast = (message: string): void => {
  toast.success(message);
};

export const showErrorToast = (message: string): void => {
  toast.error(message);
};

export const showInfoToast = (message: string): void => {
  toast(message);
};

export const showLoadingToast = (message: string): string => {
  return toast.loading(message);
};

export const dismissToast = (toastId: string): void => {
  toast.dismiss(toastId);
};
