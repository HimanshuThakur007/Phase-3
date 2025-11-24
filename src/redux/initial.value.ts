export interface InitialStateType {
  product_list: any[];
  layoutstyledata: string | null;
  theme: string;
  toggle_header: boolean | null;
}

const productlistdata: any[] = [];

// Detect system color scheme preference
const prefersDarkMode =
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

console.log(prefersDarkMode, "system-layput-mode");

const initialState: InitialStateType = {
  product_list: productlistdata,
  layoutstyledata: localStorage.getItem("layoutStyling"),
  theme:
    // localStorage.getItem("colorschema") ||
    prefersDarkMode ? "dark_mode" : "light_mode",
  toggle_header: false,
};

export default initialState;
export type RootStateType = typeof initialState;
