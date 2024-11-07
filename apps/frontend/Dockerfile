# Use a Node.js image
FROM node:18-alpine

# Set the working directory to the root of the workspace
WORKDIR /workspace

# Copy package files from the root
COPY package*.json ./

# Install all dependencies at the root level
RUN npm install

# Copy the entire workspace to retain access to the NX configuration and apps
COPY . .

# Build the frontend app using NX (targeting the frontend app within the workspace)
RUN npx nx run frontend:build

# Expose the frontend port
EXPOSE 3000

# Serve the frontend app using the custom NX target
CMD ["npx", "nx", "serve", "frontend"]
