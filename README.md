# GST Management App API

## Overview
This is a simple GST calculation and management app made with Node.js and PostgreSQL.
There are 3 roles - admin, tax-accountant, tax-payer.

API allows login through JWT token based authentication, perform CRUD operations in a Postgres database to create, view or edit the tax.

Admin - can view taxes of all tax payers
Tax accountants - can create tax, view and edit taxes of all tax payers
Tax payers - can view their taxes and pay their taxes

## Instructions to run

Setup a .env file in root and add

```sh
NODE_ENV=development

JWT_SECRET=some-secret-kay
JWT_EXPIRES_IN=1d

DATABASE=taxapp
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=1234
DATABASE_HOST=localhost
DATABASE_PORT=5432
```

To setup the server and database containers

```sh
docker compose up
```

To run the test cases using docker. Also adds demo data to the database.

```sh
docker exec tax-app-server-1 npm test
```