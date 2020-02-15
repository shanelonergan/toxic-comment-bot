require('dotenv').config()
const SlackBot = require('slackbots');

// create a bot
const bot = new SlackBot({
    token: process.env.API_TOKEN, // Add a bot https://my.slack.com/services/new/bot and put the token
    name: 'Toxic Comment Bot'
});

const analyzeMessage = () => {

}

const fetchToxicAPI = (message) => {
    fetch('http://max-toxic-comment-classifier.max.us-south.containers.appdomain.cloud/swagger.json/model/predict')
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },


}

bot.on('start', function() {
    // more information about additional params https://api.slack.com/methods/chat.postMessage
    const params = {
        icon_emoji: ':rotating_light:'
    };

    // define channel, where bot exist. You can adjust it there https://my.slack.com/services
    bot.postMessageToChannel('general', 'sorry', params);

});
