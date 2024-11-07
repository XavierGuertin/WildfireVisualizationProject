# Use Node.js as the base image
FROM node:18-alpine

# Set up a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --ignore-scripts

# Copy the entire codebase to allow Nx commands to access everything
COPY . .

# Remove unnecessary folders to keep only the frontend app
RUN rm -rf apps/backend apps/frontend-e2e

# Install Nx globally to ensure it's available
RUN npm install -g nx

# Build the frontend app using the nx target
RUN npx nx run frontend:build

# Change ownership of the workspace directory
RUN chown -R appuser:appgroup /app

# Switch to the non-root user
USER appuser

# Expose the frontend port
EXPOSE 3000

# Start the frontend app using the nx serve command
CMD ["npx", "nx", "serve", "frontend"]
