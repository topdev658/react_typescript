// CardDetailsForm.tsx

import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import CardInput from '../components/CardDetails';
import { SERVER_BASE_URL } from '../constants/urles';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import CardInputModal from '../components/CardDetails';
interface CheckoutFormProps {
  setmessage: React.Dispatch<React.SetStateAction<string>>;
  settypeOfAlert: React.Dispatch<React.SetStateAction<string>>;
  setalertShow: React.Dispatch<React.SetStateAction<boolean>>;
  planid: number; // Assuming planid is a string, adjust the type accordingly
}
const CardDetailsForm: React.FC<CheckoutFormProps> = ({ setmessage, settypeOfAlert, setalertShow, planid }) => {
  const stripe = useStripe();
  const elements = useElements();
  const params = useParams()
  const [error, setError] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      return;
    }

    const { token, error } = await stripe.createToken(cardElement);

    if (error) {
      console.log(error.message);
      // Handle the error, e.g., show an error message to the user
    } else {
      // The payment was successful if there's a valid token
      if (token) {
        console.log('Payment successful');
        console.log(token)
        console.log(planid)
        handleSubscribe(token.id)
        // You can now send the token to your server for further processing
      } else {
        console.log('Payment failed');
        // Handle the case where the payment was not successful
      }
    }
  };
  const {token} = useSelector((state:any) => state.userToken)
  const handleSubscribe = async (stripToken:string): Promise<void> => {
    try {
      const parmeter = {
        planId:planid,
        token:stripToken

      }
      const response = await fetch(`${SERVER_BASE_URL}/subscriptions`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
          "workspaceid": `${params.id}`
        },
        body: JSON.stringify(parmeter)
      });

      const data = await response.json();
      if (!response.ok) {
        setmessage(data.error)
        settypeOfAlert("error")
        setalertShow(true)
        return;
      }
      setmessage("Subscription Purchased Successfully...!")
      settypeOfAlert("success")
      setalertShow(true)
      console.log(data)
    } catch (error) {
      console.error("Error during Task Creating:", error);
    }
  }
  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '20px' }}>
      <CardInputModal isOpen={isModalOpen} onRequestClose={closeModal} />
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <button type="submit" className='btn btn-dark' onClick={() => setIsModalOpen(true)}>
        Upgrade
      </button>
    </form>
  );
};

export default CardDetailsForm;
