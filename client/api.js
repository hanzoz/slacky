import axios from 'axios';

export default {
	login(userCredentials) {	
		return new Promise((resolve, reject) => {		

			axios.post('/api/auth/login', userCredentials)
			.then((response) => resolve(response.data.user))
			.catch(err => console.log(err));
		});
	},

	register(userCredentials) {
		return new Promise((resolve, reject) => {

			axios.post('/api/auth/register', userCredentials)
			.then((response) => resolve(response.data.user))
			.catch(err => reject(err));
		});
	},

	validateCredentials(userCredentials) {
		return new Promise((resolve, reject) => {

			axios.post('/api/auth/validate-credentials', userCredentials)
			.then((response) => resolve(response.data.valid) )
			.catch(err => reject(err));
		});
	},

	getUser(username) {
		return new Promise((resolve, reject) => {
			
			axios.get('/api/user/' + username)
			.then((response) => resolve(response.data.user))
			.catch(err => reject(err));
		});
	},

	establishConnection(onNewMessage) {
		return new Promise((resolve, reject) => {

			axios.post('/api/connection')
			.then(response => {

				const isHeroku = process.env.PLATFORM === 'heroku';
				console.log("Is heroku: " + isHeroku);
				console.log(process.env);
				const socket = isHeroku ? io.connect() : io.connect(); // io.connect('http://localhost:' + response.data.port);
				socket.on('messages', function(data) {
					onNewMessage(data);
				});
				
				const initialData = response.data.rooms;
				resolve({ rooms: initialData, sendMessageFunc: message => {
					socket.emit('messages', message);	
				} });
			}) 
			.catch(err => reject(err));
		});
	}
}