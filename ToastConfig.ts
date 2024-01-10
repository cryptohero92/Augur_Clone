import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

ToastContainer.defaultProps = {
    position: "bottom-right",
    autoClose: 3000,
    hideProgressBar: false,
    newestOnTop: false,
    closeOnClick: true,
    rtl: false,
    pauseOnFocusLoss: true,
    draggable: true,
    pauseOnHover: true,
};

export default ToastContainer;