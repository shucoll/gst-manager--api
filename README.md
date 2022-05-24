# Tax App API

## Overview
This is a simple GST calculation and management app made with Node.js and PostgreSQL.
There are 3 roles - admin, tax-accountant, tax-payer.

API allows login through JWT token based authentication, perform CRUD operations in a Postgres database to create, view or edit the tax.

## Instructions to run

Setup the server and database containers

```sh
docker compose up
```

Run the test cases using docker

```sh
docker exec tax-app-server-1 npm test
```