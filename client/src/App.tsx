import "./App.css";
import Users from "./Users";
import Status from "./Status";
import { createContext, useState } from "react";

export const UserContext = createContext(null);

function App() {
  const [users, setUsers] = useState([]);

  return (
    <>
      <h1>Cyber Intelligent Administration</h1>
      <UserContext.Provider value={{ users, setUsers }}>
        <div className="container">
          <div className="panel">
            <Users></Users>
          </div>

          <div className="panel">
            <Status></Status>
          </div>
        </div>
      </UserContext.Provider>
    </>
  );
}

export default App;
