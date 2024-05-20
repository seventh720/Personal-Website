const express = require('express');
const bodyParser = require('body-parser')

const app = express();

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.use(express.static('public'))


// index page
app.get('/testGet', function(req, res) {	
  let firstName = req.query.firstName
  let surname = req.query.surname
  
  res.send(`
           <!doctype html>
           <head>
           <title>Test GET</title> 
           </head>
           <body>
<strong> First Name:</strong>${firstName} <br>
<strong> Surname:</strong>${surname}
           </body> 
           `);
});


app.post('/testPost', function(req, res) {
	let firstName = req.body.firstName
    let surname = req.body.surname

res.send(`
           <!doctype html>
           <head>
           <title>Test POST</title> 
           </head>
           <body>
<strong> First Name:</strong>${firstName} <br>
<strong> Surname:</strong>${surname}
           </body> 
           `)
  
});


app.get('/test404', function(req, res) {
    
    res.status(404);
    res.send ('Not Found')
});

app.get('/test403', function(req, res) {
     res.status(403);
    res.send ('Forbidden')
});

app.get('/test500', function(req, res) {
    //something that breaks
    let b = z
    
});

app.post('/practical5', function(req, res) {
	let name = req.body.firstName
    let email = req.body.surname
    let gender = req.body.gender
    let genre = req.body.genre
    let username = req.body.username
    let message = req.body.message

res.send(`
           <!doctype html>
           <head>
           <title>Test POST</title> 
           </head>
           <body>
<strong> Name:</strong>${name} <br>
<strong> Email:</strong>${email}<br>
<strong> Gender:</strong>${gender}<br>
<strong> Genre:</strong>${genre}<br>
<strong> Message:</strong>${message}<br>
<strong> User Name:</strong>${username}
           </body> 
           `)
  
});


app.listen(8080);
console.log('Server is listening on port 8080');

