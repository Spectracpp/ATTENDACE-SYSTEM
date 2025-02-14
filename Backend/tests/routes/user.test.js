const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');
const { userOne, userOneId, setupDatabase } = require('../fixtures/db');

require('../setup');

beforeEach(setupDatabase);

describe('User Routes', () => {
  describe('POST /api/users/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          firstName: 'New',
          lastName: 'User',
          email: 'newuser@example.com',
          password: 'NewPass123!@#'
        })
        .expect(201);

      // Assert the response
      expect(response.body.user).toBeDefined();
      expect(response.body.token).toBeDefined();

      // Assert the database
      const user = await User.findById(response.body.user._id);
      expect(user).not.toBeNull();
      expect(user.password).not.toBe('NewPass123!@#');
    });

    it('should not register user with invalid data', async () => {
      await request(app)
        .post('/api/users/register')
        .send({
          firstName: '',
          lastName: '',
          email: 'invalid-email',
          password: '123' // Too short
        })
        .expect(400);
    });

    it('should not register user with existing email', async () => {
      await request(app)
        .post('/api/users/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: userOne.email,
          password: 'Test123!@#'
        })
        .expect(400);
    });
  });

  describe('POST /api/users/login', () => {
    it('should login existing user', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: userOne.email,
          password: userOne.password
        })
        .expect(200);

      expect(response.body.token).toBeDefined();
      expect(response.body.user._id.toString()).toBe(userOne._id.toString());
      expect(response.body.user.email).toBe(userOne.email);
    });

    it('should not login with wrong credentials', async () => {
      await request(app)
        .post('/api/users/login')
        .send({
          email: userOne.email,
          password: 'wrongpassword'
        })
        .expect(401);
    });
  });

  describe('GET /api/users/profile', () => {
    it('should get user profile', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .expect(200);

      expect(response.body._id.toString()).toBe(userOne._id.toString());
      expect(response.body.email).toBe(userOne.email);
    });

    it('should not get profile without auth', async () => {
      await request(app)
        .get('/api/users/profile')
        .expect(401);
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update user profile', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
          firstName: 'Updated',
          lastName: 'Name'
        })
        .expect(200);

      expect(response.body.firstName).toBe('Updated');
      expect(response.body.lastName).toBe('Name');

      // Verify database
      const user = await User.findById(userOneId);
      expect(user.firstName).toBe('Updated');
      expect(user.lastName).toBe('Name');
    });

    it('should not update invalid fields', async () => {
      await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
          role: 'admin' // Should not be able to update role
        })
        .expect(400);
    });
  });
});
