import Nav from "react-bootstrap/Nav";

interface Props {
  value: string;
  items: string[];
  onChange: (value: string) => void;
  labelTransform?: (item: string) => string;
}

export const SelectList = ({value, items, onChange, labelTransform}: Props) => {
  const content = items.length > 0 ? (
    items.map(i => (
      <Nav.Link
        key={i}
        eventKey={i}
        className="list-group-item"
        onClick={() => {
          onChange(i);
        }}
      >
        {labelTransform ? labelTransform(i) : i}
      </Nav.Link>
    ))
  ) : (
    <div className="h-100 d-flex justify-content-center align-items-center">
      <p style={{textAlign: "center"}}>(Empty)</p>
    </div>
  );

  return (
    <Nav
      className="h-100 w-100 flex-column flex-nowrap overflow-auto bg-light"
      activeKey={value}
    >
      {content}
    </Nav>
  );
};
