import { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

import db from '../config/databaseConfig.js';
import sequelizeSync from '../config/sequelizeSyncConfig.js';
import TaxPayer from '../models/taxPayerModel.js';
import User from '../models/userModel.js';
import Tax from '../models/taxModel.js';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

db.authenticate()
  .then(() => console.log('Database connected...'))
  .catch((err) => console.log(`Error: ${err}`));

sequelizeSync();

const taxPayers = JSON.parse(
  fs.readFileSync(`${__dirname}/taxPayers.json`, 'utf-8')
);

const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));

const importData = async () => {

  // wait to let the database setup
  await new Promise((resolve) => setTimeout(resolve, 2000));

  try {
    await User.bulkCreate(users);
    await TaxPayer.bulkCreate(taxPayers);

    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await TaxPayer.drop({
      cascade: true,
    });
    await User.drop({
      cascade: true,
    });
    await Tax.drop({
      cascade: true,
    });
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

//Import data
// node ./data/import-data.js --import

//Delete data
// node ./data/import-data.js --delete
