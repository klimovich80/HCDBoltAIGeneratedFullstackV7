const mongoose = require('mongoose');
const logger = require('./logger');

let isConnected = false;

const connectDB = () => {
  return new Promise((resolve, reject) => {
    if (isConnected) {
      resolve();
      return;
    }

    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/equestrian_crm';

    mongoose.connect(mongoUri)
      .then(() => {
        isConnected = true;
        logger.info('MongoDB подключен успешно');
        resolve();
      })
      .catch(error => {
        logger.error('Ошибка подключения к MongoDB:', error.message);
        if (process.env.NODE_ENV === 'production') {
          reject(error);
        } else {
          // В разработке позволяем серверу запуститься даже без БД
          resolve();
        }
      });

    mongoose.connection.on('error', (error) => {
      logger.error('Ошибка MongoDB:', error);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB отключен');
      isConnected = false;
    });
  });
};

const getConnection = () => {
  return mongoose.connection;
};

module.exports = { connectDB, getConnection };