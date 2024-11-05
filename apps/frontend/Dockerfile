# Use Node.js as base image
FROM node:18-alpine

# Create a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set the working directory
WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm install --ignore-scripts

# Copy the rest of the application code
COPY . .

# Change ownership of the app folder
RUN chown -R appuser:appgroup /app

# Switch to the non-root user
USER appuser

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
