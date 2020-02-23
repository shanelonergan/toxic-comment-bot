require('dotenv').config()
const SlackBot = require('slackbots');
const axios = require('axios')

// create a bot
const bot = new SlackBot({
    token: process.env.API_TOKEN,
    name: 'Toxic Comment Bot'
});

const params = {
    icon_emoji: ':rotating_light:'
};

const analyzeMessage = (results, username) => {
    const originalMessage = results.original_text
    const predictions = results.predictions

    let toxicIndicator = false

    let response
    let responsePart1 = `it looks like your message contains toxic speech. It has been flagged as: \n\n     -`
    let responsePart2 = '\n\n Please refrain from using this kind of speech. Our slack community is one of love and inclusion, and we would like to keep it that way.'

    for (const flag in predictions) {
        if (predictions[flag] >= 0.75) {
            toxicIndicator = true
        }
    }

    if (toxicIndicator) {
        let flags = []

        if (predictions.toxic > 0.75) {
            flags.push('toxic')
        } if (predictions.severe_toxic > 0.75) {
            flags.push('severely toxic')
        } if (predictions.obscene > 0.75) {
            flags.push('obscene')
        } if (predictions.threat > 0.75) {
            flags.push('threatening')
        } if (predictions.insult > 0.75) {
            flags.push('insulting')
        } if (predictions.identity_hate > 0.75) {
            flags.push('identity hate')
        }

        const flagsStr = flags.join('\n     -')

        response = responsePart1 + flagsStr + responsePart2
    }

    return response

}

const fetchToxicAPI = async (message, username) => {
    let response

    await axios.post('http://max-toxic-comment-classifier.max.us-south.containers.appdomain.cloud/model/predict', {
        text: [message]
    })
    .then((res) => {
    console.log(`statusCode: ${res.status}`)
    console.log(res.data.results[0], 60)
    response = analyzeMessage(res.data.results[0], username)
    })
    .catch((error) => {
    console.error(error.config)
    })

    return response
}

const handleMessage = async (msg, user) => {
    const response = await fetchToxicAPI(msg)
    let username
    const users = await bot.getUsers()

    if (users) {
        const userData = users['members'].filter(member => member.id === user)
        username = userData[0].profile.display_name, 89
    }

    const output = `@${username}, ${response}`

    response ?
    bot.postMessageToChannel('general', output, params)
    : null
}

// start handler
bot.on('start', function() {
    // bot.postMessageToChannel('general', 'I am listening...', params);
});

// error handler
bot.on('error', (err) => {
    console.log(err);
})

// message handler
bot.on('message', function(data) {
    const msg = data.text
    const user = data.user
    console.log(msg, user)
    console.log('data:', data)
    if(data.type !== 'message') {
        return;
    }
    handleMessage(msg, user);
})

