import { getGreeting } from '../support/app.po';

describe('frontend-e2e', () => {
  beforeEach(() => cy.visit('/'));

  it('should display "Views" on the index page', () => {
    // Check for a span element containing the text "Views"
    cy.get('span').contains('Views');
  });
});

describe('E2E Tests for Core User Flows - API Endpoints', () => {

  const baseUrl = 'http://localhost:8080'; // Replace with your backend's base URL if different

  // Tests for /api/data
  it('should successfully fetch data from /api/data', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/api/data`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.not.be.empty;
    });
  });

  // Tests for /api/test-stac
  it('should fetch STAC data from /api/test-stac', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/api/test-stac`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.not.be.empty;
    });
  });

  // Tests for /api/metadata/{id}
  it('should fetch metadata from /api/metadata/{id}', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/api/metadata/sampleId`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.not.be.empty;
    });
  });

  // Tests for /api/fetch-collections
  it('should fetch and save collections via /api/fetch-collections', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/api/fetch-collections`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.contain('Collections fetched and saved successfully');
    });
  });

  // Tests for /api/get-collections
  it('should fetch collections successfully from /api/get-collections', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/api/get-collections`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
    });
  });

  // Tests for /api/reset-collections
  it('should reset collections successfully via /api/reset-collections', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/api/reset-collections`
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.contain('Collections deleted successfully');
    });
  });
});
