import "./App.css";
import Users from "./Users";
import Dashboard from "./Dashboard";
import { createContext, useState } from "react";
import Settings from "./Settings";

export const UserContext = createContext();
export const SettingsContext = createContext();

function App() {
  const [users, setUsers] = useState([]);
  const [midpointServer, setMidpointServer] = useState("");
  const [midpointCreds, setMidpointCreds] = useState("");
  const [ldapServer, setLdapServer] = useState("");

  return (
    <>
      <SettingsContext.Provider
        value={{
          midpoint: [
            midpointServer,
            setMidpointServer,
            midpointCreds,
            setMidpointCreds,
          ],
          ldap: [ldapServer, setLdapServer],
        }}
      >
        <UserContext.Provider value={{ users, setUsers }}>
          <h1>
            <span style={{ marginRight: "5rem" }}>Cyber Intelligent Admin</span>
            <Settings></Settings>
          </h1>

          <div className="container">
            <div className="users">
              <Users></Users>
            </div>

            <div className="dashboard">
              <Dashboard></Dashboard>
            </div>
          </div>
        </UserContext.Provider>
      </SettingsContext.Provider>
    </>
  );
}

export default App;
