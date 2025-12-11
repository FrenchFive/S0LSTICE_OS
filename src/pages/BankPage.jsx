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
        <div className="no-character">
          <span className="big-icon">🏦</span>
          <p>No Character Selected</p>
          <p className="hint">Please select a character to view their bank account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bank-page">
      <div className="bank-header">
        <h1>🏦 Hunter&apos;s Bank</h1>
        <div className="account-name">{character.name}&apos;s Account</div>
      </div>

      {/* Balance Card */}
      <div className="card balance-card">
        <div className="balance-label">Current Balance</div>
        <div className="balance-amount">{formatCurrency(bankData.balance)}</div>
        <div className="balance-subtext">Available Funds</div>
      </div>

      <div className="bank-content">
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
                </div>
              ))}
            </div>
          )}
          
          <div className="history-note">
            Only the last 5 transactions are shown
          </div>
        </div>
      </div>
    </div>
  );
}

export default BankPage;
