import express from 'express';
let app = express();

import bodyParser from 'body-parser';
import logger from 'morgan';
import mongoose from 'mongoose';
import mongooseTypeEmail from 'mongoose-type-email';
import expressJWT from 'express-jwt';
import jwt from 'jsonwebtoken';


//configuration

// sometimes the configuration is set in a separated file wich will be luanched at the begining
// the bodyParser is set once for all in the main js file. 
// because we do not want to repeat it in all our route files
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// usually, we would define the secret in a separate file
app.use(expressJWT({secret:'mysecret'}).unless({path: ['/login', '/create-user']}));


// conecting our db

mongoose.connect('mongodb://localhost:27017/dbapijwt', function(err){
if (err){ throw err;}
else {console.log('the data base is connected')}
});

// var db = mongoose.connection;


// creating a schema:

let Schema = mongoose.Schema;

let userSchema = new Schema({
	username: { 
		type: mongoose.SchemaTypes.Email, 
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
let User = mongoose.model('user', userSchema);


//defining our routes

app.get('/', (req, res) => {
	console.log('hello world');
});

//create a user
app.post('/create-user', (req, res) => {
 	let body = req.body;
 	console.log('body: ', body);
	
	//validation
 	if (body.username && body.password){

 		var newUser = new User;

 		//retreive the username and password values and assign them to our model
 		newUser.username = req.body.username;
 		newUser.password = req.body.password;
 	
		//saving model to mongoDB
		newUser.save(function(err){
			if(err){
				return err;
			}
			else {
				console.log('user saved');
			}
		});

		//send response
		res.status(200).send('user created');
	}
	else {
		console.log( 'the user could not be save');
	}
});


//login

app.post('/login', (req, res) => {
	let body = req.body;
	console.log('body:', body);

	if (body.username && body.password){
		User.findOne({ 'username': body.username}, function (err, result) {
  		console.log('result found:', result);
  		if(body.password = result.password){
  			//generate the token
  			let token = jwt.sign({ username:req.body.username }, 'mysecret');
  			//save the token in database
  			result.token = token;
  			result.save();
  			//delivrer the token;
  			res.status(200).json(token);
  			console.log('here is our token:', token);
  		}
  		else{
  			console.log('password not correct');
  			res.status(401).send('invalid password');
  		}
		});

	}else{
		console.log('the user is not in our database');
		res.status(401).send('invalid user');
	}

});

app



app.listen('8080', () =>{
	console.log ('app running and listening to port 8080')
});