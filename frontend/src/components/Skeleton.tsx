import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% {
    background-position: -468px 0;
  }
  100% {
    background-position: 468px 0;
  }
`;

export const SkeletonBase = styled.div`
  background: #f6f7f8;
  background-image: linear-gradient(
    to right,
    #f6f7f8 0%,
    #edeef1 20%,
    #f6f7f8 40%,
    #f6f7f8 100%
  );
  background-repeat: no-repeat;
  background-size: 800px 400px;
  display: inline-block;
  position: relative;
  animation: ${shimmer} 1.2s linear infinite;
`;

export const SkeletonImage = styled(SkeletonBase)`
  width: 100%;
  height: 200px;
  border-radius: 12px 12px 0 0;
`;

export const SkeletonTitle = styled(SkeletonBase)`
  width: 60%;
  height: 20px;
  margin-bottom: 12px;
  border-radius: 4px;
`;

export const SkeletonText = styled(SkeletonBase)`
  width: 100%;
  height: 14px;
  margin-bottom: 8px;
  border-radius: 4px;
`;

export const SkeletonButton = styled(SkeletonBase)`
  width: 100%;
  height: 40px;
  margin-top: auto;
  border-radius: 8px;
`;
