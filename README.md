# Wildfire Visualization Platform

[![CI](https://github.com/XavierGuertin/WildfireVisualizationProject/actions/workflows/ci.yml/badge.svg)](https://github.com/XavierGuertin/WildfireVisualizationProject/actions/workflows/ci.yml)
[![Docker Image CI](https://github.com/XavierGuertin/WildfireVisualizationProject/actions/workflows/docker-build.yml/badge.svg)](https://github.com/XavierGuertin/WildfireVisualizationProject/actions/workflows/docker-build.yml)
[![E2E Pipeline](https://github.com/XavierGuertin/WildfireVisualizationProject/actions/workflows/e2e.yml/badge.svg)](https://github.com/XavierGuertin/WildfireVisualizationProject/actions/workflows/e2e.yml)
[![Release](https://img.shields.io/github/v/release/XavierGuertin/WildfireVisualizationProject)](https://github.com/XavierGuertin/WildfireVisualizationProject/releases)

## Release Demos

<details>
   <summary>Click to expand</summary>

## [Release 1](https://drive.google.com/file/d/1JsXKsDaoS1fAFSvkUBiOB_QMhBAMq9s_/view?usp=sharing)

## [Release 2](https://drive.google.com/file/d/1EwC_pmEvNcNeKkw6HzDpERxLRwDPYCPv/view?usp=sharing)

## [Release 3](link-here)

</details>

## Project Summary

The Wildfire Visualization Platform is an innovative tool designed to provide historical data on wildfires. The platform integrates data from multiple sources such as weather APIs, geographic data, and wildfire propagation models to offer data scientists and climate scientists a comprehensive view of wildfire events. Using open-source data visualization tools, it aims to enhance decision-making and provide predictive insights for wildfire management.

## [Project Overview](https://github.com/XavierGuertin/WildfireVisualizationProject/wiki)

### Project Documentation

- [API Endpoints](https://github.com/XavierGuertin/WildfireVisualizationProject/wiki/API-endpoints)
- [Overall Architecture and Class Diagrams](https://github.com/XavierGuertin/WildfireVisualizationProject/wiki/Overall-Architecture-and-Class-Diagrams)
- [UI Mockups](https://github.com/XavierGuertin/WildfireVisualizationProject/wiki/UI-Mockups)
- [Infrastructure and Tools](https://github.com/XavierGuertin/WildfireVisualizationProject/wiki/Infrastructure-and-tools)
- [Name Conventions](https://github.com/XavierGuertin/WildfireVisualizationProject/wiki/Name-Conventions)
- [Personas](https://github.com/XavierGuertin/WildfireVisualizationProject/wiki/Personas)

### Development Process

- [Testing Plan and Continuous Integration](https://github.com/XavierGuertin/WildfireVisualizationProject/wiki/Testing-Plan-and-Continuous-Integration)
- [Bug Reporting Template](https://github.com/XavierGuertin/WildfireVisualizationProject/wiki/Bug-Reporting-Template)
- [Documented Substantial Engineering and Design](https://github.com/XavierGuertin/WildfireVisualizationProject/wiki/Documented-Substantial-Engineering-and-Design)
- [End Of Iteration Notes](https://github.com/XavierGuertin/WildfireVisualizationProject/wiki/End-Of-Iteration-Notes)
- [Meeting Minutes](https://github.com/XavierGuertin/WildfireVisualizationProject/wiki/Meeting-Minutes)
- [Postmortems](https://github.com/XavierGuertin/WildfireVisualizationProject/wiki/Postmortems)

### Project Planning

- [Release Goals Rationale](https://github.com/XavierGuertin/WildfireVisualizationProject/wiki/Release-Goals-Rationale)
- [Release RoadMaps](https://github.com/XavierGuertin/WildfireVisualizationProject/wiki/Release-RoadMaps)
- [Deployment Plan and Infrastructure](https://github.com/XavierGuertin/WildfireVisualizationProject/wiki/Deployment-Plan-and-Infrastructure)
- [Rollout Strategy](https://github.com/XavierGuertin/WildfireVisualizationProject/wiki/Rollout-Strategy)
- [Risks](https://github.com/XavierGuertin/WildfireVisualizationProject/wiki/Risks)

### Compliance and Security

- [Security Strategy](https://github.com/XavierGuertin/WildfireVisualizationProject/wiki/Security-Strategy)
- [Legal and Ethical Issues](https://github.com/XavierGuertin/WildfireVisualizationProject/wiki/Legal-and-Ethical-issues)
- [Economic Considerations](https://github.com/XavierGuertin/WildfireVisualizationProject/wiki/Economic)
- [Diversity Statement](https://github.com/XavierGuertin/WildfireVisualizationProject/wiki/Diversity-Statement)
- [IP Opt-Out Form](https://github.com/XavierGuertin/WildfireVisualizationProject/wiki/IP-Opt%E2%80%90Out-Form)

### User Testing

- [User Testing Documentation](https://github.com/XavierGuertin/WildfireVisualizationProject/wiki/User-Testing)

## Most Important Files and Tests

<details>
   <summary>Click to expand</summary>

---

| File path with clickable GitHub link                                                                                                                   | Purpose                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| [layout.tsx](https://github.com/XavierGuertin/WildfireVisualizationProject/blob/dev/apps/frontend/src/app/layout.tsx)                                  | Foundation for our UI, source of all components.                              |
| [MapView.tsx](https://github.com/XavierGuertin/WildfireVisualizationProject/blob/dev/apps/frontend/src/app/components/MapView.tsx)                     | Component for rendering the map, serves as the background of our app.         |
| [AvailableDatasets.tsx](https://github.com/XavierGuertin/WildfireVisualizationProject/blob/dev/apps/frontend/src/app/components/AvailableDatasets.tsx) | Adding filters to sort by name, date, recently added, and recently updated.   |
| [Sidebar.tsx](https://github.com/XavierGuertin/WildfireVisualizationProject/blob/dev/apps/frontend/src/app/components/Sidebar.tsx)                     | Alternate between map layers (default, topographical, satellite)              |
| [Footer.tsx](https://github.com/XavierGuertin/WildfireVisualizationProject/blob/dev/apps/frontend/src/app/components/Footer.tsx)                       | Wildfire visualization controls to change speed of event display progression. |

| Test file path with clickable GitHub link                                                                                | Purpose                            |
| ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| [app.cy.tsx](https://github.com/XavierGuertin/WildfireVisualizationProject/blob/dev/apps/frontend-e2e/src/e2e/app.cy.ts) | Example of an e2e test for "Views" |
| Fetching Data                                                                                                            |                                    |
| Parsing Data in DTO                                                                                                      |                                    |
| Displaying Metadata                                                                                                      |                                    |
| Event Control Test                                                                                                       |                                    |

</details>

## Team Members

<details>
   <summary>Click to expand</summary>

| Name                | Student ID | GitHub ID                                         | Email Address               |
| ------------------- | ---------- | ------------------------------------------------- | --------------------------- |
| **Wong, Samuel**    | 40209013   | [im-samwong](https://github.com/im-samwong)       | samuel.wong60@gmail.com     |
| Dubois, Gabriel     | 40209252   | [Adissuu](https://github.com/Adissuu)             | gabrieldubois.eng@gmail.com |
| Hilout, Yasmine     | 40214158   | [yasminehilout](https://github.com/yasminehilout) | yasminehilout@gmail.com     |
| Fetanat, Ali        | 40158208   | [Fetyali7](https://github.com/Fetyali7)           | fetyali7@gmail.com          |
| Frattolillo, Philip | 40192245   | [PFratt](https://github.com/PFratt)               | phil.fratt@gmail.com        |
| Villemure, Louis    | 40210315   | [lo-vil](https://github.com/lo-vil)               | louis.villemure@gmail.com   |
| Daigle, Liam        | 40207583   | [LiamDaigle](https://github.com/LiamDaigle)       | liam.daigle@gmail.com       |
| Keating, Kade       | 40166656   | [Kadestery](https://github.com/Kadestery)         | kadekeating@gmail.com       |
| Cheng, Justin       | 40210279   | [justncheng](https://github.com/justncheng)       | chengjustin2002@gmail.com   |
| Guertin, Xavier     | 40213525   | [XavierGuertin](https://github.com/XavierGuertin) | xavierguertin@gmail.com     |
| Oliel, Eden         | 40211989   | [eo2000](https://github.com/eo2000)               | olieleden0@gmail.com        |

</details>

## Equity and Diversity Statement

The Wildfire Visualization Platform Team is committed to fostering equity, diversity, and inclusion in all aspects of its development and deployment. We recognize that wildfires impact diverse communities differently and strive to ensure our tools are accessible, informative, and responsive to the needs of all users—especially those from historically underserved or vulnerable populations. By prioritizing inclusive data representation and engaging with a broad range of stakeholders, we aim to support equitable decision-making and promote environmental justice through transparent and collaborative technology.

---

## Running the Application

To run the application, follow these steps:

1. **Clone the Repository**

   ```bash
   git clone https://github.com/XavierGuertin/WildfireVisualizationProject.git
   ```

2. **Navigate to the Project Root**

   ```bash
   cd WildfireVisualizationProject
   ```

3. **Run the Application using Docker Compose**

   ```bash
   docker-compose up --pull always
   ```

4. **Access the Application**
   Once the project is running, open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## Developer Guide

For setting up the development environment, follow these additional steps:

1. **Pull Required Services**

   ```bash
   docker compose pull geoserver db tileserver tileserver-init
   ```

2. **Start Services**

   ```bash
   docker compose up geoserver db tileserver tileserver-init
   ```

3. **Add Environment Variables**

   ```
   # Navigate to the frontend directory
   cd frontend

   # Create environment files if they don't exist
   touch .env.production .env.development
   ```

   Add the following variables to both .env.production and .env.development

   ```ini
   NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
   NEXT_PUBLIC_GEOSERVER_URL=http://localhost:8090/geoserver/Default/wms
   NEXT_PUBLIC_TILESERVER_URL=http://localhost:8081/data/OAM-World-1-8-min-J80
   ```

4. **Run the Backend**

   ```bash
   nx dev backend
   ```

5. **Install Dependencies**

   ```bash
   cd wildfire-visualization-platform
   npm i
   ```

6. **Run the Frontend**
   ```bash
   nx dev frontend
   ```

---

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
- Developers need to create a cypress.env.json file with the following:
  `"COLLECTIONS_URL": "*URL_TO_COLLECTIONS_ENDPOINT*" `

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
