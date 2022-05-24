import seqPkg from 'sequelize';
import bcrypt from 'bcryptjs';

import sequelize from '../config/databaseConfig.js';

const { Sequelize, Model } = seqPkg;

class User extends Model {}

User.init(
  {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    passwordConfirm: {
      type: Sequelize.STRING,
      validate: {
        customValidator(value) {
          if (this.password !== value) throw new Error(`Passwords don't match`);
        },
      },
    },
    role: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        isIn: [['admin', 'tax-accountant', 'tax-payer']],
      },
      defaultValue: 'tax-payer',
    },
  },
  {
    sequelize,
    modelName: 'users',
    defaultScope: {
      attributes: { exclude: ['password', 'passwordConfirm', 'role'] },
    },
    scopes: {
      allFields: {
        attributes: { exclude: [] },
      },
    },
    timestamps: true,
  }
);

User.beforeCreate(async (user) => {
  user.password = await bcrypt.hash(user.password, 12);
  user.passwordConfirm = undefined;
});

export default User;
