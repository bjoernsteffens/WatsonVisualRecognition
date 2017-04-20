var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var fs = require('fs');
var app = express();

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

var watson = require('watson-developer-cloud');
var port = process.env.PORT || process.env.VCAP_APP_PORT || 3000;
var debug = true;

var visual_recognition = watson.visual_recognition({
    //PLACE YOUR API KEY HERE
    // https://www.ibm.com/watson/developercloud/doc/visual-recognition/basic-tutorials.shtml#credentials
    //
    // Find which version is the latest version here
    // https://www.ibm.com/watson/developercloud/doc/visual-recognition/basic-tutorials.shtml#classify
    api_key: '<API KEY>',
    version: 'v3',
    version_date: '2016-05-20'
});

app.listen(port, function() {
  console.log('Server running on port: %d', port);
});

// ============================================================
// Start up the application and serve up index.ejs
app.get('/', function (req, res) {
    console.log( "Web request to '/'" );
    console.log( "Debug is set to " + debug );
    res.render('pages/index');
});

// ============================================================
// Detect faces in an image
app.post('/customclassify', function(req, res) {
    
    if ( debug ) { console.log( "POST request was submitted for creating a new classifier" ) }
    
    var classifier = req.body.classifier;
    var positives  = req.body.positive_file;
    var negatives  = req.body.negative_file;


    if ( debug ) {
        console.log( "Entering the custom classifier code" );
        console.log(classifier);
        console.log(positives);
        console.log(negatives);
    }
    
    var params = {};
    params['name'] = classifier
    params[classifier.toLowerCase() + '_positive_examples'] = fs.createReadStream(positives);
    params['negative_examples'] = fs.createReadStream(negatives);
    
    console.log(params)

    if ( debug ) { console.log( "Calling the Watson API" ) }
    
//    visual_recognition.createClassifier(params, function(err, response) {
//        if (err)
//            console.log(err);
//        else
//            console.log(JSON.stringify(response.classes[0].class));
//    });
       
    visual_recognition.createClassifier(params, function(err, response) {
        if (err) {
            if ( debug ) { console.log( "There was a problem calling the Watson API" ) }
            console.log(err);
        } else {
            // The Watson API call was successful, process the content
            if ( debug ) {
                console.log( "The call to the Watson API was successful, let's render the data" )
                console.log( JSON.stringify(response, null, 2) );
                console.log( response.classes[0].class);
            };
    
            res.render('pages/customclassify',{
                positives:      positives,
                classifierid:   response.classifier_id,
                name:           response.name,
                owner:          response.owner,
                status:         response.status,
                created:        response.created,
                custclass:      response.classes[0].class
            });
        }
    }); 
    
});
