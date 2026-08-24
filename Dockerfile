# Dockerfile for My Student Academia (Full-Stack Deployment)
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and backend configs
COPY package.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install dependencies
RUN npm install
RUN cd backend && npm install
RUN cd frontend && npm install

# Copy source files
COPY backend ./backend
COPY frontend ./frontend

# Build frontend and backend
RUN cd backend && npx prisma generate && npm run build
RUN cd frontend && npm run build

EXPOSE 5000 5173

CMD ["npm", "run", "dev:backend"]
