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
      <h1>Cyber Intelligent Admin</h1>
      <SettingsContext.Provider
        value={{
          midpoint: [midpointServer, setMidpointServer, midpointCreds, setMidpointCreds],
          ldap: [ldapServer, setLdapServer],
        }}
      >
        <UserContext.Provider value={{ users, setUsers }}>
          <Settings></Settings>

          <div className="container">
            <div className="panel">
              <Users></Users>
            </div>

            <div className="panel">
              <Dashboard></Dashboard>
            </div>
          </div>
        </UserContext.Provider>
      </SettingsContext.Provider>
    </>
  );
}

export default App;
