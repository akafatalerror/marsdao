const {db} = require('./lib/db');
const axios = require("axios");
const InputDataDecoder = require('ethereum-input-data-decoder');
const decoder = new InputDataDecoder('./abi.json');
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.ETHNODE_URL));

const usdRate=568/1800;

exports.getLeadersBoard = async () =>
     await db.raw(`
        select claim.address, claim.won, buy.tickets,  claim.won * ${usdRate} as won_usd 
        from (
            select sum(tokens_number) / 1000000000000000000 as won, address   from logs  group by "address" order by won desc
        ) as claim
          inner join (
              select sum(tokens_number) as tickets, "from" from transactions where operation_type = 'buyTickets' group by "from"
            ) as buy on lower(claim.address) = lower(buy.from)
        order by won desc
        limit 100 
    `)

exports.updateTransactions = async () => {
     const lastBlock = (await db('transactions').max('blockId'))[0]?.max;
     const url = (new URL(process.env.BSCSCAN_BASEURL))
     const operationsFilter = ['buyTickets', 'claimTickets'];
     const date = new Date()
     const storeData = [];

     const params = {
          module: 'account',
          action: 'txlist',
          address: process.env.MARSDAO_SMARTCONTRACT,
          startblock: lastBlock ?? 0,
          endblock: 99999999,
          page: 0,
          offset: 0,
          sort: 'asc',
          apikey: process.env.BSCSCAN_TOKEN,
     }
     Object.keys(params).forEach(paramName => url.searchParams.append(paramName, params[paramName]))

    await axios.get(url.toString()).then(response => {

          if(response?.data?.status === '1' && response?.data?.result?.length){

               response.data.result.forEach(item => {

                    const decodedInput = decoder.decodeData(item.input)
                    if(operationsFilter.includes(decodedInput.method)){
                         storeData.push({
                              hash: item.hash,
                              from: item.from,
                              to: item.to,
                              blockId: item.blockNumber,
                              operation_type: decodedInput.method,
                              tokens_number: web3.utils.hexToNumber(decodedInput.inputs[0]._hex),
                              created_at: date,
                              updated_at: date,
                         })
                    }

               })
          } else {
               throw new Error('Failed to get data');
          }

     })

     for (const trx of storeData) {
          await db('transactions').insert(trx);
     }
}

exports.parseLogs = async () => {
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
     const transactions = await db('transactions').select(db.raw('transactions.*'))
         .leftJoin('logs', 'transactions.id', '=', 'logs.transaction_id')
         .whereNull('logs.id')
         .where({
              'transactions.operation_type': 'claimTickets'
         })

     for(const trx of await transactions) {
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
                         await db('logs').insert({
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

}
