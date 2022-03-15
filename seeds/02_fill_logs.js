const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.ETHNODE_URL));
const aib = [
  {
    "indexed":false,
    "internalType":"address",
    "name":"user",
    "type":"address"
  },
  {
    "indexed":false,
    "internalType":"uint256",
    "name":"lotteryId",
    "type":"uint256"
  },
  {
    "indexed":false,
    "internalType":"uint256",
    "name":"reward",
    "type":"uint256"
  }
];

const date = new Date()

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('logs').del()

  for(const trx of await knex('transactions').where({operation_type: 'claimTickets'})) {

    const res = await web3.eth.getTransactionReceipt(trx.hash)
    for(const log of res.logs){
      let data;
      if(log.address === process.env.MARSDAO_SMARTCONTRACT){
        try{
          data = web3.eth.abi.decodeLog(aib, log.data)
        } catch (e){
          console.log(e)
          console.log('Failed to parse transaction log with hash: '+ trx.hash)
        }

        if(data){
          await knex('logs').insert({
            transaction_id: trx.id,
            address: data.user,
            topics: JSON.stringify(log.topics),
            data: data,
            logIndex: log.logIndex,
            operation_type: 'claimTickets',
            tokens_number: data.reward,
            created_at: date,
            updated_at: date,
          })

          console.log(data.user + ' ' + data.reward)
        }


      }
    }
  }

  console.log('finish import transactions')
};
