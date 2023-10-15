import { DisconnectReason, Server, Socket } from 'socket.io';

const io = new Server({
  cors: {
    origin: "http://127.0.0.1:5173",
    methods: ["GET", "POST"]
  }
});

let connections = [] as Socket[];

io.on('connection', (socket) => {
  connections.push(socket);

  socket.on('register', (message: { id: string }) => {
    if (!message.id) {
      socket.send('error: wrong format')
      return;
    }

    console.log('registering: ' + message.id)
    socket.data.id = message.id;
  })

  socket.on('message', (message: { recipientId: string, data: any }) => {
    if (!socket.data.id) {
      socket.send('error: not registered yet')
      return;
    }

    console.log(`from: ${socket.data.id} - to: ${message.recipientId}`)

    connections.find(connection => connection.data.id === message.recipientId)?.send({
      senderId: socket.data.id,
      data: message.data
    })
  })

  socket.on('disconnect', (reason: DisconnectReason) => {
    connections = connections.filter(connection => connection.id !== socket.id)
  })
});

io.listen(3000);