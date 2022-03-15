const http = require('http');
const staticServer = require('node-static');
const fileServer = new staticServer.Server('./public');
const { getLeadersBoard, updateTransactions, parseLogs} = require('./src/service')
const cron = require('node-cron');

http.createServer(async function(request, response) {
    switch (request.url) {
        case '/':
            fileServer.serveFile('/index.html', 200, {}, request, response);
            break;
        case '/data':
            const data = await getLeadersBoard()
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify(data));

    }
}).listen(process.env.APP_PORT || 7777)

cron.schedule('* * * * *', async () => {
    console.log('Update started')
    await updateTransactions();
    await parseLogs();
});
