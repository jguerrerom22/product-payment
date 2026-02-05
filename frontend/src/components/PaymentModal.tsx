import React, { useState } from 'react';
import styled from 'styled-components';
import { type Product } from '../store/products/productSlice';
import { luhnCheck, getCardType, formatCurrency } from '../utils/validation';
import { useDispatch, useSelector } from 'react-redux';
import { createTransaction } from '../store/transaction/transactionSlice';
import { type AppDispatch, type RootState } from '../store';
import Cards from 'react-credit-cards-2';
import 'react-credit-cards-2/dist/es/styles-compiled.css';
import { IMaskInput } from 'react-imask';

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalContainer = styled.div`
  background: white;
  padding: 32px;
  border-radius: 16px;
  width: 95%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0,0,0,0.25);
  position: relative;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-sizing: border-box; /* Fixes width calculation with padding */

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  /* Responsive padding */
  @media (max-width: 480px) {
    padding: 24px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: transparent;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  color: #888;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  transition: all 0.2s;
  margin-top: 0;

  &:hover {
    background-color: #f5f5f5;
    color: #333;
    transform: rotate(90deg);
  }
`;

const Title = styled.h2`
  margin-top: 0;
  color: #1a1a1a;
  text-align: center;
  margin-bottom: 24px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 600;
  color: #444;
  font-size: 0.9rem;
  margin-left: 2px;
`;

// Styled component for IMaskInput
const StyledIMaskInput = styled(IMaskInput)`
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  background-color: #fafafa;
  width: 100%;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #1976d2;
    background-color: #fff;
    box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
  }
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  background-color: #fafafa;
  width: 100%;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #1976d2;
    background-color: #fff;
    box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
  }
`;

const Button = styled.button`
  padding: 14px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 24px;
  transition: transform 0.1s, background-color 0.2s;
  
  &:hover {
    background-color: #1565c0;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background-color: #e0e0e0;
    color: #9e9e9e;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorText = styled.span`
  color: #d32f2f;
  font-size: 0.85rem;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.95rem;
  
  &.total {
    font-weight: bold;
    font-size: 1.1rem;
    margin-top: 16px;
    border-top: 1px solid #eee;
    padding-top: 16px;
  }
`;

const CardWrapper = styled.div`
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
`;

const Row = styled.div`
  display: flex;
  gap: 16px;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 16px;
  }
`;

interface PaymentModalProps {
  product: Product;
  onClose: () => void;
}

interface PaymentFormData {
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  cvv: string;
  email: string;
  fullName: string;
  address: string;
  city: string;
  phone: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ product, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { status: requestStatus } = useSelector((state: RootState) => state.transaction);
  const [step, setStep] = useState<'form' | 'summary'>(() => {
    return (localStorage.getItem('payment_gateway_payment_step') as 'form' | 'summary') || 'form';
  });

  React.useEffect(() => {
    localStorage.setItem('payment_gateway_payment_step', step);
  }, [step]);
  
  const [formData, setFormData] = useState<PaymentFormData>(() => {
    const savedData = localStorage.getItem('payment_gateway_payment_form');
    const baseState: PaymentFormData = {
      cardNumber: '',
      cardHolder: '',
      expiry: '',
      cvv: '',
      email: '',
      fullName: '',
      address: '',
      city: '',
      phone: ''
    };
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        return { ...baseState, ...parsed, cvv: '' };
      } catch (e) {
        console.error('Failed to parse saved form data', e);
      }
    }
    return baseState;
  });

  // Save to localStorage on change
  React.useEffect(() => {
    const { cvv, ...dataToSave } = formData;
    localStorage.setItem('payment_gateway_payment_form', JSON.stringify(dataToSave));
  }, [formData]);

  const [focus, setFocus] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const cardType = getCardType(formData.cardNumber.replace(/\s/g, ''));
  const BASE_FEE = 5000;
  const DELIVERY_FEE = 10000;
  const TOTAL = Number(product.price) + BASE_FEE + DELIVERY_FEE;

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocus(e.target.name);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const cleanCard = formData.cardNumber.replace(/\s/g, '');
    
    if (!luhnCheck(cleanCard)) newErrors.cardNumber = 'Invalid Card Number';
    if (cardType === 'UNKNOWN') newErrors.cardNumber = 'Unsupported Card Type (Visa/Mastercard only)';
    if (!formData.cardHolder) newErrors.cardHolder = 'Required';
    if (formData.cardHolder.length < 5) newErrors.cardHolder = 'Cardholder name must be at least 5 characters long';
    if (!formData.expiry) newErrors.expiry = 'Required';
    if (!formData.cvv) newErrors.cvv = 'Required';
    if (!formData.fullName) newErrors.fullName = 'Required';
    if (!formData.email) {
      newErrors.email = 'Required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email';
    }
    if (!formData.phone) newErrors.phone = 'Required';
    if (!formData.address) newErrors.address = 'Required';
    if (!formData.city) newErrors.city = 'Required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setStep('summary');
    }
  };

  const handlePayment = () => {
    const [expMonth, expYear] = formData.expiry.split('/');
    dispatch(createTransaction({
      productId: product.id,
      amount: TOTAL,
      customerEmail: formData.email,
      customerName: formData.fullName,
      customerPhone: formData.phone,
      deliveryInfo: {
        address: formData.address,
        city: formData.city,
        phone: formData.phone
      },
      paymentInfo: {
        number: formData.cardNumber.replace(/\s/g, ''),
        cvc: formData.cvv,
        exp_month: expMonth,
        exp_year: expYear,
        card_holder: formData.cardHolder,
        installments: 1
      }
    }));
    // Clear persisted data on successful submission
    localStorage.removeItem('payment_gateway_payment_form');
  };

  return (
    <Backdrop onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose} aria-label="Close modal">&times;</CloseButton>
        {step === 'form' ? (
          <>
            <Title>Checkout</Title>
            
            <CardWrapper>
              <Cards
                number={formData.cardNumber}
                expiry={formData.expiry}
                cvc={formData.cvv}
                name={formData.cardHolder}
                focused={focus as any}
              />
            </CardWrapper>

            <Form onSubmit={handleNext}>
              <FormGroup>
                <Label htmlFor="cardNumber">Card Number</Label>
                <StyledIMaskInput
                  id="cardNumber"
                  mask="0000 0000 0000 0000"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onAccept={(value: string) => 
                    setFormData(prev => ({ ...prev, cardNumber: value }))
                  }
                  onFocus={handleInputFocus}
                  placeholder="0000 0000 0000 0000"
                />
                {errors.cardNumber && <ErrorText>{errors.cardNumber}</ErrorText>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="cardHolder">Card Holder Name</Label>
                <Input 
                  id="cardHolder"
                  name="cardHolder" 
                  value={formData.cardHolder} 
                  onChange={handleChange}
                  onFocus={handleInputFocus}
                  placeholder="JOHN DOE"
                  min={5}
                />
                {errors.cardHolder && <ErrorText>{errors.cardHolder}</ErrorText>}
              </FormGroup>

              <Row>
                <FormGroup style={{ flex: 1 }}>
                  <Label htmlFor="expiry">Expiry (MM/YY)</Label>
                  <StyledIMaskInput
                    id="expiry"
                    mask="00/00"
                    name="expiry"
                    value={formData.expiry}
                    onAccept={(value: string) => 
                      setFormData(prev => ({ ...prev, expiry: value }))
                    }
                    onFocus={handleInputFocus}
                    placeholder="MM/YY"
                  />
                  {errors.expiry && <ErrorText>{errors.expiry}</ErrorText>}
                </FormGroup>
                <FormGroup style={{ flex: 1 }}>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input 
                    id="cvv"
                    name="cvv" 
                    value={formData.cvv} 
                    onChange={handleChange}
                    onFocus={handleInputFocus}
                    placeholder="123"
                    maxLength={4}
                  />
                  {errors.cvv && <ErrorText>{errors.cvv}</ErrorText>}
                </FormGroup>
              </Row>

              <h3 style={{ margin: '16px 0 8px' }}>Customer Info</h3>
              
              <FormGroup>
                <Label htmlFor="fullName">Full Name</Label>
                <Input 
                  id="fullName"
                  name="fullName" 
                  value={formData.fullName} 
                  onChange={handleChange}
                  onFocus={handleInputFocus}
                  placeholder="John Doe"
                />
                {errors.fullName && <ErrorText>{errors.fullName}</ErrorText>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  name="email" 
                  type="email"
                  value={formData.email} 
                  onChange={handleChange}
                  onFocus={handleInputFocus}
                  placeholder="john@example.com"
                />
                {errors.email && <ErrorText>{errors.email}</ErrorText>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone"
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange}
                  onFocus={handleInputFocus}
                  placeholder="3001234567"
                />
                {errors.phone && <ErrorText>{errors.phone}</ErrorText>}
              </FormGroup>

              <h3 style={{ margin: '16px 0 8px' }}>Delivery Info</h3>
              
              <FormGroup>
                <Label htmlFor="address">Address</Label>
                <Input 
                  id="address"
                  name="address" 
                  value={formData.address} 
                  onChange={handleChange}
                  onFocus={handleInputFocus}
                />
                {errors.address && <ErrorText>{errors.address}</ErrorText>}
              </FormGroup>
              
              <Row>
                <FormGroup style={{ flex: 1 }}>
                  <Label htmlFor="city">City</Label>
                  <Input 
                    id="city"
                    name="city" 
                    value={formData.city} 
                    onChange={handleChange}
                    onFocus={handleInputFocus}
                  />
                  {errors.city && <ErrorText>{errors.city}</ErrorText>}
                </FormGroup>
              </Row>

              <Button type="submit">Validate and Continue</Button>
            </Form>
          </>
        ) : (
          <>
            <Title>Payment Summary</Title>
            <div style={{ marginBottom: '32px', margin: '16px' }}> {/* Added margin */}
              <SummaryRow>
                <span>Product:</span>
                <span>{product.name}</span>
              </SummaryRow>
              <SummaryRow>
                <span>Price:</span>
                <span>{formatCurrency(product.price)}</span>
              </SummaryRow>
              <SummaryRow>
                <span>Base Fee:</span>
                <span>{formatCurrency(BASE_FEE)}</span>
              </SummaryRow>
              <SummaryRow>
                <span>Delivery Fee:</span>
                <span>{formatCurrency(DELIVERY_FEE)}</span>
              </SummaryRow>
              <SummaryRow className="total">
                <span>Total:</span>
                <span>{formatCurrency(TOTAL)}</span>
              </SummaryRow>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
               <Button type="button" onClick={() => setStep('form')} style={{ background: '#757575'}} disabled={requestStatus === 'loading'}>Back</Button>
               <Button onClick={handlePayment} style={{ flex: 1 }} disabled={requestStatus === 'loading'}>
                 {requestStatus === 'loading' ? 'Processing...' : `Pay ${formatCurrency(TOTAL)}`}
               </Button>
            </div>
          </>
        )}
      </ModalContainer>
    </Backdrop>
  );
};

export default PaymentModal;
