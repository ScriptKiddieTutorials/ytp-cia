import "./Status.css";
import { Formik, Field, Form, ErrorMessage } from "formik";
import { useContext, useEffect, useRef } from "react";
import { SettingsContext, UserContext } from "./App";
import { csvToDict, APP_SERVER } from "./statusConfig";
import StatusEntry from "./StatusEntry";
import Button from "@mui/material/Button";

/* Examples used for demo */
const initEntries = `user11@ytpjaj.org;1,2,3;011;login failed;wrong password;2024-02-04 17:30:55.074193;192.168.122.29
user5@ytpjaj.org;1,3;005;login successful;;2024-02-05 17:36:55.074113;192.168.61.216
user12@ytpjaj.org;1;012;login failed;wrong account;2024-02-06 06:31:25.075627;192.168.4.251
user32@ytpjaj.org;1,2,3;32;logout successful;;2024-02-07 21:36:55.120189;192.168.16.184
user52@ytpjaj.org;1,3;52;login successful;;2024-02-08 05:52:25.086095;192.168.220.214`;

function Status({ status, setStatus }) {
  const curRun = useRef(0);
  const { users, setUsers } = useContext(UserContext);
  const { ldap } = useContext(SettingsContext);
  const [ldapServer] = ldap;

  const lastLogin = useRef({});

  const addEntry = (entry) => {
    entry["verdict"] = -1;
    const url = `${APP_SERVER}/model/api_v2?${new URLSearchParams(entry)}`;

    const index = users.findIndex((user) => user["name"] == entry["user_id"]);
    if (index >= 0) {
      if (users[index]["status"] == 1) {
        entry["verdict"] = 2;
        setStatus([...status, { ...entry }]);
        return Promise.resolve();
      }
    }

    return fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((raw) => raw.json())
      .then((res) =>
        setStatus((prevStatus) => [
          ...prevStatus,
          { ...entry, verdict: res["is_anomaly"] },
        ])
      );
  };

  const handleSubmit = (values, { setSubmitting }) => {
    lastLogin.current =
      values.csvData.length > 0
        ? csvToDict(values.csvData)
        : {
            user_account: values.userAccount,
            role_id: values.roleId,
            user_id: values.userId,
            action: values.action,
            description: values.description,
            timestamp: values.timestamp,
            IP: values.ip,
          };

    lastLogin.current["timestamp"] =
      lastLogin.current["timestamp"] ||
      new Date().toISOString().replace("T", " ").replace("Z", "");

    setTimeout(
      () => addEntry(lastLogin.current)?.then(() => setSubmitting(false)),
      400
    );
  };

  const schema = [
    ["userAccount", "user12@ytpjaj.org"],
    ["roleId", "1,3"],
    ["userId", "012"],
    ["action", "login failed"],
    ["description", "wrong account"],
    ["timestamp", "2025-01-01 08:00:00.123456"],
    ["ip", "192.168.0.1"],
  ];

  useEffect(() => {
    if (curRun.current) return;
    initEntries
      .split("\n")
      .map(csvToDict)
      .reduce((acc, cur) => acc.then(() => addEntry(cur)), Promise.resolve());
    curRun.current++;
  }, []);

  return (
    <>
      <Formik
        initialValues={{
          logging: true,
          userAccount: "",
          roleId: "",
          userId: "",
          action: "",
          description: "",
          timestamp: "",
          ip: "",
          csvData: "",
        }}
        onSubmit={handleSubmit}
      >
        <Form className="login-form">
          <h3>Streaming from LDAP server at {ldapServer}...</h3>
          <label>
            Cumulative
            <Field name="logging" type="checkbox" />
          </label>

          <table>
            <thead>
              <tr>
                {[
                  "AI Verdict",
                  "Email",
                  "Roles",
                  "User ID",
                  "Action",
                  "Description",
                  "Timestamp",
                  "IP Address",
                ].map((category, index) => (
                  <th key={index}>{category}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {status.map((record, index) => (
                <StatusEntry key={index} {...record}></StatusEntry>
              ))}

              <tr>
                <td rowSpan={2}>
                  <Button variant="outlined" type="submit">
                    Simulate
                  </Button>
                </td>
                {schema.map(([column, placeholder]) => (
                  <td key={column}>
                    <Field
                      name={column}
                      type="text"
                      placeholder={placeholder}
                    />
                  </td>
                ))}
              </tr>
              <tr>
                <td colSpan={7}>
                  OR use a CSV string:
                  <Field
                    name="csvData"
                    style={{ marginLeft: "1rem" }}
                    type="text"
                    placeholder={schema
                      .map(([column, placeholder]) => placeholder)
                      .join(";")}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </Form>
      </Formik>
    </>
  );
}

export default Status;
