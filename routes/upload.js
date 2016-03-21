var express = require('express');
var router = express.Router();

var readline = require('readline');
var wait = require('wait.for');

var mongoose = require('mongoose');
mongoose.connect('mongodb://heroku_tfldttfx:15vsse4tjgecu51hr47gtg6v36@ds047335.mlab.com:47335/heroku_tfldttfx');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

/* Create SNP schema */
var SNP;
var dbconn = db.once('open', function() {
	console.log("Database connection established");
	var snpSchema = mongoose.Schema({ 
		rsid: String,
		chromosome: String,
		position: Number,
		allele1: String,
		allele2: String 
	});
	SNP = mongoose.model('SNP', snpSchema)
}); 

/* File Upload POST */
router.post('/', function(req, res, next) {
	try {
		//db.on('open', function() {processFile(req, res);});
		processFile(req, res);
	} catch (e) {
		console.error(e);
		res.status(500).end("An error occured.");
	} 

	function processFile(req, res) {
		req.pipe(req.busboy);
		req.busboy.on('file', function (fieldname, file, filename) {
			console.log("Uploading: " + filename);
			
			var lineReader = readline.createInterface({input: file});
			
			var snps = [];
			
			file.on('data', function(data) {
				var insertCount = snps.length;
				console.log('Next chunk recieved:', data.length, 'bytes of data; attempting to upload', insertCount, 'new records.');
				if (!insertCount) {return;} // Continue stream if no items await insert
				SNP.collection.insert(snps, function(err, docs) {
					if (err) {
						console.error(err);
						res.status(500).end("An error occured: DB insert failed.");
					} else {
						console.log('Inserted', insertCount, 'records succesfully');
					}
				});
				snps = [];
			});
			
			var lineNo = 0;
			lineReader.on('line', function(line) {
				if (lineNo === -1) {return;}
				lineNo++;
				//console.log('Reading line #' + lineNo);
				if (lineNo === 1 && line !== '#AncestryDNA raw data download') {
					res.status(500).end('Invalid file: must be AncestryDNA file export.');
					lineNo = -1;
				} else if (lineNo > 17) { // skip comments and header 
					var lp = line.split('\t'); 
					snps.push({rsid: lp[0], chromosome: lp[1], position: lp[2], allele1: lp[3], allele2: lp[4]});
				}
			});
			
			lineReader.on('close', function() {
				if (!res.finished) {res.send('OK');} else {console.log('not ok');}
			});

		});
	}
});

module.exports = router;


return;

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	console.log("we're in");
	var kittySchema = mongoose.Schema({
		name: String,
		doode: String,
		age: Number
	});
	kittySchema.methods.speak = function () {
		var greeting = this.name ? "Meow name is " + this.name : "I don't have a name";
		console.log(greeting);
	};
	var Kitten = mongoose.model('Kitten', kittySchema);
	var silence = new Kitten({ name: 'Silence' });
	console.log(silence.name); // 'Silence'
	silence.save();
	var fluffy = new Kitten({ name: 'fluffy' });
	fluffy.save(function (err, fluffy) {
		if (err) return console.error(err);
		fluffy.speak();
	});
//	Kitten.find({ name: 'Silence' }).remove().exec();
	/*Kitten.remove({name:'fluffy'}, function(err,removed) {
if (err) return console.error(err);
console.log('removed:', removed.n);
});*/
	Kitten.find(function (err, kittens) {
		if (err) return console.error(err);
		kittens.forEach(function(kitten, i) {
			console.log(kitten.name);
			kitten.doode = 'nop';
			kitten.save();
			kitten.update({age: i+100}).exec();
		});
	});
	/*Kitten.update({name: 'fluffy'}, {'doode': 'why'}, function(err, fluffy) {
if (err) return console.error(err);
console.log('updated', fluffy);
});*/
});

