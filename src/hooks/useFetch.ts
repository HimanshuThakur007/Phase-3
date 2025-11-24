import axios, { AxiosResponse, AxiosError } from "axios";
import { useCallback } from "react";
import { useAuthContext } from "../common/AuthContext";

// Define interfaces for type safety
interface DecryptedData {
  Token?: string;
}

interface AuthContext {
  url: string;
  port: string | number;
  state: {
    decryptedData: DecryptedData;
  };
}

interface FetchResponse<T = unknown> {
  res: AxiosResponse<T> | null;
  got: T | null;
}

// Define allowed HTTP methods
type HttpMethod = "GET" | "POST";

const useFetch = () => {
  const { url, port, state } = useAuthContext() as AuthContext;
  const { Token } = state.decryptedData;

  const callFetch = useCallback(
    async <T = unknown>(
      endpoint: string,
      method: HttpMethod,
      body?: unknown
    ): Promise<FetchResponse<T>> => {
      // let baseURL = port ? `${myUrl}:${port}` : myUrl;
      const baseURL = url;
      // console.log("url", baseURL);
      const urlStr = `${baseURL}/api/${endpoint}`;
      // console.log("url-str", urlStr);
      // Create headers with conditional Authorization
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (Token) {
        headers["Authorization"] = `Bearer ${Token}`;
      }

      try {
        const config = { headers };
        let response: AxiosResponse<T>;

        if (method === "POST") {
          response = await axios.post<T>(urlStr, body, config);
        } else {
          response = await axios.get<T>(urlStr, config);
        }

        return { res: response, got: response.data };
      } catch (error) {
        const axiosError = error as AxiosError<T>;
        return {
          res: axiosError.response || null,
          got: axiosError.response?.data || null,
        };
      }
    },
    [url, port, Token]
  );

  return callFetch;
};

export default useFetch;
