import React, { useState, useEffect } from 'react';
import {
  Badge,
  Card,
  CardHeader,
  Table,
  Container,
  Row,
  Media,
} from "reactstrap";
// core components
import Header from "components/Headers/HeadDesign";

function Transactions() {
  const [transactions, setTransactions] = useState([]);

  const getTransaction = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/getTransaction", {
        method: 'GET',
      });
      const data = await response.json();
      setTransactions(data); // Update state with the fetched data
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  }

  useEffect(() => {
    getTransaction();
  }, []);

  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
        <Row className="mt-5">
          <div className="col">
            <Card className="bg-default shadow">
              <CardHeader className="bg-transparent border-0">
                <h3 className="text-white mb-0">Transaction Details</h3>
              </CardHeader>
              <Table className="align-items-center table-dark table-flush" responsive>
                <thead className="thead-dark">
                  <tr>
                    <th scope="col">TRANSACTION HASH</th>
                    <th scope="col">STATE</th>
                    <th scope="col">NETWORK</th>
                    <th scope="col">CREATED AT</th>
                    <th scope="col">TO</th>
                    <th scope="col">FROM</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(transaction => (
                    <tr key={transaction._id}>
                      <th scope="row">
                        <Media className="align-items-center">
                          <a
                            className="avatar rounded-circle mr-3"
                            href="#pablo"
                            onClick={(e) => e.preventDefault()}
                          >
                            <img
                              alt="..."
                              src={require("../../assets/img/theme/ethereum-6278326_1280.png")}
                            />
                          </a>
                          <Media>
                            <span className="mb-0 text-sm">
                              {transaction.transactionHash}
                            </span>
                          </Media>
                        </Media>
                      </th>
                      <td style={{color:"#90EE90"}}>Success</td>
                      <td>{transaction.network}</td>
                      <td>{transaction.createdAt}</td>
                      <td>{transaction.to}</td>
                      <td>{transaction.from}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          </div>
        </Row>
      </Container>
    </>
  );
};

export default Transactions;
