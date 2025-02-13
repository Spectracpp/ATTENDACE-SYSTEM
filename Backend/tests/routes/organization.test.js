const request = require('supertest');
const app = require('../../app');
const Organization = require('../../models/Organization');
const { 
  userOne, 
  userTwo, 
  organizationOne, 
  organizationOneId, 
  setupDatabase 
} = require('../fixtures/db');

beforeEach(setupDatabase);

describe('Organization Routes', () => {
  describe('POST /api/organizations', () => {
    test('Should create new organization for admin', async () => {
      const loginResponse = await request(app)
        .post('/api/users/login')
        .send({
          email: userOne.email,
          password: userOne.password
        });

      const response = await request(app)
        .post('/api/organizations')
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .send({
          name: 'New Organization',
          code: 'NEW001',
          type: 'business',
          settings: {
            qrCodeExpiry: 300,
            allowedRadius: 100,
            requireLocation: true
          }
        })
        .expect(201);

      // Assert the database was changed correctly
      const organization = await Organization.findById(response.body.organization._id);
      expect(organization).not.toBeNull();
      expect(organization.name).toBe('New Organization');
    });

    test('Should not create organization for non-admin', async () => {
      const loginResponse = await request(app)
        .post('/api/users/login')
        .send({
          email: userTwo.email,
          password: userTwo.password
        });

      await request(app)
        .post('/api/organizations')
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .send({
          name: 'New Organization',
          code: 'NEW001',
          type: 'business'
        })
        .expect(403);
    });
  });

  describe('GET /api/organizations/:id', () => {
    test('Should get organization for member', async () => {
      const loginResponse = await request(app)
        .post('/api/users/login')
        .send({
          email: userTwo.email,
          password: userTwo.password
        });

      const response = await request(app)
        .get(`/api/organizations/${organizationOneId}`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .send()
        .expect(200);

      expect(response.body.organization.name).toBe(organizationOne.name);
    });

    test('Should not get organization for non-member', async () => {
      // Create a new user who is not a member
      const newUser = {
        firstName: 'Non',
        lastName: 'Member',
        email: 'nonmember@example.com',
        password: 'NonMember123!@#'
      };

      await request(app)
        .post('/api/users/register')
        .send(newUser);

      const loginResponse = await request(app)
        .post('/api/users/login')
        .send({
          email: newUser.email,
          password: newUser.password
        });

      await request(app)
        .get(`/api/organizations/${organizationOneId}`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .send()
        .expect(403);
    });
  });

  describe('POST /api/organizations/:id/members', () => {
    test('Should add member to organization', async () => {
      const loginResponse = await request(app)
        .post('/api/users/login')
        .send({
          email: userOne.email,
          password: userOne.password
        });

      // Register a new user to add as member
      const newUser = {
        firstName: 'New',
        lastName: 'Member',
        email: 'newmember@example.com',
        password: 'NewMember123!@#'
      };

      await request(app)
        .post('/api/users/register')
        .send(newUser);

      const response = await request(app)
        .post(`/api/organizations/${organizationOneId}/members`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .send({
          email: newUser.email,
          role: 'member'
        })
        .expect(200);

      expect(response.body.organization.members)
        .toEqual(expect.arrayContaining([
          expect.objectContaining({
            role: 'member'
          })
        ]));
    });
  });

  describe('GET /api/organizations/:id/statistics', () => {
    test('Should get organization statistics for admin', async () => {
      const loginResponse = await request(app)
        .post('/api/users/login')
        .send({
          email: userOne.email,
          password: userOne.password
        });

      await request(app)
        .get(`/api/organizations/${organizationOneId}/statistics`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .send()
        .expect(200);
    });

    test('Should not get statistics for non-admin', async () => {
      const loginResponse = await request(app)
        .post('/api/users/login')
        .send({
          email: userTwo.email,
          password: userTwo.password
        });

      await request(app)
        .get(`/api/organizations/${organizationOneId}/statistics`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .send()
        .expect(403);
    });
  });
});
