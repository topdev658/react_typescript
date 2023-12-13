import React from 'react'
import { Button, Col, Container, Row } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import routes from '../constants/routes'

function Success() {
	const navigate = useNavigate()
  return (
	<Container className="mt-5">
      <Row>
        <Col md={{ span: 6, offset: 3 }}>
          <div className="text-center">
            <h1 className="text-success">Payment Successful</h1>
            <p>Your payment has been processed successfully.</p>
            <Button variant="primary" onClick={() => navigate(routes.Workspace)}>Go Back to Home</Button>
          </div>
        </Col>
      </Row>
    </Container>
  )
}

export default Success