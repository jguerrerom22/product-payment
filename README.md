# Wompi Payment App

This project implements a Product Payment Application using Wompi integration. It consists of a **NestJS Backend** (Hexagonal Architecture) and a **React Frontend** (Redux + Vite).

## Architecture

### Backend
- **Framework**: NestJS
- **Architecture**: Hexagonal (Ports & Adapters)
- **Database**: PostgreSQL with TypeORM
- **Pattern**: Railway Oriented Programming principles in Use Cases.
- **Modules**:
  - `Product`: Manages stock and listings.
  - `Transaction`: Manages payment inputs and lifecycle.

### Frontend
- **Framework**: React + Vite
- **State Management**: Redux Toolkit (Flux Architecture)
- **Styling**: Styled Components / CSS Modules
- **Design**: Mobile-first, responsive.

## Setup & Running

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database

### Backend Setup
1. Navigate to `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment:
   - Copy `.env.example` to `.env`
   - Update DB credentials and Wompi keys.
4. Run Development Server:
   ```bash
   npm run start:dev
   ```
   *The application will seed dummy products on first run.*

### Frontend Setup
1. Navigate to `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run Development Server:
   ```bash
   npm run dev
   ```

## Testing
The project includes unit tests for core logic.

- **Backend Tests**:
  ```bash
  cd backend
  npm test
  ```
- **Frontend Tests**:
  ```bash
  cd frontend
  npm test
  ```

## Features
- List of Products with stock management.
- Credit Card Validation (Luhn Check, Visa/Mastercard detection).
- Secure transaction flow (Backend orchestration).
- Resilient UI (Redux state management).
