var ip_addr = process.env.OPENSHIFT_NODEJS_IP   || '127.0.0.1';
var port    = process.env.OPENSHIFT_NODEJS_PORT || '8080';

// default to a 'localhost' configuration:
var connection_string = '127.0.0.1:27017/dp';
// if OPENSHIFT env variables are present, use the available connection info:
if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
  connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
  process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
  process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
  process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
  process.env.OPENSHIFT_APP_NAME;
}

var mongojs = require('mongojs');
var db = mongojs(connection_string, ['books']);
var books = db.collection('books');
// similar syntax as the Mongo command-line interface
// log each of the first ten docs in the collection
db.books.find({}).limit(10).forEach(function(err, doc) {
  if (err) throw err;
  if (doc) { console.dir(doc); }
});

//mongodb://$OPENSHIFT_MONGODB_DB_HOST:$OPENSHIFT_MONGODB_DB_PORT/
