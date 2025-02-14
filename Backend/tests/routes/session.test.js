const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const Session = require('../../models/Session');
const Attendance = require('../../models/Attendance');
const { setupDatabase, userOne, adminUser, organizationOne } = require('../fixtures/db');

require('../setup');

beforeEach(setupDatabase);

describe('Session Routes', () => {
  describe('POST /api/sessions', () => {
    it('should create a new session when valid data is provided', async () => {
      const sessionData = {
        name: 'Morning Meeting',
        type: 'regular',
        organization: organizationOne._id,
        location: {
          latitude: 12.9716,
          longitude: 77.5946,
          radius: 100
        },
        startTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        endTime: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
        settings: {
          allowLateMarking: true,
          requireLocation: true,
          allowedDevices: ['mobile', 'tablet']
        }
      };

      const response = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${adminUser.tokens[0].token}`)
        .send(sessionData)
        .expect(201);

      // Assert response
      expect(response.body.session).toBeDefined();
      expect(response.body.qrCode).toBeDefined();
      expect(response.body.session.name).toBe(sessionData.name);

      // Assert database
      const session = await Session.findById(response.body.session._id);
      expect(session).toBeDefined();
      expect(session.organization.toString()).toBe(organizationOne._id.toString());
    });

    it('should not create session with invalid data', async () => {
      const invalidData = {
        name: '', // Invalid: empty name
        type: 'invalid-type', // Invalid: not in enum
        location: {
          latitude: 200, // Invalid: out of range
          longitude: 77.5946
        }
      };

      await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${adminUser.tokens[0].token}`)
        .send(invalidData)
        .expect(400);
    });
  });

  describe('POST /api/sessions/:id/mark-attendance', () => {
    it('should mark attendance for valid session', async () => {
      // Create a test session
      const session = await Session.create({
        name: 'Test Session',
        organization: organizationOne._id,
        createdBy: adminUser._id,
        type: 'regular',
        location: {
          type: 'Point',
          coordinates: [77.5946, 12.9716],
          radius: 100
        },
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000),
        status: 'active',
        qrCode: {
          secret: 'test-secret',
          refreshInterval: 30
        }
      });

      const attendanceData = {
        location: {
          latitude: 12.9716,
          longitude: 77.5946
        },
        device: {
          type: 'mobile',
          userAgent: 'test-agent',
          deviceId: 'test-device'
        }
      };

      const response = await request(app)
        .post(`/api/sessions/${session._id}/mark-attendance`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send(attendanceData)
        .expect(200);

      // Assert response
      expect(response.body.message).toBe('Attendance marked successfully');
      expect(response.body.attendance).toBeDefined();

      // Assert database
      const attendance = await Attendance.findOne({
        user: userOne._id,
        session: session._id
      });
      expect(attendance).toBeDefined();
      expect(attendance.status).toBe('present');
    });

    it('should not allow duplicate attendance', async () => {
      // Create a test session
      const session = await Session.create({
        name: 'Test Session',
        organization: organizationOne._id,
        createdBy: adminUser._id,
        type: 'regular',
        location: {
          type: 'Point',
          coordinates: [77.5946, 12.9716],
          radius: 100
        },
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000),
        status: 'active',
        qrCode: {
          secret: 'test-secret',
          refreshInterval: 30
        }
      });

      // Create existing attendance
      await Attendance.create({
        user: userOne._id,
        session: session._id,
        organization: organizationOne._id,
        location: {
          type: 'Point',
          coordinates: [77.5946, 12.9716]
        },
        device: {
          type: 'mobile',
          userAgent: 'test-agent'
        }
      });

      const attendanceData = {
        location: {
          latitude: 12.9716,
          longitude: 77.5946
        },
        device: {
          type: 'mobile',
          userAgent: 'test-agent',
          deviceId: 'test-device'
        }
      };

      await request(app)
        .post(`/api/sessions/${session._id}/mark-attendance`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send(attendanceData)
        .expect(400);
    });
  });

  describe('GET /api/sessions/:id/statistics', () => {
    it('should return session statistics', async () => {
      // Create a test session
      const session = await Session.create({
        name: 'Test Session',
        organization: organizationOne._id,
        createdBy: adminUser._id,
        type: 'regular',
        location: {
          type: 'Point',
          coordinates: [77.5946, 12.9716],
          radius: 100
        },
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000),
        status: 'active',
        qrCode: {
          secret: 'test-secret',
          refreshInterval: 30
        }
      });

      // Create some attendance records
      await Attendance.create([
        {
          user: userOne._id,
          session: session._id,
          organization: organizationOne._id,
          status: 'present',
          location: {
            type: 'Point',
            coordinates: [77.5946, 12.9716]
          },
          device: {
            type: 'mobile',
            userAgent: 'test-agent'
          }
        },
        {
          user: adminUser._id,
          session: session._id,
          organization: organizationOne._id,
          status: 'late',
          location: {
            type: 'Point',
            coordinates: [77.5946, 12.9716]
          },
          device: {
            type: 'mobile',
            userAgent: 'test-agent'
          }
        }
      ]);

      const response = await request(app)
        .get(`/api/sessions/${session._id}/statistics`)
        .set('Authorization', `Bearer ${adminUser.tokens[0].token}`)
        .expect(200);

      expect(response.body.statistics).toBeDefined();
      expect(response.body.statistics.present).toBe(1);
      expect(response.body.statistics.late).toBe(1);
    });
  });
});
