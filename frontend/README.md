# E-Shop Checkout Frontend

A modern, responsive, and secure frontend application built with **React** and **TypeScript**, serving as the user interface for a seamless e-commerce checkout experience integrated with a Payment Gateway.

## 🚀 Description

This project provides a premium shopping experience where users can:
- **Browse Products**: Interact with a dynamic list of available items.
- **Detailed View**: Access product specifications and inventory status.
- **Secure Checkout**: Complete purchases using a robust payment modal that includes real-time card visualization and field masking.
- **Transaction Feedback**: Receive immediate confirmation of payment status (Approved, Declined, or Pending).

## 🏛️ Architecture & State Management

### Component-Based Architecture
The application is structured into modular, reusable components, ensuring a clean separation of concerns and a scalable codebase.

### Centralized State (Redux Toolkit)
We use **Redux Toolkit** to manage the global application state, handling:
- **Product Catalog**: Loading and filtering available products.
- **Transaction Flow**: Managing the lifecycle of a payment from initiation to final result.

### Persistence (LocalStorage)
To enhance user experience and resiliency:
- **Session Recovery**: Current transaction IDs and results are persisted to `LocalStorage`. This allows users to refresh the page during any stage of the checkout without losing their progress.
- **Secure Persistence**: We strictly exclude any sensitive card information (CVV, Card Number) from storage to comply with security best practices.

## 🛠️ Technology Stack

### Why Vite?
This project is powered by **Vite** because it offers:
- **Lightning Fast HMR**: Instant updates during development.
- **Optimized Builds**: Efficient bundling for a fast and smooth production experience.
- **Modern Standards**: Seamless support for ES modules and TypeScript.

### Key Libraries
- **React Router Dom**: Handles seamless navigation between the store and result pages.
- **Axios**: Provision of a robust HTTP client for API communication.
- **React Credit Cards 2**: Provides a beautiful, real-time visual representation of the user's credit card.
- **React IMask**: Ensures data integrity by applying precise masks to inputs like phone numbers and card expiry dates.
- **Styled Components**: Utilized for dynamic and scoped styling of UI components.

---

## 🧪 Testing & Quality

We use **Vitest** and **React Testing Library** to ensure a reliable user experience.

### Run Unit Tests
```bash
$ npm run test
```

### Run Coverage Report
Our test suite covers critical user paths, including form validation and state transitions.

```bash
$ npm run test:cov
```

#### Coverage Results
| Component | % Stmts | % Branch | % Funcs | % Lines |
| :--- | :---: | :---: | :---: | :---: |
| **Total Project** | **88.66** | **82.85** | **85.29** | **88.4** |

---

## 🏁 Getting Started

1. **Install Dependencies**
   ```bash
   $ npm install
   ```

2. **Run Development Server**
   ```bash
   $ npm run dev
   ```

3. **Build for Production**
   ```bash
   $ npm run build
   ```
