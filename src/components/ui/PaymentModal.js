import { CreditCard, Gift, Lock, X } from 'lucide-react';
import React, { useEffect, useId, useState } from 'react';
import './PaymentModal.css';

export default function PaymentModal({ isOpen, plan, onClose, onPaid }) {
  const id = useId();
  const [couponCode, setCouponCode] = useState('');
  const [showCouponInput, setShowCouponInput] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setCouponCode('');
      setShowCouponInput(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedPlan = plan || {
    duration: 'FiiFit Online',
    price: '275€',
    description: 'Acces complet la program'
  };

  const handlePayNow = (event) => {
    event.preventDefault();
    onPaid();
  };

  return (
    <div className="payment-modal" role="dialog" aria-modal="true" aria-labelledby={`payment-title-${id}`}>
      <button className="payment-backdrop" type="button" aria-label="Inchide plata" onClick={onClose}></button>

      <div className="payment-content">
        <button className="payment-close" type="button" onClick={onClose} aria-label="Inchide">
          <X size={18} strokeWidth={2.2} aria-hidden="true" />
        </button>

        <div className="payment-header">
          <span className="payment-lock">
            <Lock size={17} strokeWidth={2.2} aria-hidden="true" />
          </span>
          <h2 id={`payment-title-${id}`}>Secure Payment</h2>
          <p>Enter your card details to complete the payment.</p>
        </div>

        <div className="payment-plan">
          <div>
            <span>{selectedPlan.duration}</span>
            <strong>{selectedPlan.description}</strong>
          </div>
          <p>{selectedPlan.price}</p>
        </div>

        <form className="payment-form" onSubmit={handlePayNow} noValidate>
          <div className="payment-field">
            <label htmlFor={`card-name-${id}`}>Cardholder Name</label>
            <input id={`card-name-${id}`} placeholder="Jane Doe" required autoComplete="cc-name" />
          </div>

          <div className="payment-field">
            <label htmlFor={`card-number-${id}`}>Card Number</label>
            <div className="payment-input-icon">
              <input
                id={`card-number-${id}`}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                required
                inputMode="numeric"
                autoComplete="cc-number"
              />
              <CreditCard size={16} strokeWidth={2.2} aria-hidden="true" />
            </div>
          </div>

          <div className="payment-split">
            <div className="payment-field">
              <label htmlFor={`expiry-${id}`}>Expiry</label>
              <input id={`expiry-${id}`} placeholder="MM/YY" maxLength={5} required autoComplete="cc-exp" />
            </div>
            <div className="payment-field">
              <label htmlFor={`cvc-${id}`}>CVC</label>
              <input id={`cvc-${id}`} placeholder="123" maxLength={4} required inputMode="numeric" autoComplete="cc-csc" />
            </div>
          </div>

          {!showCouponInput ? (
            <button type="button" className="coupon-toggle" onClick={() => setShowCouponInput(true)}>
              <Gift size={15} strokeWidth={2.2} aria-hidden="true" />
              Apply Coupon
            </button>
          ) : (
            <div className="payment-field">
              <label htmlFor={`coupon-${id}`}>Coupon Code</label>
              <input
                id={`coupon-${id}`}
                placeholder="Enter your code"
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value)}
              />
            </div>
          )}

          <button type="submit" className="pay-now-button">
            Pay Now
          </button>
        </form>

        <p className="payment-note">Payments are secure and non-refundable. Cancel anytime.</p>
      </div>
    </div>
  );
}
