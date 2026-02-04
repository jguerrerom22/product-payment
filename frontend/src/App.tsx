import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { type RootState } from './store';
import { type Product } from './store/products/productSlice';
import ProductList from './components/ProductList';
import PaymentModal from './components/PaymentModal';
import ResultPage from './components/ResultPage';

const AppContainer = styled.div`
  font-family: 'Inter', sans-serif;
  background-color: #f5f7fa;
  min-height: 100vh;
`;

const App = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(() => {
    const saved = localStorage.getItem('payment_gateway_selected_product');
    return saved ? JSON.parse(saved) : null;
  });
  
  const { status, transactionResult } = useSelector((state: RootState) => state.transaction);

  useEffect(() => {
    if (selectedProduct) {
      localStorage.setItem('payment_gateway_selected_product', JSON.stringify(selectedProduct));
    } else {
      // Only remove if it's explicitly null (not just during initial load if it was already null)
      localStorage.removeItem('payment_gateway_selected_product');
      localStorage.removeItem('payment_gateway_payment_step');
    }
  }, [selectedProduct]);

  useEffect(() => {
    if (status === 'succeeded') {
      localStorage.removeItem('payment_gateway_selected_product');
      localStorage.removeItem('payment_gateway_payment_step');
      localStorage.removeItem('payment_gateway_payment_form');
    }
  }, [status]);

  const showResult = (status === 'succeeded' || status === 'failed') || (status === 'loading' && !!transactionResult);

  if (showResult) {
    return (
      <AppContainer>
        <ResultPage onBack={() => setSelectedProduct(null)} />
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <ProductList onSelectProduct={setSelectedProduct} />
      {selectedProduct && (
        <PaymentModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </AppContainer>
  );
};

export default App;
