/* eslint-disable no-undef */
// eslint-disable-next-line node/no-unpublished-import
import request from 'supertest';
import app from '../app.js';
import db from '../config/databaseConfig.js';
import TaxPayer from '../models/taxPayerModel.js';
import User from '../models/userModel.js';
import Tax from '../models/taxModel.js';

import { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const taxPayers = JSON.parse(
  fs.readFileSync(`${__dirname}/test-data/taxPayers.json`, 'utf-8')
);

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/test-data/users.json`, 'utf-8')
);

beforeAll(async () => {
  // wait to let the database setup
  await new Promise((resolve) => setTimeout(resolve, 2000));

  try {
    await TaxPayer.destroy({
      cascade: true,
      truncate: true,
    });
    await User.destroy({
      cascade: true,
      truncate: true,
    });
    await Tax.destroy({
      cascade: true,
      truncate: true,
    });
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }

  try {
    await User.bulkCreate(users);
    await TaxPayer.bulkCreate(taxPayers);
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
});

afterAll((done) => {
  db.close();
  done();
});

//Get all tax list
describe('GET /api/taxes/all-taxes ', () => {
  describe('with no authentication', () => {
    test('Should give un authenticated message', async () => {
      const response = await request(app).get('/api/v1/taxes/all-taxes');
      expect(response.statusCode).toBe(401);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe(
        'You are not logged in! Please log in to get access.'
      );
    });
  });

  describe('with auth but no authorization', () => {
    test('Should give un authorized message', async () => {
      const response = await request(app).post('/api/v1/users/login').send({
        email: 'user1@test.com',
        password: 'test1234',
      });

      const response2 = await request(app)
        .get('/api/v1/taxes/all-taxes')
        .set('Authorization', `Bearer ${response.body.token}`);

      expect(response2.statusCode).toBe(403);
      expect(response2.body.status).toBe('fail');
      expect(response2.body.message).toBe(
        'You do not have permission to perform this action'
      );
    });
  });

  //only accountants and admins should be able to access
  describe('with proper auth and authorization', () => {
    test('Should give response as an array of tax details', async () => {
      const response = await request(app).post('/api/v1/users/login').send({
        email: 'accountant1@test.com',
        password: 'test1234',
      });

      const response2 = await request(app)
        .get('/api/v1/taxes/all-taxes')
        .set('Authorization', `Bearer ${response.body.token}`);

      expect(response2.statusCode).toBe(200);
      expect(response2.body.status).toBe('success');
      expect(Array.isArray(response2.body.data)).toBe(true);
    });
  });
});

//Create new Tax
describe('GET /api/taxes/create-tax ', () => {
  //admin and users should not be able to do this
  describe('with auth but no authorization', () => {
    test('Should give un authorized message', async () => {
      const response = await request(app).post('/api/v1/users/login').send({
        email: 'admin@test.com',
        password: 'test1234',
      });

      const response2 = await request(app)
        .post('/api/v1/taxes/create-tax')
        .send({
          taxInfo: {
            taxableAmt: 52000,
            cgst: 6,
            igst: 6,
            sgst: 0,
            dueDate: '2022-10-26 20:07:20.123+05:45',
          },
          taxPayerInfo: {
            panNum: '334567',
          },
        })
        .set('Authorization', `Bearer ${response.body.token}`);

      expect(response2.statusCode).toBe(403);
      expect(response2.body.status).toBe('fail');
      expect(response2.body.message).toBe(
        'You do not have permission to perform this action'
      );
    });
  });

  //only accountants should be able to create
  describe('with proper auth and authorization', () => {
    test('Should create a new Tax in database and return the info', async () => {
      const response = await request(app).post('/api/v1/users/login').send({
        email: 'accountant1@test.com',
        password: 'test1234',
      });

      const response2 = await request(app)
        .post('/api/v1/taxes/create-tax')
        .send({
          taxInfo: {
            taxableAmt: 52000,
            cgst: 6,
            igst: 6,
            sgst: 0,
            dueDate: '2022-10-26 20:07:20.123+05:45',
          },
          taxPayerInfo: {
            panNum: '334567',
          },
        })
        .set('Authorization', `Bearer ${response.body.token}`);

      expect(response2.statusCode).toBe(200);
      expect(response2.body.status).toBe('success');
      expect(response2.body.data.totalTaxDue).toBe(6240);
    });
  });
});
