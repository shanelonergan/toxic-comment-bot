require('dotenv').config()
const SlackBot = require('slackbots');
const axios = require('axios')

// create a bot
const bot = new SlackBot({
    token: process.env.API_TOKEN, // Add a bot https://my.slack.com/services/new/bot and put the token
    name: 'Toxic Comment Bot'
});

const analyzeMessage = (message) => {
    fetchToxicAPI(message)
}

// const fetchToxicAPI = (message) => {
//     fetch('http://max-toxic-comment-classifier.max.us-south.containers.appdomain.cloud/swagger.json/model/predict', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(message)
//     })
//     .then(res => res.json())
//     .then(console.log)
// }

const fetchToxicAPI = (message) => {
    axios.post('http://max-toxic-comment-classifier.max.us-south.containers.appdomain.cloud/model/predict', {
        text: [message]
    })
    .then((res) => {
    console.log(`statusCode: ${res.statusCode}`)
    console.log(res.data.results)
    })
    .catch((error) => {
    console.error(error)
    })
}

bot.on('start', function() {
    // more information about additional params https://api.slack.com/methods/chat.postMessage
    const params = {
        icon_emoji: ':rotating_light:'
    };

    fetchToxicAPI("hello, I don't like you")

    // define channel, where bot exist. You can adjust it there https://my.slack.com/services
    // bot.postMessageToChannel('general', 'sorry', params);

});
