var express = require('express');
var app = require('express')();
var server = require('http').Server(app);
var path = require('path');
var Twitter = require('twitter');
var io = require('socket.io')(server);
var sentiment = require('sentiment');
var port = 3000;
var topic = 'obama';

// Setup view engine
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'jade');

// More set up
app.use(express.static(path.join(__dirname, '/public')));

//Create server
server.listen(port, function(){
	console.log('Now listening on port: %s', port);
});

//Set up db
/*
mongoose.connect('mongodb://localhost/Sentiment');
var sentiSchema = new Schema({
	score: Number,
	tokens: Array
});

*/
//var SentimentModel = mongoose.model('SentimentModel',sentiSchema);

//new SentimentModel({
	//score: 5,
	//tokens: ['hello','world']
//});



//For security, variables were defined as enviroment variables
//Use "export <variable name>=<key>" in terminal to define your keys and token
var twit = new Twitter({
	consumer_key: "w6Zw0290V8K7tJUZixqMLWqhi",
	consumer_secret: "K3SuwDJpYonmf4tGlNKmZ3l0ls1kD6Y422i55IzcHhri1Mg8c9",
	access_token_key: "2275761036-KjRPsgvkXaQK9qs3ca6NyBHZSydsItEHsVm78GF",
	access_token_secret: "sZhAKjV9iiRsVcCqiCyz6hIU3XOz0Ej38xQ0JviE6uIOm"
});

//Turn on socket-io
io.on('connection', function(socket){
	console.log("socket connected");

	socket.on("topic", function(topic) {
		var score = {
			total:0,
			pos:0,
			neg:0,
			neu: 0,
			currentScore: 0,
			tweet: ""
		}
		console.log(topic);
		twit.stream('statuses/filter', {track: topic, language:'en'}, function(stream) {
			stream.on("data", function(tweet) {
				console.log(tweet);
				var senti = sentiment(tweet.text);
				score.total++;
				score.currentScore = senti.score;
				score.tweet = tweet.text;

				if (senti.score === 0) {
					score.neu++;
				} 
				else if (senti.score < 0) {
					score.neg++;
				}
				else {
					score.pos++;
				}
				io.emit("data",score);
			})
			twit.currentStream = stream;	
		});
		
	});

	socket.on("stopStreaming", function(data) {
		twit.currentStream.destroy();
	});
});

app.get('/', function(req,res){
	res.render('index');
});

module.exports = app;