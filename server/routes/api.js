const express = require('express');
const authentication = require('../authentication');
const apiRouter = new express.Router();

const db = require('../database');

apiRouter.get('/user/:username', async (req, res) => {
	try {
		const user = await db.User.findOne({
			where: { username: req.params.username },
			attributes: { exclude: ['password_hash'] }
		});

		res.json({ user: user });
	}
	catch(err) { console.error("api.get(user) error!", err); res.status(401).send(); }
});

apiRouter.post('/connection', authentication.requireAuthenticated, async (req, res) => {	
	try{
		const rooms = await db.Room.findAll({ 
			include: [{ 
				model: db.Message, // include messages
				include: [{ 
					model: db.User, as: 'sender' // include sender to all messages
				}] 
			}],
			order: [[db.Message, 'timestamp']] // order ascending by time 
		});

		res.json({ user: req.user, rooms: rooms });
	}
	catch(err) { console.error("Error on establishing connection", err); res.status(401).send(err); }
});

const authRouter = require('./auth.js');
apiRouter.use('/auth', authRouter);

module.exports = apiRouter;