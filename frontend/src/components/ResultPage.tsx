import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { type RootState, type AppDispatch } from '../store';
import { resetTransaction, checkTransactionStatus } from '../store/transaction/transactionSlice';
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

const Icon = styled.div<{ $status: 'APPROVED' | 'PENDING' | 'FAILED' }>`
  font-size: 5rem;
  color: ${props => {
    if (props.$status === 'APPROVED') return '#2e7d32';
    if (props.$status === 'PENDING') return '#f9a825';
    return '#d32f2f';
  }};
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
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

  &:disabled {
    background-color: #bdbdbd;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled(Button)`
  background-color: #757575;
  &:hover {
    background-color: #616161;
  }
`;

interface ResultPageProps {
  onBack: () => void;
}

const ResultPage: React.FC<ResultPageProps> = ({ onBack }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { status, transactionResult, error } = useSelector((state: RootState) => state.transaction);

  useEffect(() => {
    // If successful (and approved) transaction, refresh product list to update stock
    if (status === 'succeeded' && transactionResult?.status === 'APPROVED') {
      dispatch(fetchProducts());
    }
  }, [status, transactionResult?.status, dispatch]);

  const handleBack = () => {
    dispatch(resetTransaction());
    onBack();
  };

  const handleCheckStatus = () => {
    if (transactionResult?.id) {
      dispatch(checkTransactionStatus(transactionResult.id));
    }
  };

  const isApproved = transactionResult?.status === 'APPROVED';
  const isPending = transactionResult?.status === 'PENDING';
  const isLoading = status === 'loading';

  const getStatusType = (): 'APPROVED' | 'PENDING' | 'FAILED' => {
    if (isApproved) return 'APPROVED';
    if (isPending) return 'PENDING';
    return 'FAILED';
  };

  return (
    <Container>
      <Icon $status={getStatusType()}>
        {isApproved ? '✅' : isPending ? '⏳' : '❌'}
      </Icon>
      <Message>
        {isApproved ? 'Transaction Successful!' : isPending ? 'Transaction Pending' : 'Transaction Failed'}
      </Message>
      
      {(isApproved || isPending) && (
        <Reference>Transaction ID: {transactionResult.id}</Reference>
      )}
      
      {!isApproved && !isPending && (
        <Reference>Reason: {error || transactionResult?.status || 'Unknown error'}</Reference>
      )}

      {isPending && (
        <p style={{ marginBottom: '32px', color: '#666' }}>
          Your transaction is being processed. You can manually check its status.
        </p>
      )}

      <ButtonGroup>
        <SecondaryButton onClick={handleBack} disabled={isLoading}>Back to Store</SecondaryButton>
        {isPending && (
          <Button onClick={handleCheckStatus} disabled={isLoading}>
            {isLoading ? 'Checking...' : 'Update Status'}
          </Button>
        )}
      </ButtonGroup>
    </Container>
  );
};

export default ResultPage;
