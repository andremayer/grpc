const grpc = require('@grpc/grpc-js');
const loader = require('@grpc/proto-loader');
const readline = require('readline');
const path = require('path');

const PROTO_PATH = path.join(__dirname, 'chat.proto');
const packageDefinition = loader.loadSync(PROTO_PATH);
const chatProto = grpc.loadPackageDefinition(packageDefinition).chat;

const client = new chatProto.Chat(
  'localhost:50052',
  grpc.credentials.createInsecure()
);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let username;

rl.question('Enter your username: ', (answer) => {
  username = answer;

  const joinRequest = { username };
  const joinStream = client.Join(joinRequest);

  joinStream.on('data', (message) => {
    console.log(`${message.username}: ${message.content}`);
  });

  joinStream.on('error', (error) => {
    console.error('Error:', error.details);
    rl.close();
  });

  joinStream.on('end', () => {
    console.log('Server closed the connection.');
    rl.close();
  });

  rl.prompt();
  rl.on('line', (line) => {
    const messageRequest = { username, content: line.trim() };
    client.SendMessage(messageRequest, (error) => {
      if (error) {
        console.error('Error sending message:', error.details);
        rl.close();
      }
    });
    rl.prompt();
  });
});

rl.on('close', () => {
  client.close();
  process.exit(0);
});