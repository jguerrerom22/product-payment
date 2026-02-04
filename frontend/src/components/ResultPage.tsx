import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { type RootState, type AppDispatch } from '../store';
import { resetTransaction } from '../store/transaction/transactionSlice';
import { fetchProducts } from '../store/products/productSlice'; // Update stock

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 80vh;
  text-align: center;
  padding: 20px;
`;

const Icon = styled.div<{ $success: boolean }>`
  font-size: 5rem;
  color: ${props => props.$success ? '#2e7d32' : '#d32f2f'};
  margin-bottom: 24px;
`;

const Message = styled.h2`
  color: #333;
  margin-bottom: 16px;
`;

const Reference = styled.p`
  color: #666;
  margin-bottom: 32px;
`;

const Button = styled.button`
  padding: 12px 24px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  
  &:hover {
    background-color: #1565c0;
  }
`;

interface ResultPageProps {
  onBack: () => void;
}

const ResultPage: React.FC<ResultPageProps> = ({ onBack }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { status, transactionResult, error } = useSelector((state: RootState) => state.transaction);

  useEffect(() => {
    // If successful transaction, refresh product list to update stock
    if (status === 'succeeded') {
      dispatch(fetchProducts());
    }
  }, [status, dispatch]);

  const handleBack = () => {
    dispatch(resetTransaction());
    onBack();
  };

  const isSuccess = status === 'succeeded' && transactionResult?.status === 'APPROVED';

  return (
    <Container>
      <Icon $success={isSuccess}>
        {isSuccess ? '✅' : '❌'}
      </Icon>
      <Message>
        {isSuccess ? 'Transaction Successful!' : 'Transaction Failed'}
      </Message>
      {isSuccess && (
        <Reference>Transaction ID: {transactionResult.id}</Reference>
      )}
      {!isSuccess && (
        <Reference>Reason: {error || transactionResult?.status || 'Unknown error'}</Reference>
      )}
      <Button onClick={handleBack}>Back to Store</Button>
    </Container>
  );
};

export default ResultPage;
