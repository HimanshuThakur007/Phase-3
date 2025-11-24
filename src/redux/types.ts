// Types (only fields used)
export interface ApiRow {
    Item_Code: string;
    item_department?: string | null;
    item_sub_category?: string | null;
    branch_name?: string | null;
    Store_Size?: string | null;
    Total_Stock?: number | null;
    Total_Sale_Qty?: number | null;
    Sale_Qty_Week1?: number | null;
    Sale_Qty_Week2?: number | null;
    Sale_Qty_Week3?: number | null;
    Sale_Qty_Week4?: number | null;
    Sale_Qty_Week5?: number | null;
    Sale_Qty_Week6?: number | null;
    Sale_Qty_Week7?: number | null;
    Sale_Qty_Week8?: number | null;
    Sale_Qty_Week9?: number | null;
    Global_Contribution_Percentage?: number | string | null;
    REMARKS?: string | null;
    Current_stk_days?: number | string | null;
    min_stock_days?: number | string | null;
    Stock_Bucket?: string | null;
    Sales_Bucket?: string | null;
    Total_Transit_Qtys?: number | null;
    DO_Transit_Qtys?: number | null;
    GIT_Transit_Qtys?: number | null;
    Avg_30_days_sale_qty?: number | string | null;
}

export interface BucketDatum { name: string; value: number; }
export interface WeeklyDatum { week: string; qty: number; }
export interface ScatterDatum { name: string; stock: number; sales: number; contrib: number; }
export interface TopDatum { code: string; contrib: number | string; }

export interface ApiResponse {
    status: string;
    summary_date?: string;
    applied_filters?: Record<string, any>;
    totals?: {
        total_items?: number;
        total_stock?: number;
        total_sales?: number;
        avg_contrib?: number;
        total_sale_value?: number;
        total_str_stk_sp_value?: number;
    };
    kpis?: {
        excess?: number;
        low?: number;
        optimal?: number;
        avg_stock_days?: number;
        avg_daily_sale?: number;
    };
    stockBucketData?: BucketDatum[];
    salesBucketData?: BucketDatum[];
    spBucketData?: any[];
    deptData?: BucketDatum[];
    weeklySales?: WeeklyDatum[];
    scatterData?: ScatterDatum[];
    top5?: TopDatum[];
    lowStockItems?: Array<{ item_code: string; sub_category?: string; current_stk_days?: number; min_stock_days?: number }>;
    transit?: { total?: number; do?: number; git?: number };
    rows?: ApiRow[];
}