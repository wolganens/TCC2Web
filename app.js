const express = require('express');
const cors = require('cors')
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const researchersRouter = require('./routes/researchers');

const app = express();
app.options('*', cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
/*app.use(express.static(path.join(__dirname, 'client', 'build')));*/
app.use(express.static(path.join(__dirname, 'public')));

app.use('/researchers', cors(), researchersRouter)
app.get('/*', cors(), function(req, res, next) {
	if (!req.xhr) {
		/*res.sendFile(path.join(__dirname, 'client','build', 'index.html'), function(err) {*/
		res.sendFile(path.join(__dirname, 'public','index.html'), function(err) {
			if (err) {
			  res.status(500).send(err)
			}
		})
	}
})

module.exports = app;
