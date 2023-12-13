// CardInputModal.tsx
import React from 'react';
import { Modal, Form, Row, Col } from 'react-bootstrap';
import { CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js';

const CardInputModal: React.FC<{ isOpen: boolean; onRequestClose: () => void }> = ({ isOpen, onRequestClose }) => {
  return (
    <Modal show={isOpen} onHide={onRequestClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Card details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Col>
              <Form.Group>
                <Form.Label>Card Number</Form.Label>
                <CardNumberElement
                  options={{
                    style: {
                      base: {
                        fontSize: '18px',
                        color: '#424770',
                        '::placeholder': {
                          color: '#aab7c4',
                        },
                      },
                    },
                  }}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Group>
                <Form.Label>Expiration Date</Form.Label>
                <CardExpiryElement
                  options={{
                    style: {
                      base: {
                        fontSize: '18px',
                        color: '#424770',
                        '::placeholder': {
                          color: '#aab7c4',
                        },
                      },
                    },
                  }}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <Form.Label>CVV</Form.Label>
                <CardCvcElement
                  options={{
                    style: {
                      base: {
                        fontSize: '18px',
                        color: '#424770',
                        '::placeholder': {
                          color: '#aab7c4',
                        },
                      },
                    },
                  }}
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CardInputModal;
