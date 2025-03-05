import { Formik, Field, Form, ErrorMessage } from "formik";
import "./Status.css";
import { useContext, useRef, useState } from "react";
import { UserContext } from "./App";
import StatusEntry from "./StatusEntry";

const SERVER = "http://localhost:5000";
const LDAP_SERVER = "104.155.229.110:389";

function Status() {
  return (
    <>
      <h2>Status</h2>
      <MockLoginForm></MockLoginForm>
    </>
  );
}

// 490 is an anomaly
// 490,user104@example.com,1,104,login failed,wrong account,2024-02-04 06:31:25.075627,192.168.4.251
// user104@example.com;1;104;login failed;wrong account;2024-02-04 06:31:25.075627;192.168.4.251

function MockLoginForm() {
  const csvToDict = (data) => {
    const res = {};
    const dataList = data.split(";");
    [
      "user_account",
      "role_id",
      "user_id",
      "action",
      "description",
      "timestamp",
      "IP",
    ].forEach((key, index) => {
      res[key] = dataList[index];
    });
    return res;
  };

  const { users, setUsers } = useContext(UserContext);
  const [status, setStatus] = useState(
    `user11@ytpjaj.org;1,2,3;011;login failed;wrong password;2024-02-04 17:30:55.074193;192.168.122.29
user5@ytpjaj.org;1,3;005;login successful;;2024-02-05 17:36:55.074113;192.168.61.216
user12@ytpjaj.org;1;012;login failed;wrong account;2024-02-06 06:31:25.075627;192.168.4.251
user32@ytpjaj.org;1,2,3;32;logout successful;;2024-02-07 21:36:55.120189;192.168.16.184
user52@ytpjaj.org;1,3;52;login successful;;2024-02-08 05:52:25.086095;192.168.220.214`
      .split("\n")
      .map(csvToDict)
  );
  const lastLogin = useRef({});

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

    console.log(lastLogin.current);

    setTimeout(() => {
      const url = `${SERVER}/model/api_v2?${new URLSearchParams(
        lastLogin.current
      )}`;

      lastLogin.current["verdict"] = -1;

      console.log(lastLogin.current["user_id"]);
      const index = users.findIndex(
        (user) => user["name"] == lastLogin.current["user_id"]
      );
      console.log(index);

      if (index != -1) {
        if (users[index]["status"] == 1) {
          lastLogin.current["verdict"] = 2;
          setStatus([...status, { ...lastLogin.current }]);
          return;
        }
      }

      fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((raw) => raw.json())
        .then((res) => {
          lastLogin.current["verdict"] = res["is_anomaly"];
          setStatus([...status, { ...lastLogin.current }]);
        });
      setSubmitting(false);
    }, 400);
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
          <h3>Connected to LDAP server at {LDAP_SERVER}...</h3>
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
                <td></td>
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
                <td colSpan={8}>
                  OR use a semicolon-delimited string:
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
          <button type="submit">Login</button>
        </Form>
      </Formik>
    </>
  );
}

export default Status;
