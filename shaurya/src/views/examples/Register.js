
import React, { useState, createContext } from "react";
import axios from 'axios';
import './stylesheet/style.css'
import { Card, CardBody, Col } from "reactstrap";
import AdminNavbar from "components/Navbars/AdminNavbar";

const firstName = createContext();

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(false);

    try {
      const res = await axios.post('http://localhost:8080/register', { name, email, password });
      console.log(res);

      if (res.data) {
        window.location.replace('/auth/login');
      }
    } catch (error) {
      setError(true);
      console.warn(error.response.data);
    }
  };

  return (
    <>
      <firstName.Provider value={error}>
        <AdminNavbar />
      </firstName.Provider>

      <Col lg="6" md="8">
        <Card className="bg-secondary shadow border-0">
          <CardBody className="px-lg-5 py-lg-3">
            <form onSubmit={handleSubmit} className="form">
              <h2>Register up</h2>
              <label htmlFor="name" className="label">Name</label>
              <input
                className="input"
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <label htmlFor="email" className="label">Email</label>
              <input
                className="input"
                type="text"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="email error"></div>

              <label htmlFor="password" className="label">Password</label>
              <input
                type="password"
                id="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <div className="password error"></div>
              <button type="submit">Register</button>
              {error && <span style={{ color: "red" }}>Something went wrong!</span>}
            </form>
          </CardBody>
        </Card>
      </Col>
    </>
  );
};

export { firstName };
export default Register;
