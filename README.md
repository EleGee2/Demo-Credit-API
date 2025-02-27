# Demo Credit Wallet Service

## 📌 Overview
Demo Credit is a **mobile lending app** that requires a wallet service for users to **receive loans and make repayments**.  
This **MVP (Minimum Viable Product)** provides essential wallet functionalities:

- ✅ **User account creation**
- ✅ **Funding a wallet**
- ✅ **Transferring funds to another user**
- ✅ **Withdrawing funds**
- ✅ **Blacklist validation using Lendsqr Adjutor Karma** (blacklisted users cannot be onboarded)

The service follows **best practices** in software design, ensures **transactional integrity**, and includes **unit tests**.

---

## 🚀 Tech Stack
- **Node.js** (LTS)
- **TypeScript**
- **Knex.js** (SQL Query Builder)
- **MySQL** (Database)
- **Jest** (Testing Framework)
- **NestJS** (For modular architecture)

---

## 🔥 Features
- 🔹 **Secure Transactions** – Uses **database transactions** to ensure consistency.
- 🔹 **Blacklist Integration** – Prevents blacklisted users from onboarding via **Lendsqr Adjutor Karma**.
- 🔹 **Faux Token Authentication** – Simulates authentication.
- 🔹 **Unit Testing** – Ensures functionality and stability.
- 🔹 **Scalable & Modular Design** – Follows **clean architecture**.

---

## 📊 Database Schema
### **ER Diagram**
Below is the **ER diagram** representing the database schema:

![ER Diagram](https://dbdesigner.page.link/JFVM3aCs8hEaFDsc9)  
<https://dbdesigner.page.link/JFVM3aCs8hEaFDsc9>

---

## 📡 API Endpoints
### **User Endpoints**
| Method | Endpoint            | Description             |
|--------|---------------------|-------------------------|
| POST   | `/users/create`     | Create a new user      |

### **Wallet Endpoints**
| Method | Endpoint             | Description               |
|--------|----------------------|---------------------------|
| POST   | `/wallet/fund`       | Fund a user's wallet      |
| POST   | `/wallet/transfer`   | Transfer funds to another user |
| POST   | `/wallet/withdraw`   | Withdraw funds from wallet |

---

## ⚙️ Setup Instructions
### 1️⃣ Clone the Repository
```sh
git clone https://github.com/your-repo/demo-credit-wallet.git
cd demo-credit-wallet
```

### 2️⃣ Install Dependencies
```sh
npm install
```

### 3️⃣ Configure Environment Variables
```sh
DATABASE_URL=mysql://user:password@localhost:3306/demo_credit
LENDSQR_API_KEY=your-api-key
JWT_SECRET=your-secret-key
```

### 4️⃣ Run Database Migrations
```sh
npm run migrate
```
### 5️⃣ Start the Server
```sh
npm run dev
```

## 🧪 Running Tests
### Execute unit tests using:
```sh
npm run test
```