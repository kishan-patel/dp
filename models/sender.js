var mongoose = require('mongoose')
  , Schema = mongoose.Schema

var senderSchema = Schema({
  sender_id: Number,
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

