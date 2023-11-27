const grpc = require('@grpc/grpc-js');
const loader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, 'greeter.proto');
const packageDefinition = loader.loadSync(PROTO_PATH);
const greeterProto = grpc.loadPackageDefinition(packageDefinition).greeter;

const CALCULATOR_PROTO_PATH = path.join(__dirname, 'calculator.proto');
const calculatorPackageDefinition = loader.loadSync(CALCULATOR_PROTO_PATH);
const calculatorProto = grpc.loadPackageDefinition(calculatorPackageDefinition).calculator;

const server = new grpc.Server();

server.addService(greeterProto.Greeter.service, {
  SayHello: (call, callback) => {
    const response = { message: `Hello, ${call.request.name}!` };
    callback(null, response);
  },
});

server.addService(calculatorProto.Calculator.service, {
  Sum: (call, callback) => {
    const response = { result: call.request.op1 + call.request.op2 };
    callback(null, response);
  },

  ComputeAverage: (call, callback) => {
    let sum = 0;
    let count = 0;

    call.on('data', (request) => {
      sum += request.value;
      count += 1;
    });

    call.on('end', () => {
      const average = count === 0 ? 0 : sum / count;
      callback(null, { average });
    });
  },

});

const PORT = 50051;
const HOST = 'localhost';

server.bindAsync(
  `${HOST}:${PORT}`,
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) {
      console.error(err);
    } else {
      console.log(`Server running at ${HOST}:${port}`);
      server.start();
    }
  }
);
