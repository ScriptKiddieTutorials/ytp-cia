import "./Users.css";
import { useContext, useEffect, useRef, useState } from "react";
import UserEntry from "./UserEntry";
import { UserContext } from "./App";

const SERVER = "http://localhost:5000";

function Users() {
  const { users, setUsers } = useContext(UserContext);
  const [isDisabled, setIsDisabled] = useState(false);

  const pullInfo = () =>
    fetch(`${SERVER}/midpoint/users/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: "" }),
    })
      .then((raw) => raw.json())
      .then((res) => res["object"]["object"])
      .then((items) =>
        items.map((item) => ({
          ...item,
          status: +(item["activation"]["effectiveStatus"] == "disabled"),
          statusChanged: false,
          updateCount: 0,
        }))
      )
      .then((users) => {
        console.log(users);
        users.sort((user1, user2) =>
          user1["name"].localeCompare(user2["name"])
        );
        setUsers(users);
      });

  const pushInfo = () =>
    users
      .filter((user) => user["statusChanged"])
      .map((user) =>
        fetch(`${SERVER}/midpoint/users/${user["oid"]}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            objectModification: {
              itemDelta: {
                modificationType: "add",
                path: "activation/administrativeStatus",
                value: ["enabled", "disabled"][user["status"]],
              },
            },
          }),
        })
      );

  const syncInfo = () => {
    setIsDisabled(true);
    Promise.allSettled(pushInfo())
      .then(() => new Promise((res) => setTimeout(res, 2000)))
      .then(pullInfo())
      .then(() => setIsDisabled(false));
  };

  useEffect(() => pullInfo, []);

  return (
    <>
      <h2>
        Users
        <button onClick={syncInfo}>Sync</button>
      </h2>
      {users.length ? (
        <table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Username</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <UserEntry
                key={`${user["name"]}_${user["updateCount"]}`}
                uid={user["name"]}
                username={user["givenName"]}
                status={user["status"]}
                updateStatus={(verdict) => {
                  console.log("updateStatus()", index, verdict);
                  const elem = users[index];
                  const newElem = {
                    ...elem,
                    status: verdict,
                    statusChanged: true,
                    updateCount: elem["updateCount"] + 1,
                  };
                  setUsers([
                    ...users.slice(0, index),
                    newElem,
                    ...users.slice(index + 1),
                  ]);
                }}
                isDisabled={isDisabled}
              ></UserEntry>
            ))}
          </tbody>
        </table>
      ) : (
        <span>Fetching from MidPoint...</span>
      )}
    </>
  );
}

export default Users;
