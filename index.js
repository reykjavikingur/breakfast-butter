//------------------------------------------------------------------------------
// node.js starter application for hosting
//------------------------------------------------------------------------------

const express    = require('express');
const fs         = require('fs');
const app        = express();
const port       = 3030;

// Use basic auth if .htpasswd file is present
if (fs.existsSync(__dirname + '/.htpasswd')) {
    let auth     = require('http-auth');
    let basic    = auth.basic({
        realm    : "Butter.",
        file     : __dirname + "/.htpasswd"
    });

    app.use(auth.connect(basic));
}


// serve the files out of ./dist
app.use(express.static(__dirname + '/dist'));


// start server on the specified port and binding host
app.listen(port, '0.0.0.0', function() {
    // print a message when the server starts listening
    console.log("[00:00:00] Server running on port " + port);
});
