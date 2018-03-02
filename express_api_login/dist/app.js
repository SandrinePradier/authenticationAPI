'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _mongooseTypeEmail = require('mongoose-type-email');

var _mongooseTypeEmail2 = _interopRequireDefault(_mongooseTypeEmail);

var _expressJwt = require('express-jwt');

var _expressJwt2 = _interopRequireDefault(_expressJwt);

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();

//configuration

// sometimes the configuration is set in a separated file wich will be luanched at the begining
// the bodyParser is set once for all in the main js file. 
// because we do not want to repeat it in all our route files
app.use(_bodyParser2.default.json()); // for parsing application/json
app.use(_bodyParser2.default.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// usually, we would define the secret in a separate file
app.use((0, _expressJwt2.default)({ secret: 'mysecret' }).unless({ path: ['/login', '/create-user'] }));

// conecting our db

_mongoose2.default.connect('mongodb://localhost:27017/dbapijwt', function (err) {
	if (err) {
		throw err;
	} else {
		console.log('the data base is connected');
	}
});

// var db = mongoose.connection;


// creating a schema:

var Schema = _mongoose2.default.Schema;

var userSchema = new Schema({
	username: {
		type: _mongoose2.default.SchemaTypes.Email,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	token: {
		type: String
	}
});

// creation of a model based on our Schema
var User = _mongoose2.default.model('user', userSchema);

//defining our routes

app.get('/', function (req, res) {
	console.log('hello world');
});

//create a user
app.post('/create-user', function (req, res) {
	var body = req.body;
	console.log('body: ', body);

	//validation
	if (body.username && body.password) {

		var newUser = new User();

		//retreive the username and password values and assign them to our model
		newUser.username = req.body.username;
		newUser.password = req.body.password;

		//saving model to mongoDB
		newUser.save(function (err) {
			if (err) {
				return err;
			} else {
				console.log('user saved');
			}
		});

		//send response
		res.status(200).send('user created');
	} else {
		console.log('the user could not be save');
	}
});

//login

app.post('/login', function (req, res) {
	var body = req.body;
	console.log('body:', body);

	if (body.username && body.password) {
		User.findOne({ 'username': body.username }, function (err, result) {
			console.log('result found:', result);
			if (body.password = result.password) {
				//generate the token
				var token = _jsonwebtoken2.default.sign({ username: req.body.username }, 'mysecret');
				//save the token in database
				result.token = token;
				result.save();
				//delivrer the token;
				res.status(200).json(token);
				console.log('here is our token:', token);
			} else {
				console.log('password not correct');
				res.status(401).send('invalid password');
			}
		});
	} else {
		console.log('the user is not in our database');
		res.status(401).send('invalid user');
	}
});

app;

app.listen('8080', function () {
	console.log('app running and listening to port 8080');
});