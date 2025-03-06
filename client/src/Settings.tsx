import SettingsIcon from "@mui/icons-material/Settings";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { Form, Formik, useFormik } from "formik";
import { useContext, useEffect, useState } from "react";
import { SettingsContext } from "./App";

function Settings() {
  const { midpoint, ldap } = useContext(SettingsContext);
  const [midpointServer, setMidpointServer, midpointCreds, setMidpointCreds] =
    midpoint;
  const [ldapServer, setLdapServer] = ldap;
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = (values, { setSubmitting }) => {
    setTimeout(() => {
      console.log(values);
      setMidpointServer("http://" + values["midpointIP"]);
      setMidpointCreds(values["midpointAcc"] + ":" + values["midpointPwd"]);
      setLdapServer(values["ldapIP"]);
      setSubmitting(false);
      handleClose();
    }, 400);
  };

  const initialValues = {
    midpointIP: "localhost:80",
    midpointAcc: "",
    midpointPwd: "",
    ldapIP: "localhost:389",
  };

  const formik = useFormik({
    initialValues: initialValues,
    onSubmit: handleSubmit,
  });

  useEffect(() => {
    setMidpointServer("http://" + initialValues["midpointIP"]);
    setLdapServer(initialValues["ldapIP"]);
  }, []);

  return (
    <>
      <Button variant="contained" color="primary" onClick={handleClickOpen}>
        <SettingsIcon color="action" fontSize="large" />
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <Formik>
          <Form className="login-form" onSubmit={formik.handleSubmit}>
            <DialogTitle color="primary">Edit Configuration</DialogTitle>
            <DialogContent>
              <DialogContentText>MidPoint Server IP</DialogContentText>
              <TextField
                autoFocus
                required
                margin="dense"
                name="midpointIP"
                placeholder={initialValues["midpointIP"]}
                value={formik.values.midpointIP}
                onChange={formik.handleChange}
                type="text"
                fullWidth
                variant="standard"
              />
              <DialogContentText>MidPoint Credentials</DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                name="midpointAcc"
                placeholder={"admin username"}
                value={formik.values.midpointAcc}
                onChange={formik.handleChange}
                type="text"
                fullWidth
                variant="standard"
              />
              <TextField
                autoFocus
                margin="dense"
                name="midpointPwd"
                placeholder={"admin password"}
                value={formik.values.midpointPwd}
                onChange={formik.handleChange}
                type="password"
                fullWidth
                variant="standard"
              />
              <DialogContentText>LDAP Server IP</DialogContentText>
              <TextField
                autoFocus
                required
                margin="dense"
                name="ldapIP"
                placeholder={initialValues["ldapIP"]}
                value={formik.values.ldapIP}
                onChange={formik.handleChange}
                type="text"
                fullWidth
                variant="standard"
              />{" "}
            </DialogContent>

            <DialogActions>
              <Button type="button" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogActions>
          </Form>
        </Formik>
      </Dialog>
    </>
  );
}

export default Settings;
