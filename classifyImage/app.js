var express = require('express');
var bodyParser = require('body-parser');
var urlExists = require('url-exists');
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
// Classify an image
app.post('/classifyimage', function(req, res) {

    if ( debug ) { console.log( "POST request was submitted for classification of an image" ) }
    var imageurl = req.body.imgurl;

    urlExists(imageurl, function(err, exists) {

        if ( exists ) {

            if ( debug ) {
                console.log( "Entering the classification code" );
                console.log( "Does the URL actually exist => " + exists );
            }

            var params = {
                // Usage images_file to pass in a file from the local file system
                //images_file: fs.createReadStream('images_animals/bws_5d_turkey_061.jpg')

                //Use url to pass in an image from the Internet
                url: imageurl
            };

            if ( debug ) { console.log( "Calling the Watson API" ) }
            visual_recognition.classify(params, function(err, classification) {
                if (err) {
                    if ( debug ) { console.log( "There was a problem calling the Watson API" ) }
                    console.log(err);
                } else {
                    // The Watson API call was successful, process the content
                    if ( debug ) {
                        console.log( "The call to the Watson API was successful, let's render the data" )
                        console.log( JSON.stringify(classification) );
                    };
                    res.render('pages/classifyimage',{
                    mytext: imageurl,
                    images: classification.images[0].classifiers[0].classes
                    });
                }
            });
        }
    });
});
