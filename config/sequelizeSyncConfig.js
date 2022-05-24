/* eslint-disable no-console */
import db from './databaseConfig.js';

import Tax from '../models/taxModel.js';
import TaxPayer from '../models/taxPayerModel.js';
import User from '../models/userModel.js';

export default () => {
  Tax.belongsTo(TaxPayer);
  TaxPayer.hasMany(Tax);

  User.hasOne(TaxPayer);
  TaxPayer.belongsTo(User);

  db.sync()
    .then(() => {
      console.log('DB sync successful');
    })
    .catch((err) => {
      console.log(err);
    });
};
