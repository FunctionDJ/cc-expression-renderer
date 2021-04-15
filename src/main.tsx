import {render} from "react-dom";
import {App} from "./app";

const container = document.querySelector("#root")!;

render(
  // <React.StrictMode>
  <App/>
  // </React.StrictMode>
  , container);
