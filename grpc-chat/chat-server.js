const grpc = require('@grpc/grpc-js');
const loader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, 'chat.proto');
const packageDefinition = loader.loadSync(PROTO_PATH);
const chatProto = grpc.loadPackageDefinition(packageDefinition).chat;

const users = new Set();

const server = new grpc.Server();

server.addService(chatProto.Chat.service, {
  Join: (call) => {
    const { username } = call.request;

    if (users.has(username)) {
      call.emit('error', {
        code: grpc.status.ALREADY_EXISTS,
        details: 'Username already in use. Choose a different username.',
      });
      return;
    }

    users.add(username);

    call.on('end', () => {
      users.delete(username);
    });

    server.clients.forEach((client) => {
      client.write({ username: 'Server', content: `${username} joined the chat.` });
    });

    server.clients.add(call);

    call.write({ username: 'Server', content: `Welcome, ${username}!` });
  },

  SendMessage: (call, callback) => {
    const { username, content } = call.request;

    server.clients.forEach((client) => {
      client.write({ username, content });
    });

    callback(null, {});
  },
});

server.clients = new Set();

const PORT = 50052;
const HOST = 'localhost';

server.bindAsync(
  `${HOST}:${PORT}`,
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) {
      console.error(err);
    } else {
      console.log(`Chat server running at ${HOST}:${port}`);
      server.start();
    }
  }
);