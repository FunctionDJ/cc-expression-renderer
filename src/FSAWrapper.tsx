import { useMemo, useState } from "react";
import { browserHasFSASupport } from "./helper";
import { FileSystemLoader } from "./fs-api-helpers";
import { Flipbook } from "./flipbook";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";

interface AbortError {
  stack: string;
}

export const FSAWrapper = () => {
  const support = useMemo(browserHasFSASupport, []);
  const [loader, setLoader] = useState<FileSystemLoader>();
  const [error, setError] = useState<AbortError>();

  if (loader) {
    return <Flipbook loader={loader}/>;
  }

  async function open() {
    try {
      const directoryHandler = await window.showDirectoryPicker();
      setLoader(new FileSystemLoader(directoryHandler));
      setError(undefined);
    } catch (error: unknown) {
      const e = error as AbortError;

      if (e.stack === "Error: The user aborted a request.") {
        return;
      }

      setError(e);
    }
  }

  return (
    <Modal
      show
      centered
      animation={false}
      onHide={() => {/* noop */}}
    >
      <Modal.Header className="justify-content-start align-items-center">
        <img
          src="icon.webp"
          className="mr-4"
          style={{ height: "3rem" }}
        />
        <h4 className="m-0">
          CrossCode Expression Renderer
        </h4>
      </Modal.Header>
      <Modal.Body>
        <p>
          The public version of this app doesn&apos;t come with any game files,
          so it uses the
          {" "}
          <a href="https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API">File System Access API</a>
          {" "}
          to load your own game files from the disk.
        </p>
        {support ? (
          <>
            <h5>Instructions</h5>
            <ol className="pl-3">
              <li>Open Steam, go to Library, right-click CrossCode, then Manage, then Browser local files</li>
              <li>Copy the <code>assets</code> folder to any of your user folders, for example Desktop or Downloads</li>
              <li>Click the button below and choose that assets folder</li>
            </ol>
          </>
        ) : (
          <Alert variant="danger">
            <p>
              Your browser does not seem to support the File System Access API.
            </p>
            <p>
              You can use either a new desktop version of Chrome, Edge, or Opera, or check the info on <a href="https://caniuse.com/native-filesystem-api">caniuse.com</a>
            </p>
          </Alert>
        )}
        {error && (
          <Alert variant="danger">
            An error occured: {JSON.stringify(error)}
          </Alert>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button
          block
          disabled={!support}
          onClick={open}
        >
          Open assets folder
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
