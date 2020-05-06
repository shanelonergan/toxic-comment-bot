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

// error handler
bot.on('error', (err) => {
    console.log("error:", err);
})

const analyzeMessage = (predictions, username) => {

    const resultValues = Object.values(predictions)
    const checkValues = (value) => value >= 0.75

    if (resultValues.some(checkValues)) {
        let responsePart1 = `it looks like your message contains toxic speech. It has been flagged as: \n\n     🛑 `
        let responsePart2 = '\n\n Please refrain from using this kind of speech. Our slack community is one of love and inclusion, and we would like to keep it that way.'

        let flagsArr = []

        if (predictions.toxic > 0.75) {
            flagsArr.push('toxic')
        } if (predictions.severe_toxic > 0.75) {
            flagsArr.push('severely toxic')
        } if (predictions.obscene > 0.75) {
            flagsArr.push('obscene')
        } if (predictions.threat > 0.75) {
            flagsArr.push('threatening')
        } if (predictions.insult > 0.75) {
            flagsArr.push('insulting')
        } if (predictions.identity_hate > 0.75) {
            flagsArr.push('identity hate')
        }

        const flagsStr = flagsArr.join('\n     🛑 ')

        return responsePart1 + flagsStr + responsePart2
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
        console.log('res: ', res.data)
        console.log("results: ", res.data.results[0])
        responseMessage = analyzeMessage(res.data.results[0].predictions, username)
    })
    .catch((error) => {
        console.error("fetch error: ", error)
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

        bot.postMessageToChannel('general', output, params)
    }
}

// listen to messages
bot.on('message', (data) => {
    const msg = data.text
    const user = data.user

    if(data.type === 'message' && data.subtype !== 'bot_message') {
        handleMessage(msg, user);
    }
})
