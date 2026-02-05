import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled, { keyframes } from 'styled-components';
import { type RootState, type AppDispatch } from '../store';
import { fetchProducts, type Product } from '../store/products/productSlice';
import { formatCurrency } from '../utils/validation';
import { SkeletonImage, SkeletonTitle, SkeletonText, SkeletonButton } from './Skeleton';

const Container = styled.div`
  max-width: 1000px;
  margin: 40px auto;
  margin-top: 0;
  padding: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 40px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16/10;
  border-radius: 12px;
  overflow: hidden;
  background: #f9f9f9;
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const StyledImage = styled.img<{ $loaded: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  opacity: ${props => props.$loaded ? 1 : 0};
  transition: opacity 0.5s ease;
  animation: ${props => props.$loaded ? fadeIn : 'none'} 0.5s ease;
`;

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #222;
  margin-bottom: 12px;
`;

const Price = styled.div`
  font-size: 2.2rem;
  color: #2e7d32;
  font-weight: bold;
  margin-bottom: 20px;
`;

const StockInfo = styled.div<{ $low: boolean }>`
  font-size: 1rem;
  color: ${props => props.$low ? '#d32f2f' : '#1976d2'};
  margin-bottom: 24px;
  font-weight: 500;
  background: ${props => props.$low ? '#ffebee' : '#e3f2fd'};
  padding: 8px 16px;
  border-radius: 8px;
  width: fit-content;
`;

const DescriptionTitle = styled.h3`
  font-size: 1.2rem;
  color: #444;
  margin-bottom: 12px;
`;

const Description = styled.p`
  font-size: 1.1rem;
  line-height: 1.6;
  color: #666;
  margin-bottom: 40px;
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 16px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);

  &:hover {
    background: #1565c0;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(25, 118, 210, 0.4);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  color: #1976d2;
  text-decoration: none;
  margin-bottom: 20px;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ImageError = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  color: #999;
`;

interface ProductDetailProps {
  onPay: (product: Product) => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ onPay }) => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { items, status } = useSelector((state: RootState) => state.products);
  
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const product = items.find(p => p.id === Number(id));

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProducts());
    }
  }, [status, dispatch]);

  if (status === 'loading') {
    return (
      <Container>
        <SkeletonImage style={{ height: '400px' }} />
        <InfoContainer>
          <SkeletonTitle />
          <SkeletonText />
          <SkeletonText />
          <SkeletonButton />
        </InfoContainer>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container style={{ textAlign: 'center', display: 'block' }}>
        <h2>Product not found</h2>
        <BackLink to="/">Back to products</BackLink>
      </Container>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <BackLink to="/">← Back to products</BackLink>
      </div>
      <Container>
        <ImageContainer>
          {!loaded && !error && <SkeletonImage style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />}
          {error ? (
            <ImageError>Image not available</ImageError>
          ) : (
            <StyledImage 
              src={product.img_url} 
              alt={product.name} 
              $loaded={loaded}
              onLoad={() => setLoaded(true)}
              onError={() => setError(true)}
              loading="eager"
            />
          )}
        </ImageContainer>
        <InfoContainer>
          <Title>{product.name}</Title>
          <Price>{formatCurrency(Number(product.price))}</Price>
          <StockInfo $low={product.stock < 10}>
            {product.stock > 0 ? `${product.stock} units available` : 'Out of stock'}
          </StockInfo>
          <DescriptionTitle>Description</DescriptionTitle>
          <Description>{product.description}</Description>
          <ActionButton 
            onClick={() => onPay(product)}
            disabled={product.stock === 0}
          >
            {product.stock > 0 ? 'Buy Now with Card' : 'Out of Stock'}
          </ActionButton>
        </InfoContainer>
      </Container>
    </div>
  );
};

export default ProductDetail;
