import { useLocalStorage } from "usehooks-ts";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({children}: any) {
    const [accessToken] = useLocalStorage<string>('accessToken', '')

    if (accessToken != '')
        return children;
    else
        return <Navigate to="/" />;
};