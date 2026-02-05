import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { type RootState } from './store';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import PaymentModal from './components/PaymentModal';
import ResultPage from './components/ResultPage';

const AppContainer = styled.div`
  font-family: 'Inter', sans-serif;
  background-color: #f5f7fa;
  min-height: 100vh;
`;

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const MainContent = () => {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const { status, transactionResult } = useSelector((state: RootState) => state.transaction);
  const navigate = useNavigate();

  useEffect(() => {
    if (status === 'succeeded' || status === 'failed') {
      setSelectedProduct(null);
      navigate('/result');
    }
  }, [status, navigate]);

  useEffect(() => {
    if (status === 'succeeded') {
      localStorage.removeItem('payment_gateway_selected_product');
      localStorage.removeItem('payment_gateway_payment_step');
      localStorage.removeItem('payment_gateway_payment_form');
    }
  }, [status]);

  return (
    <AppContainer>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<ProductList onSelectProduct={(p: any) => setSelectedProduct(p)} />} />
        <Route path="/product/:id" element={<ProductDetail onPay={(p: any) => setSelectedProduct(p)} />} />
        <Route 
          path="/result" 
          element={
            (status === 'succeeded' || status === 'failed' || (status === 'loading' && !!transactionResult)) 
              ? <ResultPage /> 
              : <Navigate to="/" />
          } 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {selectedProduct && (
        <PaymentModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </AppContainer>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <MainContent />
    </BrowserRouter>
  );
};

export default App;
