# 💸 PayBuddy — Full-Stack Demo Payment App

A production-ready full-stack demo payment application simulating UPI-like digital transactions with QR code support, admin dashboard, and mobile app.

## 🚀 Live Demo
- **Web App:** [https://paybuddy-lkqtborgh-apex-55a5.vercel.app](https://paybuddy-lkqtborgh-apex-55a5.vercel.app)
- **API Backend:** [https://api-production-3447c.up.railway.app/api](https://api-production-3447c.up.railway.app/api)
- **Admin Login:** `9000000001` / PIN: `1234`
- **User Login:** `9876500000` / PIN: `1234`

## ✨ Features
- **Authentication:** JWT-based login/signup with bcrypt PIN hashing.
- **Wallet:** Real-time balance management with atomic transactions (Prisma `$transaction`).
- **Send Money:** Peer-to-peer demo money transfer with validation.
- **QR Payment:** Generate personal QR codes and scan to pay.
- **Admin Dashboard:** View users, search transactions, top-up balances, block/unblock accounts, and audit logs.
- **Mobile App:** Built with React Native (Expo).

## 🛠 Tech Stack
- **Frontend:** Next.js 15, React, Tailwind CSS, TypeScript
- **Backend:** NestJS, Node.js, Prisma ORM, Passport (JWT)
- **Database:** PostgreSQL (Supabase)
- **Mobile:** React Native (Expo)
- **DevOps:** Vercel (Frontend), Railway (Backend), Monorepo (npm workspaces)

## ⚙️ Local Setup
1. Clone repo: `git clone https://github.com/muniSHkumar2004/paybuddy.git`
2. Install deps: `npm install`
3. Setup `.env` (PostgreSQL URL, JWT secret)
4. Prisma migrate: `npm run prisma:migrate`
5. Seed admin: `node apps/api/scripts/seed-admin.js`
6. Run API: `npm run start:dev --workspace=apps/api`
7. Run Web: `npm run dev --workspace=apps/web`
8. Run Mobile: `npx expo start --workspace=apps/mobile`