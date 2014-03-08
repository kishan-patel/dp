var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , db = mongoose.connection

var ip_addr = process.env.OPENSHIFT_NODEJS_IP   || '127.0.0.1';
var port    = process.env.OPENSHIFT_NODEJS_PORT || '8080';

// default to a 'localhost' configuration:
var connectionString = '127.0.0.1:27017/dp';

// if OPENSHIFT env variables are present, use the available connection info:
if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
  connectionString = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
  process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
  process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
  process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
  process.env.OPENSHIFT_APP_NAME;
}

mongoose.connect(connectionString);

var senderSchema = Schema({
  sender_id: {type: String, unique: true, index: true},
  times_played: Number,
  max_score: Number,
  alternatives: [{
    alternative: String,
    times_played: Number,
    rewards: Number,
    mean_scores: [{
      x: Number,
      y: Number,
      utc_time: Date
    }],
    ucb_scores: [{
      x: Number,
      y: Number,
      utc_time: Date
    }]   
  }]
});

exports.Sender = mongoose.model('Sender', senderSchema);

