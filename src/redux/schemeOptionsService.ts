// src/services/schemeOptionsService.ts
import axios from "axios";

const API_BASE = import.meta.env.VITE_PRO_BASEURL || "";

export const getSchemeTypes = async () => {
  const { data } = await axios.get(`${API_BASE}/api/get-scheme-types`);
  return data?.data ?? data ?? [];          // <-- adjust to your real payload shape
};

export const getSchemeGroups = async (typeId: number) => {
  const { data } = await axios.get(`${API_BASE}/api/get-scheme-groups/${typeId}`);
  return data?.data ?? data ?? [];
};