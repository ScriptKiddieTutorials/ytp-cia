import { Formik, Field, Form, ErrorMessage } from "formik";
import "./StatusOld.css";
import { useContext, useRef, useState } from "react";
import { UserContext } from "./App";

const SERVER = "http://localhost:5000";

function StatusOld() {
  return (
    <>
      <h2>Status</h2>
      <MockLoginForm></MockLoginForm>
    </>
  );
}

// 490 is an anomaly
// 490,user104@example.com,1,104,login failed,wrong account,2024-02-04 06:31:25.075627,192.168.4.251
function MockLoginForm() {
  const { users, setUsers } = useContext(UserContext);
  const [result, setResult] = useState(-1);

  const lastLogin = useRef({});

  const handleSubmit = (values, { setSubmitting }) => {
    setResult(-1);
    setTimeout(() => {
      lastLogin.current = {
        user_account: values.userAccount,
        role_id: values.roleId,
        user_id: values.userId,
        action: values.action,
        description: values.description,
        timestamp: values.timestamp,
        IP: values.ip,
      };
      const url =
        SERVER +
        (values.csvData
          ? `/model/api/${values.csvData}`
          : `/model/api_v2?${new URLSearchParams(lastLogin.current)}`);

      fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((raw) => raw.json())
        .then((res) => {
          setResult(res["is_anomaly"]);
        });
      setSubmitting(false);
    }, 400);
  };

  const suspendUser = (uid) => {
    const index = users.findIndex((user) => user["name"] == uid);
    const elem = users[index];
    const newElem = {
      ...elem,
      status: 1,
      updateCount: elem["updateCount"] + 1,
    };
    setUsers([...users.slice(0, index), newElem, ...users.slice(index + 1)]);
  };

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
          <h3>Simulate LDAP Auth</h3>
          <label>
            User Account
            <Field
              name="userAccount"
              type="email"
              placeholder="user12@ytp.org"
            />
          </label>
          <label>
            Role ID
            <Field name="roleId" type="text" placeholder="1,3" />
          </label>
          <label>
            User ID
            <Field name="userId" type="text" placeholder="12" />
          </label>
          <label>
            Action
            <Field name="action" type="text" placeholder="login failed" />
          </label>
          <label>
            Description
            <Field name="description" type="text" placeholder="wrong account" />
          </label>
          <label>
            Timestamp
            <Field
              name="timestamp"
              type="text"
              placeholder="2025-01-01 08:00:00.123456"
            />
          </label>
          <label>
            IP Address
            <Field name="ip" type="text" placeholder="192.168.0.1" />
          </label>
          <div style={{ textAlign: "center" }}>
            <b>OR</b>
          </div>
          <label>
            Use CSV data
            <Field
              name="csvData"
              type="text"
              placeholder="user12@ytp.org,1,12,login failed,wrong account,2025-01-01 08:00:00.123456,192.168.0.1"
            />
          </label>
          <label>
            Cumulative
            <Field name="logging" type="checkbox" />
          </label>
          <button type="submit">Login</button>
          <span className="result">
            {["", "NORMAL", "ANOMALY"][result + 1]}
          </span>
        </Form>
      </Formik>
      {result == 1 ? (
        <div>
          <button onClick={() => suspendUser(lastLogin.current["user_id"])}>
            Suspend User
          </button>
          <button>Ignore</button>
        </div>
      ) : null}
    </>
  );
}

export default StatusOld;
