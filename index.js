require('dotenv').config()
const SlackBot = require('slackbots');
const axios = require('axios')

// create a bot
const bot = new SlackBot({
    token: process.env.API_TOKEN, // Add a bot https://my.slack.com/services/new/bot and put the token
    name: 'u WOT m8'
});

const params = {
    icon_emoji: ':rotating_light:'
};

const analyzeMessage = (results, bot) => {
    const originalMessage = results.original_text
    const predictions = results.predictions

    let toxicIndicator = false

    let response
    let responsePart1 = 'It looks like your message contains toxic speech. It has been flagged as: '
    let responsePart2 = '. Please refrain from using this kind of speech. Our slack community is one of love and inclusion, and we would like to keep it that way'

    for (const flag in predictions) {
        if (predictions[flag] >= 0.75) {
            toxicIndicator = true
        }
    }

    if (toxicIndicator) {
        let flags = []

        if (predictions.toxic > 0.75) {
            flags.push('toxic')
        } else if (predictions.severe_toxic) {
            flags.push('severely toxic')
        } else if (predictions.obscene) {
            flags.push('obscene')
        } else if (predictions.threat) {
            flags.push('threatening')
        } else if (predictions.insult) {
            flags.push('insulting')
        } else if (predictions.identity_hate) {
            flags.push('identity hate')
        }

        const flagsStr = flags.join(', ')

        response = responsePart1 + flagsStr + responsePart2
    }

    response ? console.log(response, 49) : null

    return response

}

const fetchToxicAPI = async (message) => {
    let response

    await axios.post('http://max-toxic-comment-classifier.max.us-south.containers.appdomain.cloud/model/predict', {
        text: [message]
    })
    .then((res) => {
    console.log(`statusCode: ${res.status}`)
    console.log(res.data.results[0], 60)
    response = analyzeMessage(res.data.results[0])
    })
    .catch((error) => {
    console.error(error.config)
    })

    return response
}

const handleMessage = async (msg) => {
    const response = await fetchToxicAPI(msg)
    console.log(response, 71)

    bot.postMessageToChannel('bot-testing', response, params);
}

// start handler
bot.on('start', function() {

    // define channel, where bot exist. You can adjust it there https://my.slack.com/services
    bot.postMessageToChannel('bot-testing', 'I am listening...', params);

});

// error handler
bot.on('error', (err) => {
    console.log(err);
})

// message handler
bot.on('message', function(data) {
    console.log(data)
    if(data.type !== 'message') {
        return;
    }
    handleMessage(data.text);
})

