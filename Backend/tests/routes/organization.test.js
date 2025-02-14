const request = require('supertest');
const app = require('../../app');
const Organization = require('../../models/Organization');
const {
  userOne,
  adminUser,
  organizationOne,
  setupDatabase
} = require('../fixtures/db');

require('../setup');

beforeEach(setupDatabase);

describe('Organization Routes', () => {
  describe('POST /api/organizations', () => {
    it('should create a new organization for admin user', async () => {
      const response = await request(app)
        .post('/api/organizations')
        .set('Authorization', `Bearer ${adminUser.tokens[0].token}`)
        .send({
          name: 'New Organization',
          code: 'NEW-ORG',
          type: 'business'
        })
        .expect(201);

      // Assert the response
      expect(response.body.organization).toBeDefined();
      expect(response.body.organization.name).toBe('New Organization');

      // Assert the database
      const organization = await Organization.findById(response.body.organization._id);
      expect(organization).not.toBeNull();
      expect(organization.admins[0].user.toString()).toBe(adminUser._id.toString());
    });

    it('should not create organization with invalid data', async () => {
      await request(app)
        .post('/api/organizations')
        .set('Authorization', `Bearer ${adminUser.tokens[0].token}`)
        .send({
          name: '', // Invalid: empty name
          code: '123', // Invalid: wrong format
          type: 'invalid' // Invalid: not in enum
        })
        .expect(400);
    });

    it('should not allow regular user to create organization', async () => {
      await request(app)
        .post('/api/organizations')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
          name: 'New Organization',
          code: 'NEW-ORG',
          type: 'business'
        })
        .expect(403);
    });
  });

  describe('GET /api/organizations', () => {
    it('should get organizations for admin user', async () => {
      const response = await request(app)
        .get('/api/organizations')
        .set('Authorization', `Bearer ${adminUser.tokens[0].token}`)
        .expect(200);

      expect(response.body.organizations).toBeDefined();
      expect(response.body.organizations.length).toBe(1);
    });

    it('should get organizations where user is member', async () => {
      const response = await request(app)
        .get('/api/organizations')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .expect(200);

      expect(response.body.organizations).toBeDefined();
      expect(response.body.organizations.length).toBe(1);
      expect(response.body.organizations[0]._id.toString()).toBe(organizationOne._id.toString());
    });
  });

  describe('GET /api/organizations/:id', () => {
    it('should get organization by id', async () => {
      const response = await request(app)
        .get(`/api/organizations/${organizationOne._id}`)
        .set('Authorization', `Bearer ${adminUser.tokens[0].token}`)
        .expect(200);

      expect(response.body.organization).toBeDefined();
      expect(response.body.organization.name).toBe(organizationOne.name);
    });

    it('should not get organization if user is not member', async () => {
      // Create a new organization without userOne as member
      const newOrg = await Organization.create({
        name: 'Another Org',
        code: 'OTHER-ORG',
        type: 'business',
        createdBy: adminUser._id,
        admins: [{ user: adminUser._id, role: 'owner' }]
      });

      await request(app)
        .get(`/api/organizations/${newOrg._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .expect(403);
    });
  });
});
