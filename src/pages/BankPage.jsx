import { useState, useEffect } from 'react';
import { bankDatabase } from '../utils/database';
import './BankPage.css';

function BankPage({ character }) {
  const [bankData, setBankData] = useState({ balance: 0, transactions: [] });
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [transactionType, setTransactionType] = useState('deposit');

  const loadBankData = () => {
    const data = bankDatabase.getBank(character.id);
    setBankData(data);
  };

  useEffect(() => {
    if (character) {
      loadBankData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [character]);

  const handleTransaction = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const finalAmount = transactionType === 'deposit' ? numAmount : -numAmount;
    const finalDescription = description.trim() || (transactionType === 'deposit' ? 'Deposit' : 'Withdrawal');
    
    const updated = bankDatabase.updateBalance(character.id, finalAmount, finalDescription);
    setBankData(updated);
    setAmount('');
    setDescription('');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (!character) {
    return (
      <div className="bank-page">
        <div className="card">
          <h2>No Character Selected</h2>
          <p>Please select a character to view their bank account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bank-page">
      <div className="bank-header">
        <h1>🏦 Hunter's Bank</h1>
        <div className="account-name">{character.name}'s Account</div>
      </div>

      <div className="bank-layout">
        {/* Balance Card */}
        <div className="card balance-card">
          <div className="balance-label">Current Balance</div>
          <div className="balance-amount">{formatCurrency(bankData.balance)}</div>
          <div className="balance-subtext">Available Funds</div>
        </div>

        {/* Transaction Form */}
        <div className="card transaction-form">
          <div className="card-header">💰 New Transaction</div>
          
          <div className="transaction-type-selector">
            <button
              className={`btn ${transactionType === 'deposit' ? 'btn-success' : 'btn-secondary'}`}
              onClick={() => setTransactionType('deposit')}
            >
              ➕ Deposit
            </button>
            <button
              className={`btn ${transactionType === 'withdrawal' ? 'btn-danger' : 'btn-secondary'}`}
              onClick={() => setTransactionType('withdrawal')}
            >
              ➖ Withdraw
            </button>
          </div>

          <div className="form-group">
            <label>Amount</label>
            <div className="amount-input-wrapper">
              <span className="currency-symbol">$</span>
              <input
                type="number"
                className="input amount-input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description (Optional)</label>
            <input
              type="text"
              className="input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this for?"
            />
          </div>

          <button
            className={`btn ${transactionType === 'deposit' ? 'btn-success' : 'btn-danger'} submit-btn`}
            onClick={handleTransaction}
          >
            {transactionType === 'deposit' ? '💵 Make Deposit' : '💸 Make Withdrawal'}
          </button>
        </div>

        {/* Transaction History */}
        <div className="card transaction-history">
          <div className="card-header">📜 Transaction History</div>
          
          {bankData.transactions.length === 0 ? (
            <div className="empty-transactions">
              <p>No transactions yet</p>
              <p className="empty-subtext">Make your first deposit or withdrawal to get started!</p>
            </div>
          ) : (
            <div className="transactions-list">
              {bankData.transactions.map(transaction => (
                <div key={transaction.id} className="transaction-item">
                  <div className="transaction-icon">
                    {transaction.amount > 0 ? '💰' : '💸'}
                  </div>
                  <div className="transaction-details">
                    <div className="transaction-description">
                      {transaction.description}
                    </div>
                    <div className="transaction-date">
                      {formatDate(transaction.timestamp)}
                    </div>
                  </div>
                  <div className={`transaction-amount ${transaction.amount > 0 ? 'positive' : 'negative'}`}>
                    {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                  </div>
                  <div className="transaction-balance">
                    Balance: {formatCurrency(transaction.balance)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card quick-actions">
          <div className="card-header">⚡ Quick Actions</div>
          <div className="quick-actions-grid">
            <button
              className="btn btn-success"
              onClick={() => {
                setAmount('100');
                setTransactionType('deposit');
              }}
            >
              +$100
            </button>
            <button
              className="btn btn-success"
              onClick={() => {
                setAmount('500');
                setTransactionType('deposit');
              }}
            >
              +$500
            </button>
            <button
              className="btn btn-danger"
              onClick={() => {
                setAmount('50');
                setTransactionType('withdrawal');
              }}
            >
              -$50
            </button>
            <button
              className="btn btn-danger"
              onClick={() => {
                setAmount('200');
                setTransactionType('withdrawal');
              }}
            >
              -$200
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BankPage;
