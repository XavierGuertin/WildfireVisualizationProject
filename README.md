# Wildfire Visualization Platform

[![CI](https://github.com/XavierGuertin/WildfireVisualizationProject/actions/workflows/ci.yml/badge.svg)](https://github.com/XavierGuertin/WildfireVisualizationProject/actions/workflows/ci.yml)
[![Docker Image CI](https://github.com/XavierGuertin/WildfireVisualizationProject/actions/workflows/docker-build.yml/badge.svg)](https://github.com/XavierGuertin/WildfireVisualizationProject/actions/workflows/docker-build.yml)
[![Release](https://img.shields.io/github/v/release/XavierGuertin/wildfire-visualization-platform)](https://github.com/XavierGuertin/WildfireVisualizationProject/releases)

---

## Project Summary
The Wildfire Visualization Platform is an innovative tool designed to provide historical data on wildfires. The platform integrates data from multiple sources such as weather APIs, geographic data, and wildfire propagation models to offer data scientists and climate scientists a comprehensive view of wildfire events. Using open-source data visualization tools, it aims to enhance decision-making and provide predictive insights for wildfire management.

---

## Team Members

| Name                     | Student ID        | GitHub ID   | Email Address                  |
|--------------------------|-------------------|-------------|-------------------------------|
| **Wong, Samuel**          | 40209013          | [im-samwong](https://github.com/im-samwong) | samuel.wong60@gmail.com        |
| Dubois, Gabriel           | 40209252          | [Adissuu](https://github.com/Adissuu) | gabrieldubois.eng@gmail.com    |
| Hilout, Yasmine           | 40214158          | [yasminehilout](https://github.com/yasminehilout) | yasminehilout@gmail.com        |
| Fetanat, Ali              | 40158208          | [Fetyali7](https://github.com/Fetyali7) | fetyali7@gmail.com             |
| Frattolillo, Philip       | 40192245          | [PFratt](https://github.com/PFratt) | phil.fratt@gmail.com           |
| Villemure, Louis          | 40210315          | [lo-vil](https://github.com/lo-vil) | louis.villemure@gmail.com      |
| Daigle, Liam              | 40207583          | [LiamDaigle](https://github.com/LiamDaigle) | liam.daigle@gmail.com          |
| Keating, Kade             | 40166656          | [Kadestery](https://github.com/Kadestery) | kadekeating@gmail.com          |
| Cheng, Justin             | 40210279          | [justncheng](https://github.com/justncheng) | chengjustin2002@gmail.com      |
| Guertin, Xavier           | 40213525          | [XavierGuertin](https://github.com/XavierGuertin) | xavierguertin@gmail.com        |

---

## Developer Getting Started Guide

To get started as a developer on this project:

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-repo/wildfire-visualization-platform.git
   ```
2. **Open the project with an IDE**<br>
   ex. Visual Studio Code<br><br>
3.  **Install Dependencies In the root directory, install the necessary npm packages:**
    ```bash
    cd wildfire-visualization-platform
    npm install
    ```
4. **Incorporate secrets for keys in .env file:**
    Put .env in the root folder.
5. **Build the Backend Before launching the backend, ensure it is built:**
    ```bash
    nx build backend
    ```
6. **Launch the Backend Once built, you can serve the backend:**
    ```bash
    nx serve backend
    ```
7. **Launch the Frontend After the backend is running, you can start the frontend:**
    ```bash
    nx serve frontend
    ```

## Running Production

To run the application in a production environment, follow these steps:

### Step 1: Clone the Repository
Start by cloning the repository to your local machine.

```bash
git clone https://github.com/your-repo/wildfire-visualization-platform.git
cd wildfire-visualization-platform
```
### Step 2: Navigate to the Project Root
Ensure you're in the root directory of the project. All commands should be run from here.
```bash
cd wildfire-visualization-platform
```

### Step 3: Pull Docker Images
Use Docker Compose to pull any pre-built images specified in the docker-compose.yml file. This step ensures all required images are downloaded, including backend, frontend, database, and any other necessary services.
```bash
docker-compose pull
```

### Step 4: Start the Application in Detached Mode
Run the application in detached mode (-d flag) to keep the containers running in the background. This starts all services as specified in the docker-compose.yml, including the frontend, backend, database, and any other supporting services.
```bash
docker-compose up -d
```

### Step 5: Access the Application
Once the containers are up and running, you can access the application through the frontend URL in your browser (e.g., http://localhost:3000 if using the default port).

   
## Running Tests

To ensure code quality, run tests for both frontend and backend as follows:

### Frontend Testing
- **Location of Tests:** `./apps/frontend/__tests__`
- **Components to Test:** `./apps/frontend/src/components`
- **Example Test File:** `apps/frontend/__tests__/MapMetaData.spec.tsx`

Run frontend tests:
  ```bash
  nx test frontend
  ```

### Frontend End-to-End (E2E) Testing
- **Location of Tests:** `apps/frontend-e2e/src/e2e`
- **Example Test File:** `apps/frontend-e2e/src/e2e/app.cy.ts`

Run frontend E2E tests:
  ```bash
  nx e2e frontend-e2e
  ```

### Backend Testing
- **Location of Tests:** `./apps/backend/src/tests`
- **Components to Test:** `./apps/backend/src/main`
- **Example Test File:** `src/test/java/com/example/backend/backendTests/BackendSampleJUnitTest.java`

Run backend tests:
  ```bash
  nx test backend
  ```



---

## Tech Stack

The project utilizes the following technologies:

### Frontend:
- **Framework**: NextJS
- **Mapping Library**: OpenLayers
- **CSS Framework**: Tailwind CSS
- **Testing**: Jest for unit testing, Cypress for end-to-end testing

### Backend:
- **Framework**: Spring Boot (Java)
- **Database**: PostgreSQL
- **API Development**: RESTful APIs with Spring Boot
- **Testing**: JUnit for unit testing, Cypress for e2e testing

### DevOps & Infrastructure:
- **CI/CD**: Github Actions for automated builds and deployments
- **Containerization**: Docker for managing containers and deployments
- **Code Quality**: SonarQube for static code analysis
- **Version Control**: GitHub for repository management

---

## Wiki

For more details, please visit the [Wiki](https://github.com/XavierGuertin/WildfireVisualizationProject/wiki).
---
