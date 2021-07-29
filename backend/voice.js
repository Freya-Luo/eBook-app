const CryptoJS = require('crypto-js')
const WebSocket = require('ws')
const qs = require('qs')
const fs = require('fs')

function createVoice (req, res) {
    // const text = req.query.text
    // const lang = req.query.lang
    const text = '测试科大讯飞在线'
    
    const date = (new Date().toUTCString())
    const config = {
        hostUrl: "http://tts-api.xfyun.cn/v2/tts",
        host: "tts-api.xfyun.cn",
        appid: "5f54b879",
        apiSecret: "54a0ee4d948468a40c6af86e455261d2",
        apiKey: "93e0df32b7ee4a112030ecac41382b59",
        uri: "/v2/tts",
    }
    const data = qs.stringify({
        text: text
    })

    const params = {
        "common": {
            "app_id": config.appid
        },
        "business": {
            "aue": "lame",
            "auf": "audio/L16;rate=16000",
            "vcn": "aisjinger",
            "tte": "UTF8",
            "reg": "0",
            "speed": 30,
            'volume': 50,
            'pitch': 50,
        },
        "data": {
            // "text": Buffer.from(config.text).toString('base64'),
            "text": Buffer.from(data).toString('base64'),
            "status": 2
        }
    }

    function getAuthStr (date) {
        let signatureOrigin = `host: ${config.host}\ndate: ${date}\nGET ${config.uri} HTTP/1.1`
        let signatureSha = CryptoJS.HmacSHA256(signatureOrigin, config.apiSecret)
        let signature = CryptoJS.enc.Base64.stringify(signatureSha)
        let authorizationOrigin = `api_key="${config.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`
        let authStr = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(authorizationOrigin))
        return authStr
    }

    let wssUrl = config.hostUrl + "?authorization=" + getAuthStr(date) + "&date=" + date + "&host=" + config.host
    let ws = new WebSocket(wssUrl)

    ws.on('open', function () {
        ws.send(JSON.stringify(params))
        let mp3 = ''
        ws.on('message', (res, err) => {
            let response = JSON.parse(res)
            let audio = response.data.audio
            let audioBuf = Buffer.from(audio, 'base64')
            console.log(audioBuf)
        })
    })
    

}

module.exports = createVoice