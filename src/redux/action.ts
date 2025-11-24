// export const product_list = () => ({ type: "Product_list" });
// export const set_product_list = (payload) => ({
//   type: "Product_list",
//   payload,
// });
// export const toogleHeader_data = () => ({ type: "toggle_header" });
// export const setToogleHeader = (payload) => ({
//   type: "toggle_header",
//   payload,
// });

// export const setLayoutChange = (payload) => ({
//   type: "Layoutstyle_data",
//   payload,
// });
// export const setTheme = (theme) => ({
//   type: "SET_THEME",
//   payload: theme,
// });

// Define action types as string literals or an enum
export enum ActionTypes {
    ProductList = "Product_list",
    ToggleHeader = "toggle_header",
    LayoutStyleData = "Layoutstyle_data",
    SetTheme = "SET_THEME",
  }
  
  export const product_list = () => ({
    type: ActionTypes.ProductList,
  });
  
  export const set_product_list = (payload: any[]) => ({
    type: ActionTypes.ProductList,
    payload,
  });
  
  export const toggleHeader_data = () => ({
    type: ActionTypes.ToggleHeader,
  });
  
  export const setToggleHeader = (payload: boolean) => ({
    type: ActionTypes.ToggleHeader,
    payload,
  });
  
  export const setLayoutChange = (payload: string) => ({
    type: ActionTypes.LayoutStyleData,
    payload,
  });
  
  export const setTheme = (theme: string) => ({
    type: ActionTypes.SetTheme,
    payload: theme,
  });
  

