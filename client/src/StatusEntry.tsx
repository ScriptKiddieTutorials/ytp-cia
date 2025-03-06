import { useContext, useState } from "react";
import { UserContext } from "./App";
import "./StatusEntry.css";
import Button from "@mui/material/Button";

function LoginVerdict({ code, fn }) {
  const [addressed, setAddressed] = useState(false);

  if (code == -1) return <></>;
  if (code == 0) return <>Normal</>;
  if (code == 1)
    return (
      <>
        Suspicious
        {!addressed ? (
          <div className="choices">
            <Button
              type="button"
              onClick={() => {
                fn();
                setAddressed(true);
              }}
            >
              Suspend
            </Button>
            <Button type="button" onClick={() => setAddressed(true)}>
              Ignore
            </Button>
          </div>
        ) : null}
      </>
    );
  if (code == 2) return <>Blocked</>;
}

function StatusEntry({
  verdict,
  user_account,
  role_id,
  user_id,
  action,
  description,
  timestamp,
  IP,
}) {
  const { users, setUsers } = useContext(UserContext);
  const suspendUser = (uid) => {
    const index = users.findIndex((user) => user["name"] == uid);
    const elem = users[index];
    const newElem = {
      ...elem,
      status: 1,
      statusChanged: true,
      updateCount: elem["updateCount"] + 1,
    };
    setUsers([...users.slice(0, index), newElem, ...users.slice(index + 1)]);
  };

  return (
    <>
      <tr>
        <td>
          <LoginVerdict
            code={verdict}
            fn={() => suspendUser(user_id)}
          ></LoginVerdict>
        </td>
        {[
          user_account,
          role_id,
          user_id,
          action,
          description,
          timestamp,
          IP,
        ].map((attribute, index) => (
          <td key={index}>{attribute}</td>
        ))}
      </tr>
    </>
  );
}

export default StatusEntry;
