const CoinGecko = require('coingecko-api');

const CoinGeckoClient = new CoinGecko();

var func = async() => {
    let data = await CoinGeckoClient.coins.fetch('marsdao', {});
    console.log(data.data.market_data.current_price.usd)
};


func()

