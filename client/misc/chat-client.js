import api from '../api';

export default class ChatClient {

	constructor(socket, data) {
		this.socket = socket;
		this.isConnected = true;

		this.rooms = data.rooms;
	//  this.users = [] ?

		socket.on('messages', payload => {
			if(payload.action !== 'create') {
				return;
			}

			const room = this.rooms.find(room => room.name === payload.room);
			if(!room) {
				console.error("Message received, but room was not found: " + payload.room + ": " + payload.message);
				return;
			}

			room.messages.push(payload.message);
		});

		socket.on('rooms', payload => {
			if(payload.action === 'create') {
				this.rooms.push(payload.room);
			}
		//  else if(payload.action === 'delete') // todo
		});
	}

	sendMessage(payload) {
		if(!this._ensureIsConnected()) {
			return;
		}

		this.socket.emit('messages', { action: 'create', room: payload.room, message: payload.message });
	}

	createRoom(roomName) {
		if(!this._ensureIsConnected()) {
			return;
		}

		this.socket.emit('rooms', { action: 'create', room: { name: roomName } });
	}

	disconnect() {
		if(!this.isConnected) {
			console.log("Disconnecting even though already disconnected");
		}

		// todo: calling this ensures that one user can't be connected to server
		// on multiple web sockets. however, this might not always be called (?)
		// so the check should definitely be done server-side too
		this.socket.disconnect();
	}

	isConnected() {
		return this.isConnected;
	}

	_ensureIsConnected() {
		if(!this.isConnected) {
			console.error("Trying to use ChatClient but client is not connected");
			return false;
		}

		return true;
	}

	static openConnection() {
		return new Promise((resolve, reject) => {

			api.openConnection()
			.then(response => {

				const socket = io.connect();
				const client = new ChatClient(socket, { rooms: response.data.rooms });

				socket.on('connect_error', err => reject(err));
				socket.on('connect', () => { 
					resolve({ chatClient: client, user: response.data.user });
				});
			}) 
			.catch(err => reject(err));
		});
	}	
};