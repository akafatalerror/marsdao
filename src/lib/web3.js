const Web3 = require('web3');
exports.web3 = new Web3(
    new Web3.providers.HttpProvider(process.env.ETHNODE_URL)
);

