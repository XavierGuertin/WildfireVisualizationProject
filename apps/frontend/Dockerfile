# Use Node.js base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React/Next.js app
RUN npm run build

# Expose the frontend port
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "start"]
