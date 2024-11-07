# Use OpenJDK as the base image
FROM openjdk:22-jdk-slim

# Install Node.js for nx command usage
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# Set up a non-root user
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Set the working directory to the root of the monorepo
WORKDIR /workspace

# Copy the root package.json and install dependencies
COPY package*.json ./
RUN npm install --ignore-scripts

# Copy the entire monorepo codebase
COPY . .

# Build the backend app using the nx target
RUN npx nx run backend:build

# Change ownership of the workspace directory
RUN chown -R appuser:appgroup /workspace

# Switch to the non-root user
USER appuser

# Expose the backend port
EXPOSE 8080

# Start the backend app using the nx serve command
CMD ["npx", "nx", "serve", "backend"]
