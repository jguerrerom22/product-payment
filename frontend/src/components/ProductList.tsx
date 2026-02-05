import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, type Product } from '../store/products/productSlice';
import { type AppDispatch, type RootState } from '../store';
import styled, { keyframes } from 'styled-components';
import { formatCurrency } from '../utils/validation';
import { SkeletonImage, SkeletonTitle, SkeletonText, SkeletonButton } from './Skeleton';

const Container = styled.div`
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
`;

const Header = styled.h1`
  text-align: center;
  color: #333;
  margin-bottom: 24px;
  font-size: 1.8rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  transition: transform 0.2s;
  background: white;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 12px rgba(0,0,0,0.1);
  }
`;

const ImageContainer = styled.div`
  width: 100%;
  height: 200px;
  position: relative;
  background-color: #f0f0f0;
  overflow: hidden;
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
  transition: opacity 0.4s ease-in-out;
  animation: ${props => props.$loaded ? fadeIn : 'none'} 0.4s ease-in-out;
`;

const ImageError = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  color: #999;
  font-size: 0.8rem;
  text-align: center;
  padding: 20px;
`;

const OptimizedImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  return (
    <ImageContainer>
      {!loaded && !error && <SkeletonImage style={{ position: 'absolute', top: 0, left: 0 }} />}
      {error ? (
        <ImageError>Image not available</ImageError>
      ) : (
        <StyledImage 
          src={src} 
          alt={alt} 
          $loaded={loaded}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          loading="lazy"
          decoding="async"
        />
      )}
    </ImageContainer>
  );
};

const Content = styled.div`
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Title = styled.h3`
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  color: #222;
`;

const Price = styled.div`
  font-weight: bold;
  font-size: 1.25rem;
  color: #2e7d32;
  margin-bottom: 8px;
`;

const Description = styled.p`
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
  flex: 1;
  margin-bottom: 16px;
`;

const Stock = styled.div<{ $low: boolean }>`
  font-size: 0.85rem;
  color: ${props => props.$low ? '#d32f2f' : '#1976d2'};
  margin-bottom: 12px;
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background-color: #1976d2;
  color: white;
  border: 1px solid transparent;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  box-sizing: border-box;

  &:hover {
    background-color: #1565c0;
  }

  &:disabled {
    background-color: #bdbdbd;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled(Link)`
  display: block;
  width: 100%;
  padding: 12px;
  background-color: white;
  color: #1976d2;
  border: 1px solid #1976d2;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  transition: all 0.2s;
  margin-top: 8px;
  box-sizing: border-box;

  &:hover {
    background-color: #f0f7ff;
  }
`;

interface ProductListProps {
  onSelectProduct: (product: Product) => void;
}

const ProductList: React.FC<ProductListProps> = ({ onSelectProduct }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, status, error } = useSelector((state: RootState) => state.products);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProducts());
    }
  }, [status, dispatch]);

  if (status === 'loading') {
    return (
      <Container>
        <Header>Store Products</Header>
        <Grid>
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <SkeletonImage />
              <Content>
                <SkeletonTitle />
                <SkeletonText />
                <SkeletonText />
                <SkeletonButton />
              </Content>
            </Card>
          ))}
        </Grid>
      </Container>
    );
  }

  if (status === 'failed') return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <Container>
      <Header>Store Products</Header>
      <Grid>
        {items.map((product) => (
          <Card key={product.id}>
            <OptimizedImage src={product.img_url} alt={product.name} />
            <Content>
              <Title>{product.name}</Title>
              <Price>{formatCurrency(Number(product.price))}</Price>
              <Stock $low={product.stock < 5}>{product.stock} units available</Stock>
              <Description>{product.description}</Description>
              <Button 
                onClick={() => onSelectProduct(product)}
                disabled={product.stock === 0}
              >
                {product.stock === 0 ? 'Out of Stock' : 'Pay now'}
              </Button>
              <SecondaryButton to={`/product/${product.id}`}>
                View Details
              </SecondaryButton>
            </Content>
          </Card>
        ))}
      </Grid>
    </Container>
  );
};

export default ProductList;
