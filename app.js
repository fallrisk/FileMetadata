var express = require('express');
var logger = require('morgan');
var path = require('path');
var router = express.Router();
var RSVP = require("rsvp")
var Promise = RSVP.Promise
var fs = require("fs")
var marked = require("marked")
var multer  = require('multer')
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads")
    },
    filename: (req, file, cb) => {
        //console.log(file)
        cb(null, file.fieldname + "-" + Date.now())
    }
})
var upload = multer({storage: storage}).single("userFile")

var app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'))

// TODO JKW: Need to add a check to see how many files are in the directory "uploads"
// before allowing the upload.

// Routes
////////////////////////////////////////////////////////////////////////////////

router.get("/", function (req, res, next) {
    // Render the README file.
    var p = new Promise(function (res, rej) {
        fs.readFile("README.md", "utf8", function (err, data) {
            if (err) throw err
            res(data)
        })
    }).then(function (val) {
        res.status(200).send(marked(val.toString()))
    })
})

router.get("/upload", (req, res, next) => {
    res.sendFile(__dirname + '/public/uploadForm.html');
})

router.post("/api/upload", (req, res, next) => {
    upload(req, res, (err) => {
        if (err) {
            return res.end("Error uploading file.")
        }
        var fileStats = fs.statSync(req.file.path)
        res.status(200).json({fileSize: fileStats.size})
    })
})

app.use(router)

// Error Handlers
////////////////////////////////////////////////////////////////////////////////

// Development Error Handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// Production Error Handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
