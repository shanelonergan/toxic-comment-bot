require('dotenv').config()
const SlackBot = require('slackbots');
const axios = require('axios')

// create a bot
const bot = new SlackBot({
    token: process.env.API_TOKEN, // Add a bot https://my.slack.com/services/new/bot and put the token
    name: 'Toxic Comment Bot'
});

const analyzeMessage = (message) => {
    const results = fetchToxicAPI(message)
    const originalMessage = results.original_text
    const predictions = results.predictions

    let toxicIndicator = false

    let response
    let responsePart1 = 'It looks like your message contains toxic speech. It has been flagged as: '
    let responsePart2 = 'Please refrain from using this kind of speech. Our slack community is one of love and inclusion, and we would like to keep it that way'

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

    return response

}

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

    bot.on('message', msg => {
        analyzeMessage(msg)
        bot.postMessage(msg.user, "hi", { as_user: true }
    })

    // define channel, where bot exist. You can adjust it there https://my.slack.com/services
    // bot.postMessageToChannel('general', 'sorry', params);

});
