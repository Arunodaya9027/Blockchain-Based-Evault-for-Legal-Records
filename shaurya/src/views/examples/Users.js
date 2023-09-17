import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardTitle, Container, Row, Col } from "reactstrap";

function Users() {
  const [users, setUsers] = useState([]);

  const getUsers = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/getuser", {
        method: 'GET',
      });
      const data = await response.json();
      setUsers(data); // Update state with the fetched data
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <>
      <div className="header bg-gradient-info pb-8 pt-5 pt-md-8">
        <Container fluid>
          <div className="header-body">
            {/* Card stats */}
            <Row>
              {users.map(user => (
                <Col lg="2" xl="6" mb="6" key={user._id}>
                  <Card className="card-stats mb-6 mb-xl-4">
                    <CardBody>
                      <Row>
                        <div className="col">
                          <CardTitle
                            tag="h5"
                            className="text-uppercase text-muted mb-0"
                          >
                            {user.designation}
                          </CardTitle>
                          <span className="h2 font-weight-bold mb-0">
                            {user.name}
                          </span>
                        </div>
                        <Col className="col-auto">
                          <div className="icon icon-shape bg-success text-white ni ni-single-02">
                            <i className="fas fa-chart-bar" />
                          </div>
                        </Col>
                      </Row>
                      <p className="mt-3 mb-0 text-muted text-sm">
                        <span className="text-warning mr-2">
                          private key
                        </span>{" "}
                        <span className="text-nowrap">{user.walletaddress}</span>
                      </p>
                    </CardBody>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </Container>
      </div>
    </>
  );
}

export default Users;
