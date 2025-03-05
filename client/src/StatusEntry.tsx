import { useContext, useState } from "react";
import { UserContext } from "./App";
import "./StatusEntry.css";

function LoginVerdict({ code, fn }) {
  if (code == -1) return <></>;
  if (code == 0) return <>Normal</>;
  if (code == 1)
    return (
      <>
        Suspicious
        <div className="choices">
          <button type="button" onClick={fn}>
            Suspend
          </button>
          <button type="button">Ignore</button>
        </div>
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
