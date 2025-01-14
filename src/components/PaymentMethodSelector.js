import React from 'react';

function PaymentMethodSelector({ onSelect }) {
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Select Payment Method</h2>
      <div style={styles.buttonGroup}>
        <button 
          onClick={() => onSelect('campay')} 
          style={styles.button}
        >
          <span style={styles.buttonContent}>
            Pay with Campay
            <small style={styles.description}>Mobile Money Payment (MTN, Orange)</small>
          </span>
        </button>
        
        <button 
          onClick={() => onSelect('flutterwave')} 
          style={styles.button}
        >
          <span style={styles.buttonContent}>
            Pay with Flutterwave
            <small style={styles.description}>Mobile Money, Card, Bank Transfer</small>
          </span>
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    maxWidth: '500px',
    width: '100%'
  },
  title: {
    textAlign: 'center',
    marginBottom: '2rem',
    color: '#333'
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  button: {
    padding: '1.5rem',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    backgroundColor: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    ':hover': {
      borderColor: '#007bff',
      backgroundColor: '#f8f9fa'
    }
  },
  buttonContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    fontSize: '1.1rem',
    color: '#333'
  },
  description: {
    color: '#666',
    fontSize: '0.9rem'
  }
};

export default PaymentMethodSelector; 