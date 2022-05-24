import seqPkg from 'sequelize';
import sequelize from '../config/databaseConfig.js';

const { Sequelize, Model } = seqPkg;

class Tax extends Model {}

Tax.init(
  {
    taxableAmt: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: {
        isPositive(value) {
          if (parseInt(value, 10) <= 0) {
            throw new Error('Taxable Amount must be greater than 0');
          }
        },
      },
    },
    cgst: {
      type: Sequelize.INTEGER,
    },
    igst: {
      type: Sequelize.INTEGER,
    },
    sgst: {
      type: Sequelize.INTEGER,
    },
    fine: {
      type: Sequelize.INTEGER,
    },
    dueDate: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    totalTaxDue: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    isPaid: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'taxes',
    timestamps: true,
  }
);

export default Tax;
