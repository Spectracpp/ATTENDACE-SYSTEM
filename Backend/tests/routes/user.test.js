const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');
const { userOne, userOneId, setupDatabase } = require('../fixtures/db');

beforeEach(setupDatabase);

describe('User Routes', () => {
  describe('POST /api/users/register', () => {
    test('Should register a new user', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          firstName: 'New',
          lastName: 'User',
          email: 'new@example.com',
          password: 'NewPass123!@#'
        })
        .expect(201);

      // Assert the database was changed correctly
      const user = await User.findById(response.body.user._id);
      expect(user).not.toBeNull();

      // Assertions about the response
      expect(response.body).toMatchObject({
        message: 'Registration successful. Please check your email to verify your account.'
      });
    });

    test('Should not register user with invalid data', async () => {
      await request(app)
        .post('/api/users/register')
        .send({
          firstName: '',
          email: 'invalid-email',
          password: 'short'
        })
        .expect(400);
    });
  });

  describe('POST /api/users/login', () => {
    test('Should login existing user', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: userOne.email,
          password: userOne.password
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.user).toMatchObject({
        email: userOne.email,
        firstName: userOne.firstName
      });
    });

    test('Should not login with wrong credentials', async () => {
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
    test('Should get user profile', async () => {
      const loginResponse = await request(app)
        .post('/api/users/login')
        .send({
          email: userOne.email,
          password: userOne.password
        });

      await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .send()
        .expect(200);
    });

    test('Should not get profile without auth', async () => {
      await request(app)
        .get('/api/users/profile')
        .send()
        .expect(401);
    });
  });

  describe('PUT /api/users/profile', () => {
    test('Should update user profile', async () => {
      const loginResponse = await request(app)
        .post('/api/users/login')
        .send({
          email: userOne.email,
          password: userOne.password
        });

      await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .send({
          firstName: 'Updated',
          lastName: 'Name'
        })
        .expect(200);

      const user = await User.findById(userOneId);
      expect(user.firstName).toBe('Updated');
      expect(user.lastName).toBe('Name');
    });
  });
});
