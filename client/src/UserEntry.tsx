import { useState } from "react";
import './UserEntry.css'

function UserEntry({ uid, username, status, updateStatus, isDisabled }) {
  return (
    <>
      <tr>
        <td>{uid}</td>
        <td>{username}</td>
        <td>
          {
            
            <select disabled={isDisabled} value={status} onChange={(e) => updateStatus(e.target.value)}>
              <option value={0}>Active</option>
              <option value={1}>Suspended</option>
            </select>
          }
        </td>
      </tr>
    </>
  );
}

export default UserEntry;
