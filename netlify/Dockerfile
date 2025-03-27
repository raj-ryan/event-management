FROM node:20-slim

WORKDIR /app

# Set build arguments for environment variables
ARG DATABASE_URL
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_APP_ID
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_STRIPE_PUBLIC_KEY
ARG STRIPE_SECRET_KEY
ARG SESSION_SECRET

# Set environment variables
ENV DATABASE_URL=${DATABASE_URL}
ENV VITE_FIREBASE_API_KEY=${VITE_FIREBASE_API_KEY}
ENV VITE_FIREBASE_APP_ID=${VITE_FIREBASE_APP_ID}
ENV VITE_FIREBASE_PROJECT_ID=${VITE_FIREBASE_PROJECT_ID}
ENV VITE_STRIPE_PUBLIC_KEY=${VITE_STRIPE_PUBLIC_KEY}
ENV STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
ENV SESSION_SECRET=${SESSION_SECRET:-eventzen-session-secret}
ENV NODE_ENV=production

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy netlify functions
COPY netlify ./netlify
COPY server ./server
COPY shared ./shared
COPY client ./client

# Build functions
RUN npm run build

# Expose the port the Netlify functions will run on
EXPOSE 8888

# Create a healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8888/.netlify/functions/api || exit 1

# Command to run the Netlify functions locally
CMD ["npx", "netlify-lambda", "serve", "netlify/functions"]