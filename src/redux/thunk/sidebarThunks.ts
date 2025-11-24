// src/hooks/useFetchNavigationData.ts
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { setError, setLoading, setNavigationData } from '../sidebarSlice';
import axios from 'axios';

interface MenuItem {
  MenuID: number;
  Name: string;
  RepID: string;
  ParentId: number;
  Link: string;
  Icon: string;
  TranType: number;
  SubmenuItems: MenuItem[];
}

interface ApiResponse {
  Data: MenuItem[];
}

export const useFetchNavigationData = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { auth, sidebar } = useSelector((state: RootState) => state);
  const { decryptedData } = auth || {};
  const { navigationData } = sidebar || {};

  useEffect(() => {
    const fetchData = async () => {
      // Skip fetch if navigationData is already populated
      if (navigationData?.length > 0) {
        return;
      }

      if (!decryptedData?.ID || decryptedData?.IsSuperUser === undefined || !decryptedData?.CompCode) {
        dispatch(setError('Missing authentication data'));
        return;
      }

      const { ID, IsSuperUser, CompCode } = decryptedData;

      dispatch(setLoading(true));
      try {
        const endpoint = `Report/GetUserMenus?UserID=${ID}&IsSuperUser=${IsSuperUser}&CompCode=${CompCode}`;
        const response = await axios.get<ApiResponse>(endpoint);

        if (response.status === 200 && response.data?.Data) {
          dispatch(setNavigationData(response.data.Data));
        } else {
          dispatch(setError('No data received from API'));
        }
      } catch (error) {
        dispatch(
          setError(`Failed to fetch navigation data: ${error instanceof Error ? error.message : 'Unknown error'}`),
        );
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchData();
  }, [dispatch, decryptedData, navigationData?.length]);
};