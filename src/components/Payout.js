import React, { useEffect, useState } from 'react';
import '../Styles/Payout.css';
import api from '../../src/Services/api';

const Payouts = () => {
  const [balance, setBalance] = useState(0);
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [amount, setAmount] = useState('');
  const [email, setEmail] = useState('');
  const [accountCreated, setAccountCreated] = useState(false); // Track if account is created
  const [message, setMessage] = useState(null);

  useEffect(() => {
    // Fetch seller balance and payout history
    api.getSellerBalance()
      .then((response) => {
        setBalance(response.data.balance);
        setPayoutHistory(response.data.payoutHistory);
      })
      .catch((error) => console.error('Error fetching payout data:', error));
  }, []);

  const handlePayoutRequest = () => {
    api.requestPayout({ amount: parseInt(amount, 10) * 100 })
      .then((response) => {
        if (response.data.success) {
          setMessage('Payout requested successfully!');
          setAmount(''); 
        } else {
          setMessage('Error processing payout.');
        }
      })
      .catch((error) => {
        console.error('Error requesting payout:', error);
        setMessage('Error processing payout.');
      });
  };

  const handleCreateAccount = () => {
    api.createConnectedAccount({ email })
      .then((response) => {
        if (response.data.accountId) {
          setAccountCreated(true);
          setMessage('Connected account created successfully!');
        } else {
          setMessage('Error creating connected account.');
        }
      })
      .catch((error) => {
        console.error('Error creating connected account:', error);
        setMessage('Error creating connected account.');
      });
  };

  return (
    <div className="payouts-page">
      <h2>Your Balance</h2>
      <p>${(balance / 100).toFixed(2)}</p>

      <h2>Payout History</h2>
      <ul>
        {payoutHistory.map((payout) => (
          <li key={payout.id}>
            ${payout.amount / 100} - {new Date(payout.date).toLocaleDateString()}
          </li>
        ))}
      </ul>

      {!accountCreated && (
        <>
          <h2>Create Connected Account</h2>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
          <button onClick={handleCreateAccount}>Create Account</button>
        </>
      )}

      {accountCreated && (
        <>
          <h2>Request Payout</h2>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount in dollars"
          />
          <button onClick={handlePayoutRequest}>Request Payout</button>
        </>
      )}

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default Payouts;
