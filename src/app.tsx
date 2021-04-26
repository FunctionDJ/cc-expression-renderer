import "bootstrap/dist/css/bootstrap.min.css";
import "../public/style.css";
import { Flipbook } from "./flipbook";
import { WebLoader } from "./classes/web-loader";
import { FSAWrapper } from "./FSAWrapper";

const isDev = import.meta.env.DEV;

export const App = () => {
  if (isDev) {
    return <Flipbook loader={new WebLoader("gamefiles/assets")}/>;
  }

  return <FSAWrapper/>;
};
