import "./Report.css";
import { useState } from "react";
import { APP_SERVER, dictToCsv } from "./statusConfig.ts";
import Button from "@mui/material/Button";

function Report({ status }) {
  const [report, setReport] = useState("");
  return (
    <div className="report-container">
      <div>
        <a
          href={URL.createObjectURL(
            new Blob([dictToCsv(status)], { type: "text/plain" })
          )}
          download={"log.txt"}
        >
          <Button variant="contained">Download log</Button>
        </a>
        <Button
          variant="contained"
          style={{ marginLeft: "1rem" }}
          onClick={() => {
            fetch(`${APP_SERVER}/report`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                csvData: dictToCsv(status),
              }),
            })
              .then((response) => response.json())
              .then(setReport);
          }}
        >
          Generate Report
        </Button>
      </div>
      {report.length ? (
        <div
          className="report"
          dangerouslySetInnerHTML={{ __html: report }}
        ></div>
      ) : null}
    </div>
  );
}

export default Report;
