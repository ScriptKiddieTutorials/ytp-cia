import { useState } from "react";
import Report from "./Report.tsx";
import Status from "./Status.tsx";
import { csvToDict } from "./statusConfig.ts";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";

function Dashboard() {
  const [status, setStatus] = useState([]);

  return (
    <>
      <h2>Dashboard</h2>
      <List>
        <ListItem>
          <Status status={status} setStatus={setStatus}></Status>
        </ListItem>

        <Divider component="li" />
        <ListItem>
          <Report status={status}></Report>
        </ListItem>
      </List>
    </>
  );
}

export default Dashboard;
