import { FrameType } from "../types/expression-renderer";
import Form from "react-bootstrap/Form";
import { useEffect, useState } from "react";

export interface Config {
  debugMode: boolean;
  loop: boolean;
  double: boolean;
  frameType: FrameType;
}

interface Props {
  config: Config;
  setConfig: (config: Config) => void;
  isAnimation: boolean;
}

export const Configuration = ({ config, setConfig, isAnimation }: Props) => {
  const [debugMode, setDebugMode] = useState(config.debugMode);
  const [loop, setLoop] = useState(config.loop);
  const [double, setDouble] = useState(config.double);
  const [frameType, setFrameType] = useState(config.frameType);

  useEffect(() => {
    setConfig({ debugMode, loop, double, frameType });
  }, [debugMode, loop, double, frameType, setConfig]);

  return (
    <>
      <div className="radio-container">
        <Form.Switch
          id="debug-switch"
          label="Debug"
          checked={debugMode}
          onChange={() => {
            setDebugMode(!debugMode);
          }}
        />
        <Form.Switch
          id="loop-switch"
          label="Loop"
          disabled={!isAnimation}
          checked={config.loop}
          onChange={() => {
            setLoop(!config.loop);
          }}
        />
        <Form.Switch
          id="double-switch"
          label="2x Size"
          checked={double}
          onChange={() => {
            setDouble(!double);
          }}
        />
      </div>
      <div className="radio-container">
        <Form.Check
          custom
          id="frame-type-radio-default"
          type="radio"
          label="Default"
          checked={frameType === "default"}
          onChange={() => {
            setFrameType("default");
          }}
        />
        <Form.Check
          custom
          id="frame-type-radio-face-only"
          type="radio"
          label="Face only"
          checked={frameType === "face-only"}
          onChange={() => {
            setFrameType("face-only");
          }}
        />
        <Form.Check
          custom
          id="frame-type-radio-expand"
          type="radio"
          label="Expand"
          checked={frameType === "expand"}
          onChange={() => {
            setFrameType("expand");
          }}
        />
      </div>
    </>
  );
};
