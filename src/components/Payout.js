import React, { useEffect, useState } from 'react';
import '../Styles/Payout.css';
import api from '../../src/Services/api';

const Payouts = () => {
  const [balance, setBalance] = useState(0);
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [amount, setAmount] = useState('');
  const [email, setEmail] = useState('');
  const [accountCreated, setAccountCreated] = useState(false); // Track if account is created
  const [bankAccountAdded, setBankAccountAdded] = useState(false); // Track if bank account is added
  const [message, setMessage] = useState(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [holderName, setHolderName] = useState('');

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
    if (!bankAccountAdded) {
      setMessage('Please add a bank account before requesting a payout.');
      return;
    }

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

  const handleAddBankAccount = () => {
    api.addBankAccount({
      accountId: '<CONNECTED_ACCOUNT_ID>', // You will need to dynamically assign this
      bankAccountDetails: {
        accountNumber,
        routingNumber,
        holderName,
      },
    })
      .then((response) => {
        setMessage('Bank account added successfully!');
        setBankAccountAdded(true); // Update state to show bank account has been added
      })
      .catch((error) => {
        console.error('Error adding bank account:', error);
        setMessage('Error adding bank account.');
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

      {accountCreated && !bankAccountAdded && (
        <>
          <h2>Add Bank Account</h2>
          <input
            type="text"
            value={holderName}
            onChange={(e) => setHolderName(e.target.value)}
            placeholder="Account Holder Name"
          />
          <input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="Account Number"
          />
          <input
            type="text"
            value={routingNumber}
            onChange={(e) => setRoutingNumber(e.target.value)}
            placeholder="Routing Number"
          />
          <button onClick={handleAddBankAccount}>Add Bank Account</button>
        </>
      )}

      {accountCreated && bankAccountAdded && (
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
