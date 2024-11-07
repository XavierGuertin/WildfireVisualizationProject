# Use Node.js as the base image
FROM node:18-alpine

# Set up a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set the working directory to the root of the monorepo
WORKDIR /workspace

# Copy the root package.json and install dependencies for the whole workspace
COPY package*.json ./
RUN npm install --ignore-scripts

# Copy the entire monorepo codebase
COPY . .

# Build the frontend app using the nx target
RUN npx nx run frontend:build

# Change ownership of the workspace directory
RUN chown -R appuser:appgroup /workspace

# Switch to the non-root user
USER appuser

# Expose the frontend port
EXPOSE 3000

# Start the frontend app using the nx serve command
CMD ["npx", "nx", "serve", "frontend"]
