import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, type Product } from '../store/products/productSlice';
import { type AppDispatch, type RootState } from '../store';
import styled from 'styled-components';
import { formatCurrency } from '../utils/validation';

const Container = styled.div`
  padding: 40px;
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

const Image = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

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
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #1565c0;
  }

  &:disabled {
    background-color: #bdbdbd;
    cursor: not-allowed;
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

  if (status === 'loading') return <div>Loading products...</div>;
  if (status === 'failed') return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <Container>
      <Header>Store Products</Header>
      <Grid>
        {items.map((product) => (
          <Card key={product.id}>
            <Image src={product.img_url} alt={product.name} />
            <Content>
              <Title>{product.name}</Title>
              <Price>{formatCurrency(Number(product.price))}</Price>
              <Stock $low={product.stock < 5}>{product.stock} units available</Stock>
              <Description>{product.description}</Description>
              <Button 
                onClick={() => onSelectProduct(product)}
                disabled={product.stock === 0}
              >
                {product.stock === 0 ? 'Out of Stock' : 'Pay with credit card'}
              </Button>
            </Content>
          </Card>
        ))}
      </Grid>
    </Container>
  );
};

export default ProductList;
