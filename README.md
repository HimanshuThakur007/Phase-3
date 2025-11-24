# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```




@hbt_master_data_bp.route("/get-hbtsync-data", methods=["POST"])
def get_hbtsync_data():
    """
    Streams HBT_Master_Data rows joined with Item and BranchMaster for the current server date only.
    Supports filters:
      - branchCode
      - state
      - department
      - itemCode
      - Local_HBT, Global_HBT, Stock_Bucket, Sales_Bucket, Transit_Qty
    Applied filters are echoed in X-Applied-Filters header.
    """
    CHUNK_SIZE = 1000
    body = request.get_json(silent=True) or {}

    # Client filters
    raw_branch_input = body.get("branchCode")
    raw_state_input = body.get("state")
    input_department = body.get("department")
    input_item_code = body.get("itemCode")
    raw_local_hbt = body.get("Local_HBT")
    raw_global_hbt = body.get("Global_HBT")
    raw_stock_bucket = body.get("Stock_Bucket")
    raw_sales_bucket = body.get("Sales_Bucket")
    raw_transit_qty = body.get("Transit_Qty")

    # Always use today's date
    summary_date = date.today()
    start_dt = datetime.combine(summary_date, time.min)
    end_dt = start_dt + timedelta(days=1)

    # Normalize filters
    branch_codes, orig_branch_code_input = normalize_list_input(raw_branch_input)
    states, orig_state_input = normalize_list_input(raw_state_input)
    local_hbts, orig_local_hbt_input = normalize_list_input(raw_local_hbt)
    global_hbts, orig_global_hbt_input = normalize_list_input(raw_global_hbt)
    stock_buckets, orig_stock_bucket_input = normalize_list_input(raw_stock_bucket)
    sales_buckets, orig_sales_bucket_input = normalize_list_input(raw_sales_bucket)
    transit_qtys, orig_transit_qty_input = normalize_list_input(raw_transit_qty)

    try:
        q = db.session.query(
            HBT_Master_Data,
            Item,
            BranchMaster
        ).outerjoin(
            Item, func.lower(HBT_Master_Data.Item_Code) == func.lower(Item.item_code)
        ).outerjoin(
            BranchMaster, BranchMaster.branchCode == HBT_Master_Data.Branch_Code
        ).filter(
            HBT_Master_Data.process_date >= start_dt,
            HBT_Master_Data.process_date < end_dt
        ).enable_eagerloads(False)

        # --- Filters ---
        if branch_codes:
            branch_codes_str = [str(x).strip() for x in branch_codes if str(x).strip()]
            q = q.filter(func.trim(cast(HBT_Master_Data.Branch_Code, String)).in_(branch_codes_str))

        if input_department:
            q = q.filter(Item.department == input_department)

        if states:
            lower_states = [s.lower() for s in states]
            q = q.filter(func.lower(func.coalesce(BranchMaster.state, "")).in_(lower_states))

        if local_hbts:
            q = q.filter(HBT_Master_Data.Local_HBT_Class.in_(local_hbts))
        if global_hbts:
            q = q.filter(HBT_Master_Data.Global_HBT_Class.in_(global_hbts))
        if stock_buckets:
            q = q.filter(HBT_Master_Data.Stock_Bucket.in_(stock_buckets))
        if sales_buckets:
            q = q.filter(HBT_Master_Data.Sales_Bucket.in_(sales_buckets))
        if transit_qtys:
            transit_strs = [str(x).strip() for x in transit_qtys if str(x).strip()]
            q = q.filter(func.trim(cast(HBT_Master_Data.Total_Transit_Qtys, String)).in_(transit_strs))

        if input_item_code:
            q = q.filter(func.lower(HBT_Master_Data.Item_Code) == func.lower(input_item_code))
            q = q.order_by(HBT_Master_Data.Branch_Code, HBT_Master_Data.Item_Code)
        else:
            q = q.order_by(HBT_Master_Data.Branch_Code)

        q = q.yield_per(CHUNK_SIZE)

        # --- Convert row to dict (exact key names) ---
        def row_to_dict(hbt, item, branch):
            def _get(obj, attr, default=None):
                return getattr(obj, attr, default) if obj is not None else default

            department = _get(item, "department", None) or _get(hbt, "item_department", None)

            return {
                "Branch_Name": _get(branch, "branchName", None),
                "Branch_Code": _get(hbt, "Branch_Code", None) or _get(branch, "branchCode", None),
                "Item_Code": _get(hbt, "Item_Code", None),
                "Department": department,
                "Site_Qtys": _get(hbt, "Site_Qtys", None),
                "Total_Sale_Qty": _get(hbt, "Total_Sale_Qty", None),
                "Total_Sale_Val": _get(hbt, "Total_Sale_Val", None),
                "Local_HBT_Class": _get(hbt, "Local_HBT_Class", None),
                "Global_HBT_Class": _get(hbt, "Global_HBT_Class", None),
                "Stock_Remarks": _get(hbt, "Stock_Remarks", None),
                "Stock_Days_Diff": _get(hbt, "Stock_Days_Diff", None),
                "Stock_Bucket": _get(hbt, "Stock_Bucket", None),
                "Sales_Bucket": _get(hbt, "Sales_Bucket", None),
                "Str_Stk_Sp_Value": _get(hbt, "Str_Stk_Sp_Value", None),
                "Tax_Per_Qty": _get(hbt, "Tax_Per_Qty", None),
                "Mrgn_Per_Qty": _get(hbt, "Mrgn_Per_Qty", None),
                "Ttl_Mrgn": _get(hbt, "Ttl_Mrgn", None),
                "scheme_type": _get(hbt, "scheme_type", None),
                "scheme_group": _get(hbt, "scheme_group", None),
                "state": _get(branch, "state", None),
            }

        # --- Stream JSON ---
        @stream_with_context
        def generate():
            if input_item_code:
                yield "["
                first_branch_obj = True
                current_branch = None
                current_items = []
                current_branch_name = None
                try:
                    for hbt, item, branch in q:
                        branch_code = getattr(hbt, "Branch_Code", None) or getattr(branch, "branchCode", None)
                        branch_name = getattr(branch, "branchName", None)
                        if current_branch is None:
                            current_branch = branch_code
                            current_branch_name = branch_name
                        if branch_code != current_branch:
                            branch_obj = {
                                "Branch_Code": current_branch,
                                "Branch_Name": current_branch_name,
                                "Items": current_items,
                            }
                            if not first_branch_obj:
                                yield ","
                            else:
                                first_branch_obj = False
                            yield json.dumps(branch_obj, default=str)
                            current_branch = branch_code
                            current_branch_name = branch_name
                            current_items = []
                        current_items.append(row_to_dict(hbt, item, branch))
                    if current_branch is not None:
                        branch_obj = {
                            "Branch_Code": current_branch,
                            "Branch_Name": current_branch_name,
                            "Items": current_items,
                        }
                        if not first_branch_obj:
                            yield ","
                        yield json.dumps(branch_obj, default=str)
                except Exception:
                    current_app.logger.exception("Error streaming HBT data (itemCode flow)")
                    raise
                yield "]"
            else:
                yield "["
                first = True
                try:
                    for hbt, item, branch in q:
                        obj = row_to_dict(hbt, item, branch)
                        if not first:
                            yield ","
                        else:
                            first = False
                        yield json.dumps(obj, default=str)
                except Exception:
                    current_app.logger.exception("Error streaming HBT data (flat-list flow)")
                    raise
                yield "]"

        applied_filters = {
            "branchCode": raw_branch_input,
            "state": raw_state_input,
            "department": input_department,
            "itemCode": input_item_code,
            "Local_HBT": raw_local_hbt,
            "Global_HBT": raw_global_hbt,
            "Stock_Bucket": raw_stock_bucket,
            "Sales_Bucket": raw_sales_bucket,
            "Transit_Qty": raw_transit_qty,
            "current_date": summary_date.isoformat(),
        }

        headers = {
            "X-Stream-By": "hbt-master-data",
            "X-Applied-Filters": json.dumps(applied_filters),
        }

        return Response(generate(), mimetype="application/json", headers=headers)

    except Exception as e:
        current_app.logger.exception(f"Error preparing HBT sync data: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500
