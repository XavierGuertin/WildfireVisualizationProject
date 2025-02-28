# Use Node.js as the base image
FROM node:18-alpine

# Set up a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set the working directory to the root of the monorepo
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --ignore-scripts

# Copy the entire codebase
COPY . .

# Remove unnecessary folders to keep only the frontend app
RUN rm -rf apps/backend apps/frontend-e2e apps/geoserver_data apps/tileserver

# Install Nx globally to ensure it's available
RUN npm install -g nx

# Debug: Verify Node.js and Nx installation
RUN node -v && npm -v && nx --version

# Accept REACT_APP_BACKEND_URL as a build argument
ARG NEXT_PUBLIC_BACKEND_URL

# Set the environment variable to make it available during build
ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}

# Build the frontend app using the nx target, which now has access to REACT_APP_BACKEND_URL
RUN npx nx run frontend:build

# Change ownership of the workspace directory
RUN chown -R appuser:appgroup /app

# Switch to the non-root user
USER appuser

# Expose the frontend port
EXPOSE 3000

# Start the frontend app using the nx serve command
CMD ["npx", "nx", "serve", "frontend"]
