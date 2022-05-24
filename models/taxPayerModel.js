/* eslint-disable radix */
import seqPkg from 'sequelize';

import sequelize from '../config/databaseConfig.js';

const { Sequelize, Model } = seqPkg;

class TaxPayer extends Model {}

TaxPayer.init(
  {
    panNum: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: 'taxPayers',
    timestamps: true,
  }
);

export default TaxPayer;
