# Use OpenJDK as the base image
FROM openjdk:22-jdk-slim

# Install Node.js and Maven for nx and build commands
RUN apt-get update && \
    apt-get install -y curl maven && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# Set up a non-root user with a home directory
RUN addgroup --system appgroup && adduser --system --ingroup appgroup --home /home/appuser appuser

# Set the working directory
WORKDIR /app

# Create a writable Maven repository directory for the user
RUN mkdir -p /home/appuser/.m2 && chown -R appuser:appgroup /home/appuser/.m2

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --ignore-scripts

# Copy the entire codebase
COPY . .

# Remove unnecessary folders to keep only the backend app
RUN rm -rf apps/frontend apps/frontend-e2e

# Install Nx globally to ensure it's available
RUN npm install -g nx

# Debug: Check if Maven and Node.js are available
RUN mvn -version && node -v && npm -v && nx --version

# Add PostgreSQL JDBC driver for database connectivity
RUN curl -o /app/postgresql-connector.jar https://jdbc.postgresql.org/download/postgresql-42.6.0.jar

# Build the backend app using the nx target (with Maven)
RUN npx nx run backend:build

# Change ownership of the workspace directory
RUN chown -R appuser:appgroup /app

# Switch to the non-root user
USER appuser

# Expose the backend port
EXPOSE 8080

# Start the backend app, specifying the local Maven repository path and including the PostgreSQL driver
CMD ["npx", "nx", "run", "backend:serve"]
