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

const analyzeMessage = (predictions, username) => {

    const resultValues = Object.values(predictions)
    const checkValues = (value) => value >= 0.75

    if (resultValues.some(checkValues)) {
        let responseMessage
        let responsePart1 = `it looks like your message contains toxic speech. It has been flagged as: \n\n     🛑 `
        let responsePart2 = '\n\n Please refrain from using this kind of speech. Our slack community is one of love and inclusion, and we would like to keep it that way.'

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

        const flagsStr = flags.join('\n     🛑 ')

        responseMessage = responsePart1 + flagsStr + responsePart2

        return responseMessage
    } else {
        return null
    }
}

const fetchToxicAPI = async (message, username) => {
    let responseMessage

    await axios.post('http://max-toxic-comment-classifier.max.us-south.containers.appdomain.cloud/model/predict', {
        text: [message]
    })
    .then((res) => {
        console.log(`res:`, res.data)
        console.log(res.data.results[0], 60)
        responseMessage = analyzeMessage(res.data.results[0].predictions, username)
    })
    .catch((error) => {
        console.error(error.config)
    })

    return responseMessage
}

const handleMessage = async (msg, user) => {
    const responseMessage = await fetchToxicAPI(msg)
    let username
    const users = await bot.getUsers()

    if (users && responseMessage) {
        const userData = users['members'].filter(member => member.id === user)
        username = userData[0].profile.display_name

        const output = `${username}, ${responseMessage}`

        bot.postMessageToChannel('bot-testing', output, params)
    }
}

// const handleMessage = async (msg, user) => {
//     const responseMessage = await fetchToxicAPI(msg)

//     bot.postMessageToChannel('bot-testing', responseMessage, params)
// }

// error handler
bot.on('error', (err) => {
    console.log(err);
})

// message handler
bot.on('message', (data) => {
    const msg = data.text
    const user = data.user

    console.log(data)

    if(data.type === 'message' && data.subtype !== 'bot_message') {
        handleMessage(msg, user);
    }
})

