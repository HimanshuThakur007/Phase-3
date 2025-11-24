import React, {
  createContext,
  useReducer,
  useContext,
  useEffect,
  ReactNode,
  useState,
} from "react";
import CryptoJS from "crypto-js";
import { decryptCBC, encryptCBC } from "./CryptoUtils";

interface AuthState {
  userData: any;
  decryptedData: Record<string, any>;
  loading: boolean;
}

type AuthAction =
  | { type: "LOGIN_SUCCESS"; payload: any }
  | { type: "LOGOUT" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_DECRYPTED_DATA"; payload: Record<string, any> };

interface AuthContextType {
  state: AuthState;
  url: string;
  port: string;
  actions: {
    loginSuccess: (userData: any) => void;
    logout: () => void;
    setLoading: (loading: boolean) => void;
    setDecryptData: (decryptedData: Record<string, any>) => void;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

const initialState: AuthState = {
  userData: null,
  decryptedData: {},
  loading: false,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return {
        ...state,
        userData: action.payload,
        loading: false,
      };
    case "LOGOUT":
      return {
        ...state,
        userData: null,
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };
    case "SET_DECRYPTED_DATA":
      return {
        ...state,
        decryptedData: action.payload,
      };
    default:
      return state;
  }
};

interface AuthProviderProps {
  children: ReactNode;
}
const SESSION_STORAGE_KEY = "authData";
if (process.env.NODE_ENV === "production") {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
  console.info = () => {};
  console.debug = () => {};
}
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Dynamically construct URL and port from window.location
  const hostname = window.location.hostname;
  const port = hostname === "localhost" ? "" : window.location.port;
  // console.log(port);
  let url: string;
  const secretKey = import.meta.env.VITE_SECRET_KEY ?? "";

  if (hostname === "localhost") {
    url = "http://127.0.0.1:5000";
    // url = "http://bowapi.prjapi.com";
    // url = "http://aqlapi.bowbi.in";
    // url = "http://esapi.bowbi.in";
  } else {
    const subdomain = hostname.split(".")[0];
    const domain = hostname.substring(hostname.indexOf(".") + 1);
    const protocol = window.location.protocol;
    console.log("console.log", subdomain, domain, protocol);
    // url = port
    //   ? `${protocol}//${subdomain}api.${domain}:${port}`
    //   : `${protocol}//${subdomain}api.${domain}`;
    url = "http://127.0.0.1:5000";
  }
  // console.log("console.log==Url", url);
  const [key] = useState(CryptoJS.enc.Utf8.parse(secretKey));
  const [iv] = useState(CryptoJS.lib.WordArray.create());
  const getEncData = JSON.parse(
    sessionStorage.getItem("encryptedData") || "null"
  );
  const storedData = getEncData
    ? JSON.parse(decryptCBC(getEncData, key, iv))
    : null; // Moved here
  // const [decryptionComplete, setDecryptionComplete] = useState(false);

  useEffect(() => {
    if (getEncData) {
      dispatch({ type: "SET_DECRYPTED_DATA", payload: storedData });
      // setDecryptionComplete(true);
    }
  }, [getEncData]);

  const [state, dispatch] = useReducer(authReducer, {
    ...initialState,
    decryptedData: getEncData || initialState.decryptedData,
  });

  useEffect(() => {
    if (getEncData) {
      dispatch({ type: "SET_DECRYPTED_DATA", payload: getEncData });
    }
  }, []);

  const setDecryptData = (decryptedData: Record<string, any>) => {
    dispatch({ type: "SET_DECRYPTED_DATA", payload: decryptedData });
    sessionStorage.setItem(
      SESSION_STORAGE_KEY,
      encryptCBC(JSON.stringify(decryptedData), key, iv)
    );
  };

  const loginSuccess = (userData: any) => {
    dispatch({ type: "LOGIN_SUCCESS", payload: userData });
  };

  const logout = () => {
    dispatch({ type: "LOGOUT" });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: "SET_LOADING", payload: loading });
  };

  const contextValue: AuthContextType = {
    state,
    url,
    port,
    actions: {
      loginSuccess,
      logout,
      setLoading,
      setDecryptData,
    },
  };

  // console.table(contextValue);

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
