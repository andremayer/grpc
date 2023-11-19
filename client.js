const grpc = require('@grpc/grpc-js');
const loader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, 'greeter.proto');
const packageDefinition = loader.loadSync(PROTO_PATH);
const greeterProto = grpc.loadPackageDefinition(packageDefinition).greeter;

const client = new greeterProto.Greeter(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

const name = process.argv[2] || 'World';

client.SayHello({ name }, (error, response) => {
  if (!error) {
    console.log(response.message);
  } else {
    console.error(error);
  }
});
