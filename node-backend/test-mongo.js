const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://admin:admin123@cluster0.soaqc2y.mongodb.net/sec?retryWrites=true&w=majority&appName=Cluster0&authSource=admin';

console.log('Testing with authSource=admin...');

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('SUCCESS: Connected with authSource=admin!');
    process.exit(0);
  })
  .catch(err => {
    console.error('ERROR:', err.message);
    process.exit(1);
  });
