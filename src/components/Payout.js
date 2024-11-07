import React, { useEffect, useState } from 'react';
import '../Styles/Payout.css';

const Payouts = () => {
  const [balance, setBalance] = useState(0);
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState(null);

  useEffect(() => {
    // Fetch seller balance and payout history
    fetch('/api/payout/seller-balance')
      .then((response) => response.json())
      .then((data) => {
        setBalance(data.balance);
        setPayoutHistory(data.payoutHistory);
      })
      .catch((error) => console.error('Error fetching payout data:', error));
  }, []);

  const handlePayoutRequest = () => {
    fetch('/api/payout/request-payout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: parseInt(amount, 10) * 100 }), // Amount in cents
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
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

      <h2>Request Payout</h2>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount in dollars"
      />
      <button onClick={handlePayoutRequest}>Request Payout</button>

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default Payouts;
