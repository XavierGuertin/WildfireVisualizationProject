# Use OpenJDK as base image
FROM openjdk:22-jdk-slim

# Install Node.js for nx command usage
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# Set up a non-root user
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --ignore-scripts

# Debug: List all files after installing dependencies
RUN echo "Files after npm install:" && ls -la

# Copy the entire codebase
COPY . .

# Debug: List all files after copying the codebase
RUN echo "Files after copying codebase:" && ls -la

# Remove unnecessary folders to keep only the backend app
RUN rm -rf apps/frontend apps/frontend-e2e

# Debug: List all files after removing unnecessary folders
RUN echo "Files after removing unneeded apps:" && ls -la apps/

# Install Nx globally to ensure it's available
RUN npm install -g nx

# Debug: List all files before running Nx commands
RUN echo "Files before running nx build:" && ls -la

# Build the backend app using the nx target
RUN npx nx run backend:build

# Change ownership of the workspace directory
RUN chown -R appuser:appgroup /app

# Switch to the non-root user
USER appuser

# Expose the backend port
EXPOSE 8080

# Start the backend app using the nx serve command
CMD ["npx", "nx", "serve", "backend"]
