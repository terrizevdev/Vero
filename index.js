const express = require('express');
const app = express();
__path = process.cwd();
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 7860;
const checkSessionRouter = require('./validate');

let code = require('./pair');
require('events').EventEmitter.defaultMaxListeners = 500;

// Middleware should go first
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve the validate API route
app.use('/validate/check', checkSessionRouter);

// Serve validate.html on /validate
app.get('/x', (req, res) => {
  res.sendFile(__path + '/validate.html');
});

// Other routes
app.use('/code', code);
app.get('/', (req, res) => {
  res.sendFile(__path + '/pair.html');
});

app.listen(PORT, () => {
    console.log(`
Deployment Successful!

 Keith-Session-Server Running on http://localhost:` + PORT)
});

module.exports = app;




/*const express = require('express');
const app = express();
__path = process.cwd()
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 7860;
const checkSessionRouter = require('./validate');

let code = require('./pair');
require('events').EventEmitter.defaultMaxListeners = 500;
app.use('/code', code);
app.use('/',async (req, res, next) => {
res.sendFile(__path + '/pair.html')
});
app.use('/validate',async (req, res, next) => {
res.sendFile(__path + '/validate.html')
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(PORT, () => {
    console.log(`
Deployment Successful!

 Subzero-Session-Server Running on http://localhost:` + PORT)
})

module.exports = app
       
*/
