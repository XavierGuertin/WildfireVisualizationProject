# Use an OpenJDK image for Java Spring Boot
FROM openjdk:22-jdk

# Set the working directory to the root of the workspace
WORKDIR /workspace

# Copy the entire workspace, including dependencies and NX setup
COPY . .

# Build the backend app using the NX target
RUN npx nx run backend:build

# Expose the backend port
EXPOSE 8080

# Run the backend server using the NX serve command
CMD ["npx", "nx", "serve", "backend"]
