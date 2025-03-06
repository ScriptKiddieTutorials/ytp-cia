import "./Users.css";
import { useContext, useEffect, useRef, useState } from "react";
import UserEntry from "./UserEntry";
import { SettingsContext, UserContext } from "./App";
import Button from "@mui/material/Button";

function Users() {
  const { midpoint, ldap } = useContext(SettingsContext);
  const [midpointServer, setMidpointServer, midpointCreds, setMidpointCreds] =
    midpoint;
  const { users, setUsers } = useContext(UserContext);
  const [isDisabled, setIsDisabled] = useState(false);

  const pullInfo = () =>
    fetch(`${midpointServer}/midpoint/users/search`, {
      method: "POST",
      headers: {
        Authorization: midpointCreds,
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
        fetch(`${midpointServer}/midpoint/users/${user["oid"]}`, {
          method: "POST",
          headers: {
            Authorization: midpointCreds,
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
      .then(() => new Promise((res) => setTimeout(res, 3500)))
      .then(pullInfo())
      .then(() => setIsDisabled(false));
  };

  useEffect(() => {
    console.log("update");
    pullInfo();
  }, [midpointServer, midpointCreds]);

  return (
    <>
      <h2>
        Users
        <Button
          style={{ marginLeft: "1rem" }}
          variant="contained"
          onClick={syncInfo}
        >
          Sync
        </Button>
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
        <span>Fetching from MidPoint server at {midpointServer}...</span>
      )}
    </>
  );
}

export default Users;
