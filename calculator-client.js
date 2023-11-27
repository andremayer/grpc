const grpc = require('@grpc/grpc-js');
const loader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, 'calculator.proto');
const packageDefinition = loader.loadSync(PROTO_PATH);
const calculatorProto = grpc.loadPackageDefinition(packageDefinition).calculator;

const client = new calculatorProto.Calculator(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

//const name = process.argv[2] || 'World';

const op1 = process.argv[2];
const op2 = process.argv[3];

client.Sum({ op1, op2 }, (error, response) => {
  if (!error) {
    console.log(response.result);
  } else {
    console.error(error);
  }
});

const computeAverageRequestValues = [1, 2, 3, 4, 5];
const computeAverageCall = client.ComputeAverage((error, response) => {
  if (!error) {
    console.log('Compute Average Result:', response.average);
  } else {
    console.error(error);
  }
});

computeAverageRequestValues.forEach((value) => {
  computeAverageCall.write({ value });
});

computeAverageCall.end();