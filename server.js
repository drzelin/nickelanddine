// Initialization
var express = require('express');
var bodyParser = require('body-parser');
var validator = require('validator');
var app = express();
var http_request = require('request');

// Set up body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded( {extended: true }));

// Set up Mongo

var mongoURI = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/test';
var MongoClient = require('mongodb').MongoClient, format = require('util').format;
var db = MongoClient.connect(mongoURI, function(error, databaseConnection) {
    db = databaseConnection;
});

// Set up CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Use /public to get files
app.use(express.static('public'));

app.get('/get_menus', function(request, response) {
	var input = request.query;
	// check for parameters, and NO '<' characters for anti-XSS
	if (input.fooditem != undefined && (input.fooditem).indexOf("<") == -1 ) {
	
		db.collection('restaurants', function(db_error, collection) {
			if (db_error) {
				response.sendStatus(500);
			}
			else {
				var query = input.fooditem.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
				var r_query = RegExp(".*" + query + ".*", "i");
				
				collection.find({"menu.food": r_query}, {_id:0} ).toArray(function (arr_error, arr) {
					if (arr_error) {
						response.sendStatus(500);
					}
					else {
						response.send(arr);
					}
				});
			}
		});
	}
	else {
		response.sendStatus(400);
	}

});

app.get('/get_fees', function(request, response) {
	var input = request.query;
	// check for parameters, and NO '<' characters for anti-XSS
	if (input.restaurant != undefined && (input.restaurant).indexOf("<") == -1 ) {
	
		db.collection('min', function(db_error, collection) {
			if (db_error) {
				response.sendStatus(500);
			}
			else {
				collection.findOne({"Restaurant": input.restaurant}, {_id:0}, function (error, doc) {
					if (error) {
						response.sendStatus(500);
					}
					else {
						response.send(doc);
					}
				});
			}
		});

	}
	else {
		response.sendStatus(400);
	}

});

app.get('/sendEmail', function(request, response) {
	var input = request.query;
	var nodemailer = require('nodemailer');

	if (input.order != undefined && input.restaurant != undefined && input.price != undefined && input.email !=undefined && input.name != undefined) {
		var order = htmlEscape(input.order);
		var restaurant = htmlEscape(input.restaurant);
		var price = htmlEscape(input.price);
		var email = htmlEscape(input.email); 
		var name = htmlEscape(input.name);

		// create reusable transporter object using SMTP transport
		var transporter = nodemailer.createTransport({
    		service: 'Gmail',
    		auth: {
        		user: 'nickelanddine@gmail.com',
        		pass: 'GoTeam8!'
    		}
		});


		// setup e-mail data with unicode symbols
		var mailOptions = {
			from: 'Nickel & Dine  <nickelanddine@gmail.com>', // sender address
			to: name + '<' + email + '>', // list of receivers
			subject: 'Your Nickel & Dine Order', // Subject line
			text: 'Hi ' + name + '! Thank you for ordering with Nickel & Dine.\nHere is a summary of the order that you chose:\nYour order is from ' + restaurant + ' at a cost of $' + price + '.\nThe items in your order are: ' + order + '.\n\nThank you again for choosing Nickel & Dine!', // plaintext body
			html: '<p>Hi ' + name + '! Thank you for ordering with Nickel & Dine.</p><p>Here is a summary of the order that you chose:</p><p>Your order is from ' + restaurant + ' at a cost of $' + price + '.</p><p>The items in your order are: ' + order + '.</p><br><p>Thank you again for choosing Nickel & Dine!</p>' // html body
		};

		// send mail with defined transport object
		transporter.sendMail(mailOptions, function(error, info){
			if(error){
				response.sendStatus(500);
			}else{
				response.send(200);
			}
		});
	}
	else {
		response.send(400);
	}
	
	function htmlEscape(text) {
		return text.replace(/&/g, '&amp;').
			replace(/</g, '&lt;').
			replace(/"/g, '&quot;').
			replace(/'/g, '&#039;');
	}
});
app.get('/salesTax', function(request, response) {
	input = request.query;
	if (input.zip != undefined && validator.isNumeric(input.zip)) {
		http_request({
			url: 'https://taxrates.api.avalara.com:443/postal' + '?' + 'country=usa&postal=' + input.zip,
			headers: {
				'Authorization': 'AvalaraApiKey naNbsuxrJO0N6ImkfhOwYXlBnsE7fGScDYc01vIrhecsS+gJ0S6tpLB0k85i7tLLY5Rc1yONTVR/wRFh5fngYQ=='
			},
			method: 'GET',
			//Lets post the following key/values as form
		}, function(error, resp, body){
			rate = 0;
			body = JSON.parse(body);
			if (body.totalRate != undefined) {
				body.totalRate = parseFloat(body.totalRate) / 100;
				response.send((body.totalRate).toString());
			}
			else response.sendStatus(500);
		});
	}
	else response.sendStatus(400);
});

function htmlEscape(text) {
	return text.replace(/&/g, '&amp;').
		replace(/</g, '&lt;').
		replace(/"/g, '&quot;').
		replace(/'/g, '&#039;');
}
app.listen(process.env.PORT || 3000);
