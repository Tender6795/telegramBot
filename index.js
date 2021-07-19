const TelegramApi = require('node-telegram-bot-api')
const constants = require('./constants')
const fetch = require('node-fetch');
const nlp = require('compromise')
nlp.extend(require('compromise-numbers'))

const { NlpManager } = require('node-nlp');
const trainnlp = require('./train-nlp');
const { fs } = require('./fs');


const nlp2 = new NlpManager({ languages: ['en'], forceNER: true });
nlp2.container.register('fs', fs);

const testNlpJs = async (text) => {
    console.log('user say: ', text)
    await trainnlp(nlp2); 
    const result = await nlp2.process('en', text);
    console.log('bot say: ', result.answer)
    return result.answer || "((((";
}




const testCompomise = (text) => {
    let doc = nlp(text)
    // doc.verbs().toPastTense() //в прошедшее время
    // doc.nouns().toPlural() //к множественному
    // doc.numbers().add(21) // добавляет число
    // doc.numbers().minus(1) // отнимает число
    // doc.contractions().expand() // убирает сокращения 
    // doc.verbs().toNegative() // делает отрицание

    // doc.match('The #Adjective course ') // ???
    // doc.people().if('mary').json()  // ?
    // return doc.people().if('mary').json().text// ?

    return doc.text()

    // if (doc.has(['course', 'world', 'мир'])) {
    //     return 'Success'
    // }
    // return 'Bad'
}



const getCourse = async () => {
    const res = await fetch(constants.URL)
    const cource = await res.json()
    return cource
}


const bot = new TelegramApi(constants.TOKEN, { polling: true })

bot.setMyCommands([
    { command: constants.TEXT, description: 'cource USD to UAH' }
])

bot.on('message', async msg => {
    const { text } = msg
    const chatId = msg.chat.id

    if (text === constants.START_TEXT) {
        await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/a6f/1ae/a6f1ae15-7c57-3212-8269-f1a0231ad8c2/12.webp')
        return await bot.sendMessage(chatId, constants.TEXT)
    }

    if (text === constants.TEXT) {
        const corses = await getCourse()
        const corseUsdToUah = corses.filter(item => item.cc === constants.USD)[0]
        return await bot.sendMessage(chatId, `${corseUsdToUah.txt} : ${corseUsdToUah.rate} грн`)
    }


    // return await bot.sendMessage(chatId, testCompomise(text))
    return await bot.sendMessage(chatId, await testNlpJs(text))

})


