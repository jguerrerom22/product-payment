# E-Shop Fullstack Payment System

A complete e-commerce solution features a high-performance backend and a modern frontend interface, integrated with a secure Payment Gateway. This repository orchestrates the entire ecosystem, from inventory management to secure payment processing.

## 🌟 Live Demo

The application is fully deployed and accessible at the following URLs:

- **Frontend Interface**: [http://eshop-test-ui.s3-website-us-east-1.amazonaws.com/](http://eshop-test-ui.s3-website-us-east-1.amazonaws.com/)
- **Backend API**: [https://83699s9ckc.execute-api.us-east-1.amazonaws.com/prod](https://83699s9ckc.execute-api.us-east-1.amazonaws.com/prod)

---

## 📁 Project Structure

This repository is divided into two main components:

### 1. [Backend (NestJS API)](./backend)
A serverless-ready API built with **NestJS**, following Hexagonal Architecture and DDD principles. It handles secure payment orchestration, stock management, and fulfillment tracking.
- **Detailed Documentation**: [backend/README.md](./backend/README.md)

### 2. [Frontend (React + Vite)](./frontend)
A modern, responsive web application built with **React** and **TypeScript**. It utilizes Redux Toolkit for state management and provides a seamless checkout experience with real-time feedback.
- **Detailed Documentation**: [frontend/README.md](./frontend/README.md)

---

## 📮 API Documentation

To simplify integration testing, a comprehensive Postman collection is included in the root directory:

[Eshop Backend API Collection](./Backend.postman_collection.json)

*Import this file into Postman to test live or local endpoints.*

---

## 🏛️ General Architecture

The system is designed for high availability and security:
- **Cloud Infrastructure**: Hosted on AWS using **Lambda** (Backend) and **S3 Static Website Hosting** (Frontend).
- **Security**: Sensitive data is tokenized via the Payment Gateway. Frontend persistence strictly excludes PII and sensitive payment data.
- **Resiliency**: Redux-based state management with LocalStorage recovery allows users to survive page refreshes during checkout.

## 🛠️ Local Development

For setup instructions, testing commands, and deployment guides, please refer to the specific README files in each directory:

- [Backend Setup & Migrations](./backend/README.md#getting-started)
- [Frontend Setup & Testing](./frontend/README.md#getting-started)
