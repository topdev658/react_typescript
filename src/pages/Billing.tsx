import React, { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { SERVER_BASE_URL } from "../constants/urles";
import { useSelector } from "react-redux";
import StripeCheckOut from "../utils/StripeCheckOut";
import { Stripe, loadStripe, RedirectToCheckoutOptions } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import getStripe from "../utils/UseStrpe";
import PaymentForm from "../utils/StripeCheckOut";
import CheckoutForm from "../utils/StripeCheckOut";
const stripePromise = loadStripe('pk_test_51O1gHEB4ZEWdjEyS2FjsbRDzItUIXHERudxhZdp4aPGoSXtiD3sqAclX5RC01rkVZiX3BtljWXgXS4RwMvVqJnOt00knexPvjG')

interface Feature {
  name: string;
}

interface Workspace {
  id: number;
  name: string;
  description: string | null;
  metaData: any; // You can replace 'any' with a more specific type if needed
  price: number;
  feature: Feature[];
  productId: string;
  discount: any; // You can replace 'any' with a more specific type if needed
  duration: string;
  priceId: string;
  images: string[] | null; // You can replace 'string' with a more specific type if needed
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  data: Workspace[];
  count: number;
  limit: number;
}
const Billing: React.FC = () => {
  const id = localStorage.getItem("curentWS")
  const params = useParams()
  const [plans, setplans] = useState<Workspace[]>([])
  const [alertShow, setalertShow] = useState<boolean>(false)
  const [message, setmessage] = useState<string>('')
  const [typeOfAlert, settypeOfAlert] = useState<string>('')
  const [payToken, settoken] = useState<string>('')
  const [planId, setplanId] = useState<number>(0)
  const { token } = useSelector((state: any) => state.userToken)
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const stripePromise = loadStripe('pk_test_51O1gHEB4ZEWdjEyS2FjsbRDzItUIXHERudxhZdp4aPGoSXtiD3sqAclX5RC01rkVZiX3BtljWXgXS4RwMvVqJnOt00knexPvjG');
  const handlePayment = (token: string) => {
    // Use the token as needed, e.g., send it to your server
    console.log('Received payment token:', token);
    settoken(token);
  };
  async function handleCheckout(priceId: string) {
    const stripe = await getStripe();

    if (stripe) {
      const options: RedirectToCheckoutOptions = {
        lineItems: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        successUrl: `https://dev.workspace.tesseractsquare.com/payment_success`,
        cancelUrl: `http://localhost:3000/cancel`,
        customerEmail: 'customer@email.com',
      };

      const { error } = await stripe.redirectToCheckout(options);

      if (error) {
        console.warn(error.message);
      }
    }
  }
  
  const handleFetchPlan = async (): Promise<void> => {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/subscriptions/plans`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
          "workspaceid": `${params.id}`
        }
      });

      const data = await response.json();
      if (!response.ok) {
        setmessage(data.error)
        settypeOfAlert("error")
        setalertShow(true)
        return;
      }
      setplans(data.data)
    } catch (error) {
      console.error("Error during Task Creating:", error);
    }
  }


  useEffect(() => {
    handleFetchPlan()
  }, [])

  return (
    <>
      <Navbar />
      <Elements stripe={stripePromise}>
      <div className="secondary-nav-links">
        <ul>
          <li>
            <NavLink to={`/settings/${id}`}>Setting</NavLink>
          </li>
          <li>
            <NavLink to={"/billing"}>Billing</NavLink>
          </li>
        </ul>
      </div>
      <div className="billing-wrap d-flex flex-wrap">
        <div className="billing-plans">
          {plans.map((plan) => (
            <div key={plan.id} className={`billing-plan-box ${plan.name.toLowerCase()}`}>
              <span className="billing-plan-box-title">{plan.name}</span>
              <div className="billing-plan-box-con">
                <div className="d-flex align-items-center">
                  <div className="flex-fill">
                    <div className="billing-plan-price">
                      {plan.price !== 0 ? `AU $${plan.price}.00` : "Free"} <span>per month</span>
                    </div>
                  </div>
                  {/* <div className="billing-plan-status">{plan.status}</div> */}
                </div>
                <div className="d-flex align-items-center">
                  {/* <div className="flex-fill">
                    <p>
                      {plan.feature.map((feature, index) => (
                        <React.Fragment key={index}>
                          {feature.name} <br />
                        </React.Fragment>
                      ))}
                      {plan.description && <>{plan.description} <br /></>}
                      Find more information on what's included in this plan here
                    </p>
                  </div> */}
                  <div className="billing-plan-btns">
                    {/* <button className="btn btn-dark" onClick={() => handleCheckout(plan.priceId)}>Upgrade</button> */}
                    <Elements stripe={stripePromise}>
      <CheckoutForm setmessage={setmessage} settypeOfAlert={settypeOfAlert} setalertShow={setalertShow} planid={plan.id} />
    </Elements>
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>

        {/* <div className="billing-invoices">
          <div className="billing-invoices-inr">
            <div className="billing-invoices-head d-flex justify-content-between align-items-center">
              <div className="billing-invoices-title">Invoice</div>
              <a href="#" className="btn btn-outline-secondary">
                Download all
              </a>
            </div>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: "50%" }}>
                      <div className="form-check d-flex align-items-center mb-0">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="name1"
                        />
                        <label className="form-check-label" htmlFor="name1">
                          Invoice
                        </label>
                      </div>
                    </th>
                    <th className="text-end">Billing Date</th>
                    <th className="text-end">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="form-check d-flex align-items-center mb-0">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="name1"
                        />
                        <label className="form-check-label" htmlFor="name1">
                          Invoice
                        </label>
                      </div>
                    </td>
                    <td className="text-end">Jan 4, 2022</td>
                    <td className="text-end">Jan 4, 2022</td>
                  </tr>
                  <tr>
                    <td>
                      <div className="form-check d-flex align-items-center mb-0">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="name1"
                        />
                        <label className="form-check-label" htmlFor="name1">
                          Invoice
                        </label>
                      </div>
                    </td>
                    <td className="text-end">Jan 4, 2022</td>
                    <td className="text-end">Jan 4, 2022</td>
                  </tr>
                  <tr>
                    <td>
                      <div className="form-check d-flex align-items-center mb-0">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="name1"
                        />
                        <label className="form-check-label" htmlFor="name1">
                          Invoice
                        </label>
                      </div>
                    </td>
                    <td className="text-end">Jan 4, 2022</td>
                    <td className="text-end">Jan 4, 2022</td>
                  </tr>
                  <tr>
                    <td>
                      <div className="form-check d-flex align-items-center mb-0">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="name1"
                        />
                        <label className="form-check-label" htmlFor="name1">
                          Invoice
                        </label>
                      </div>
                    </td>
                    <td className="text-end">Jan 4, 2022</td>
                    <td className="text-end">Jan 4, 2022</td>
                  </tr>
                  <tr>
                    <td>
                      <div className="form-check d-flex align-items-center mb-0">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="name1"
                        />
                        <label className="form-check-label" htmlFor="name1">
                          Invoice
                        </label>
                      </div>
                    </td>
                    <td className="text-end">Jan 4, 2022</td>
                    <td className="text-end">Jan 4, 2022</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div> */}
      </div>
      </Elements>
    </>
  );
};

export default Billing;
