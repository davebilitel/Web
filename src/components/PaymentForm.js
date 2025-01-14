import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LoadingOverlay from './LoadingOverlay';
import PaymentMethodSelector from './PaymentMethodSelector';

function PaymentForm() {
  const [step, setStep] = useState(1); // 1: method selection, 2: payment form
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    amount: '',
    country: 'CM'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const navigate = useNavigate();

  const checkPaymentStatus = async (reference) => {
    try {
      const response = await axios.get(`http://localhost:5001/api/check-payment-status/${reference}`);
      if (response.data.status === 'SUCCESSFUL') {
        navigate('/success');
      } else if (response.data.status === 'FAILED') {
        navigate('/failed');
      }
      return response.data.status;
    } catch (error) {
      console.error('Error checking payment status:', error);
      return null;
    }
  };

  useEffect(() => {
    let statusInterval;
    if (paymentStatus === 'PENDING' && paymentInfo?.reference) {
      statusInterval = setInterval(async () => {
        const status = await checkPaymentStatus(paymentInfo.reference);
        if (status && status !== 'PENDING') {
          setPaymentStatus(status);
          clearInterval(statusInterval);
        }
      }, 5000); // Check every 5 seconds
    }
    return () => {
      if (statusInterval) clearInterval(statusInterval);
    };
  }, [paymentStatus, paymentInfo]);

  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method);
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
        // Format phone number for Campay
        const formattedData = {
            ...formData,
            phone: paymentMethod === 'campay' ? 
                (formData.phone.startsWith('237') ? formData.phone : '237' + formData.phone.replace(/^\+/, '')) :
                formData.phone
        };

        const endpoint = paymentMethod === 'campay' 
            ? '/api/initiate-campay-payment'
            : '/api/initiate-flutterwave-payment';

        const response = await axios.post(`http://localhost:5001${endpoint}`, formattedData);
        setPaymentInfo(response.data);
        setPaymentStatus('PENDING');

        if (paymentMethod === 'flutterwave') {
            // Flutterwave specific handling
            const checkStatus = setInterval(async () => {
                try {
                    const statusResponse = await axios.get(
                        `http://localhost:5001/api/check-flw-payment-status/${response.data.tx_ref}`
                    );
                    
                    if (statusResponse.data.status === 'successful') {
                        clearInterval(checkStatus);
                        navigate('/success');
                    } else if (statusResponse.data.status === 'failed') {
                        clearInterval(checkStatus);
                        navigate('/failed');
                    }
                } catch (error) {
                    console.error('Error checking payment status:', error);
                }
            }, 5000);

            setTimeout(() => clearInterval(checkStatus), 300000);

            if (response.data.data?.ussd_code) {
                setPaymentInfo({
                    ...response.data,
                    ussd_code: response.data.data.ussd_code
                });
            }
        } else {
            // Campay specific handling
            if (response.data.reference) {
                const checkStatus = setInterval(async () => {
                    try {
                        const status = await checkPaymentStatus(response.data.reference);
                        if (status && status !== 'PENDING') {
                            clearInterval(checkStatus);
                        }
                    } catch (error) {
                        console.error('Error checking payment status:', error);
                    }
                }, 5000);

                setTimeout(() => clearInterval(checkStatus), 300000);
            }

            if (response.data.ussd_code) {
                setPaymentInfo({
                    ...response.data,
                    ussd_code: response.data.ussd_code
                });
            }
        }
    } catch (error) {
        setError(error.response?.data?.error || 'Payment initiation failed');
        setPaymentStatus(null);
    } finally {
        setLoading(false);
    }
  };

  const handleChange = (e) => {
    let value = e.target.value;
    
    if (e.target.name === 'phone') {
        // Remove all non-digit characters except '+'
        value = value.replace(/[^\d+]/g, '');
        // Ensure only one '+' at the start
        if (value.startsWith('+')) {
            value = '+' + value.substring(1).replace(/\+/g, '');
        }
        // Remove '+237' or '237' prefix for cleaner input
        value = value.replace(/^\+?237/, '');
    } else if (e.target.name === 'amount') {
        value = value.replace(/[^\d]/g, '');
    }

    setFormData({
        ...formData,
        [e.target.name]: value
    });
  };

  return (
    <div className="form-container" style={styles.container}>
      {(loading || paymentStatus === 'PENDING') && (
        <LoadingOverlay 
          message={loading ? "Initiating payment..." : "Processing payment..."}
        />
      )}

      {step === 1 ? (
        <PaymentMethodSelector onSelect={handlePaymentMethodSelect} />
      ) : (
        <div style={styles.formWrapper}>
          <h1 style={styles.title}>
            Pay with {paymentMethod === 'campay' ? 'Campay' : 'Flutterwave'}
          </h1>
          {error && <div style={styles.error}>{error}</div>}
          
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={styles.input}
                placeholder="Enter your full name"
              />
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={styles.input}
                placeholder="Enter your email"
              />
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Phone Number:</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Example: 654719671"
                pattern="[\d\+]+"
                title="Please enter a valid phone number"
                required
                style={styles.input}
              />
              <small style={styles.hint}>
                Enter without country code - it will be added automatically
              </small>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Amount (XAF):</label>
              <input
                type="text"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                style={styles.input}
                placeholder="Enter amount in XAF"
                pattern="\d+"
                title="Please enter a valid amount"
              />
            </div>
            
            <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                    Country
                </label>
                <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                >
                    <option value="CM">Cameroon</option>
                    <option value="SN">Senegal</option>
                </select>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              style={{
                ...styles.button,
                ...(loading ? styles.buttonDisabled : {})
              }}
            >
              {loading ? 'Processing...' : 'Pay Now'}
            </button>
          </form>

          {paymentInfo?.ussd_code && (
            <div style={styles.ussdCode}>
              <h3 style={styles.ussdTitle}>USSD Code:</h3>
              <p style={styles.ussdText}>{paymentInfo.ussd_code}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: '20px'
  },
  formWrapper: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '500px'
  },
  title: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '2rem',
    fontSize: '2rem'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  label: {
    fontWeight: '500',
    color: '#444'
  },
  input: {
    padding: '0.75rem',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '1rem',
    transition: 'border-color 0.3s ease',
    ':focus': {
      borderColor: '#007bff',
      outline: 'none'
    }
  },
  hint: {
    fontSize: '0.8rem',
    color: '#666'
  },
  button: {
    padding: '1rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    marginTop: '1rem',
    ':hover': {
      backgroundColor: '#0056b3'
    }
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed'
  },
  error: {
    backgroundColor: '#fff3f3',
    color: '#dc3545',
    padding: '0.75rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    border: '1px solid #ffcdd2'
  },
  ussdCode: {
    marginTop: '2rem',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    textAlign: 'center'
  },
  ussdTitle: {
    color: '#333',
    marginBottom: '0.5rem'
  },
  ussdText: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#007bff'
  }
};

export default PaymentForm; 