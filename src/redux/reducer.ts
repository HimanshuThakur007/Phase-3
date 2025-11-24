import initialState, { RootStateType } from "./initial.value";


// Define a general action type
interface Action {
  type: string;
  payload: any;
}

const rootReducer = (
  state: RootStateType = initialState,
  action: Action
): RootStateType => {
  switch (action.type) {
    case "Product_list":
      return { ...state, product_list: action.payload };
      case "toggle_header":
        return { ...state, toggle_header: action.payload };
    case "Layoutstyle_data":
      return { ...state, layoutstyledata: action.payload };
    case "SET_THEME":
      localStorage.setItem("colorschema", action.payload);
      document.documentElement.setAttribute("data-layout-mode", action.payload);
      return { ...state, theme: action.payload };
    default:
      return state;
  }
};

export default rootReducer;
