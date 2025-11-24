// src/store/dashboardSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  ApiRow,
  BucketDatum,
  WeeklyDatum,
  ScatterDatum,
  TopDatum,
  ApiResponse
} from './types';

// API endpoint
const url =  import.meta.env.VITE_PRO_BASEURL
const API_URL = `${url}/api/hbt-dashboard`;
// const API_URL = 'http://127.0.0.1:5000/api/hbt-dashboard';

// -----------------------------
// FilterValues type (match your hook)
// -----------------------------
export type FilterValues = {
  branches?: any;
  states?: any;
  stockBucket?: any;
  saleBucket?: any;
  transitQty?: any;
  localHbtClass?: any;
  globalHbtClass?: any;
  // allow other arbitrary fields (itemCode, current_date, branchCode string, etc.)
  [k: string]: any;
};

// -----------------------------
// Initial state & types
// -----------------------------
interface DashboardState {
  rows: ApiRow[];
  stockBucketData: BucketDatum[];
  salesBucketData: BucketDatum[];
  spBucketData: any[];
  deptData: BucketDatum[];
  weeklySales: WeeklyDatum[];
  scatterData: ScatterDatum[];
  top5: TopDatum[];
  lowStockItems: Array<{
    item_code: string;
    sub_category?: string;
    current_stk_days?: number;
    min_stock_days?: number;
  }>;
  transit: { total: number; do: number; git: number };
  totals: {
    total_items: number;
    total_stock: number;
    total_sales: number;
    avg_contrib: number;
    total_sale_value?: number;
    total_str_stk_sp_value?: number;
  };
  kpis: {
    excess: number;
    low: number;
    optimal: number;
    avg_stock_days: number;
    avg_daily_sale: number;
  };
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  rows: [],
  stockBucketData: [],
  salesBucketData: [],
  deptData: [],
  weeklySales: [],
  scatterData: [],
  spBucketData: [],
  top5: [],
  lowStockItems: [],
  transit: { total: 0, do: 0, git: 0 },
  totals: { total_items: 0, total_stock: 0, total_sales: 0, avg_contrib: 0, total_sale_value: 0, total_str_stk_sp_value: 0 },
  kpis: { excess: 0, low: 0, optimal: 0, avg_stock_days: 0, avg_daily_sale: 0 },
  loading: false,
  error: null,
};


const buildRequestBody = (filters: Partial<FilterValues> = {}) => {
  const base = {
    limit: 2000,
    offset: 0,
    sample_size: 200,
  };

  return {
    ...base,
    ...(typeof filters.limit !== 'undefined' ? { limit: filters.limit } : {}),
    ...(typeof filters.offset !== 'undefined' ? { offset: filters.offset } : {}),
    ...(typeof filters.sample_size !== 'undefined' ? { sample_size: filters.sample_size } : {}),
    ...filters,
  };
};

// -----------------------------
// Thunk: fetchDashboardData(filters)
// Usage: dispatch(fetchDashboardData(filters))
// If you call with undefined or void, it will send defaults only.
// -----------------------------
export const fetchDashboardData = createAsyncThunk<
  ApiResponse,
  Partial<FilterValues> | void,
  { rejectValue: string }
>(
  'dashboard/fetchData',
  async (filters: any = {}, { rejectWithValue }) => {
    try {
      const body = buildRequestBody(filters);
      console.log('Request body for dashboard fetch:', body);
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        // try to read text for a clearer error if available
        const text = await response.text().catch(() => '');
        throw new Error(`API error ${response.status}${text ? ` - ${text}` : ''}`);
      }

      const data: ApiResponse = await response.json();
      return data;
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Failed to fetch dashboard');
    }
  }
);

// -----------------------------
// Slice
// -----------------------------
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardData: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action: PayloadAction<ApiResponse>) => {
        const data = action.payload;
        state.loading = false;
        state.rows = data.rows ?? [];
        state.stockBucketData = data.stockBucketData ?? [];
        state.salesBucketData = data.salesBucketData ?? [];
        state.spBucketData = data.spBucketData ?? []
        state.deptData = data.deptData ?? [];
        state.weeklySales = data.weeklySales ?? [];
        state.scatterData = data.scatterData ?? [];
        state.top5 = data.top5 ?? [];
        state.lowStockItems = data.lowStockItems ?? [];
        state.transit = {
          total: data.transit?.total ?? 0,
          do: data.transit?.do ?? 0,
          git: data.transit?.git ?? 0,
        };
        state.totals = {
          total_items: data.totals?.total_items ?? 0,
          total_stock: data.totals?.total_stock ?? 0,
          total_sales: data.totals?.total_sales ?? 0,
          avg_contrib: data.totals?.avg_contrib ?? 0,
          total_sale_value: data.totals?.total_sale_value ?? 0,
          total_str_stk_sp_value: data.totals?.total_str_stk_sp_value ?? 0,
        };
        state.kpis = {
          excess: data.kpis?.excess ?? 0,
          low: data.kpis?.low ?? 0,
          optimal: data.kpis?.optimal ?? 0,
          avg_stock_days: data.kpis?.avg_stock_days ?? 0,
          avg_daily_sale: data.kpis?.avg_daily_sale ?? 0,
        };
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || 'Failed to fetch';
      });
  },
});

export const { clearDashboardData } = dashboardSlice.actions;
export default dashboardSlice.reducer;
