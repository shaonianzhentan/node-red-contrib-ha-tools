const axios = require('axios');
const fetch = require('node-fetch');
const FormData = require('form-data');

async function xiaoduCommand(query, botId, cookie) {
    console.log('获取Token信息')
    let res = await axios({
        url: 'https://dueros.baidu.com/dbp/bot/getnametokeninfo',
        method: 'GET',
        headers: {
            cookie
        }
    })
    let { status, data } = res.data
    if (status == 200) {
        const { accessToken } = data
        console.log(accessToken)
        console.log('开始发送命令')
        const postData = {
            "event": {
                "header": {
                    "namespace": "ai.dueros.device_interface.text_input",
                    "name": "TextInput",
                    "messageId": "21623f0f-c8ce-45ca-8bd2-cf2785c5054d",
                    "dialogRequestId": "e7295ade-7317-4f4d-9433-d479d67a1b97"
                },
                "payload": {
                    "query": query
                }
            },
            "debug": {
                "bot": {
                    "id": botId
                },
                "device_mode": "show",
                "simulator": true
            },
            "clientContext": [
                {
                    "header": {
                        "namespace": "ai.dueros.device_interface.location",
                        "name": "GpsState"
                    },
                    "payload": {
                        "longitude": 121.3355694153401,
                        "latitude": 31.12794963850454,
                        "geoCoordinateSystem": "BD09LL"
                    }
                },
                {
                    "header": {
                        "namespace": "ai.dueros.device_interface.screen",
                        "name": "ViewState"
                    },
                    "payload": {
                        "token": "",
                        "offsetInMilliseconds": 8261,
                        "playerActivity": "FINISHED",
                        "voiceId": 0
                    }
                }
            ]
        }

        let body = new FormData()
        body.append('metadata', Buffer.from(JSON.stringify(postData)), {
            contentType: 'application/json',
        })
        const res = await fetch('https://dueros-h2-dbp.baidu.com/dcs/v1/events', {
            method: 'POST',
            body,
            headers: {
                'authorization': `Bearer ${accessToken}`,
                'dueros-device-id': '123456'
            }
        }).then(res => res.text())
        // console.log(res)
        const list = []
        res.split('--___dueros_dcs_v1_boundary___\r\n').forEach(ele => {
            const arr = ele.split('\r\n')
            if (arr.length > 0) {
                // JSON文件
                if (arr[0].includes('Content-Disposition: form-data; name="metadata"')) {
                    arr[0] = arr[1] = ''
                    const jsonData = JSON.parse(arr.join(''))
                    list.push(jsonData)
                }
                else if (arr[0].includes('Content-Type: application/octet-stream')) {
                    // 音频文件
                    arr[0] = arr[1] = arr[2] = ''
                    // console.log(arr.join(''))
                }
            }
        })
        return list
    }
}

module.exports = function (RED) {
    RED.nodes.registerType('ha-tools-xiaodu', function (config) {
        RED.nodes.createNode(this, config);
        const node = this
        if (cookie) {
            node.on('input', function (msg) {
                const { payload } = msg
                node.status({ fill: "blue", shape: "ring", text: "发送命令" });
                xiaoduCommand(payload, config.botId, config.cookie).then((data) => {
                    node.send(data)
                    node.status({ fill: "blue", shape: "ring", text: "发送成功" });
                }).catch((ex) => {
                    this.status({ fill: "red", shape: "ring", text: ex });
                })
            })
        } else {
            this.status({ fill: "red", shape: "ring", text: "未配置Cookie" });
        }
    })
}