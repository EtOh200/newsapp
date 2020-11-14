const express = require('express');
const Redis = require('ioredis');
const bodyParser = require('body-parser');
const path = require('path');

const WebSocket = require('ws'); 
const { Socket } = require('dgram');

const app = express();

//connect ws to port
const socketServer = new WebSocket.Server({port:3030});
const messages = ['Start news Feed!'];

socketServer.on('connection', (socketClient) => {
    //connection event is fired when frontend client hits this server
    console.log('connected');
    console.log('Number of clients: ', socketServer.clients.size);
    socketClient.send(JSON.stringify(messages));

    socketClient.on('message', (message) => {
        messages.push(message);
        console.log(socketServer.clients)
        socketServer.clients.forEach((client) => {
            if(client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify([message]));
            }
        });
    });

    //client methods are nested inside server connection
    socketClient.on('close', (socketClient) => {
        console.log('closed');
        console.log('Number of clients: ', socketServer.clients.size);
    });
});

//parsing requests
app.use(bodyParser({ urlencoded: true }));
app.use(express.json())

//serve static files
app.use(express.static('client'));

//TESTING WEBSOCKET
app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname, '/client/index.html'))
})


const channel = "hi"
//use to add subscriber to certain channel
//for now always being added to channel "hi"
app.use('/sub', (req, res) => {
    const redis = new Redis();
    redis.subscribe(channel, (error, count) => {
        if (error) {
            throw new Error(error);
        }
        console.log(`Subscribed to ${count} channel. Listening for updates on the ${channel} channel.`);
    });
    redis.on('message', (channel, message) => {
        console.log(`Received the following message from ${channel}: ${message}`);
    });
    // console.log(redis)
    res.send('sub')
})

//use to publish to channel
//rn always publishing to "hi"
app.use('/pub', (req, res) => {
    let redis = new Redis();
    redis.publish(channel, "hi")
    res.send('pub')
})

//get all channels
app.use('/getchannels', (req, res) => {
    let redis = new Redis();
    redis.pubsub('channels', (err, channels) => {
        if (err) {

        } else {
            console.log('Channels:', channels); // array
        }
    });

    res.send('getchannels')
})

//get subscribers to certain channel
//rn always hi
app.use('/numsub', (req, res) => {
    let redis = new Redis();
    redis.pubsub('numsub', channel, (err, channels) => {
        if (err) {

        } else {
            console.log('Channels:', channels); // array
        }
    });

    res.send('numsub')
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});


app.post('/login', (req, res) => {
    //check the credenitals user and pw from req.body
    //if the user is an admin --> redirect to adminview?
    //if the user is a user --> redirect to userview?
});

app.get('/userview', /**send userid? and sendFile userview? */)

app.get('/adminview', /**send userid? and sendFile adminview? */)




const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
});