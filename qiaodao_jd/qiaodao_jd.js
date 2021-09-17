const axios = require('axios')
const { spawn } = require('child_process');
const fs = require('fs');

module.exports = function (RED) {
    RED.nodes.registerType('ha-tools-qiaodao_jd', function (config) {
        RED.nodes.createNode(this, config);
        const node = this
        const OtherKey = config.config

        // 显示当前输入设备
        node.on('input', function (msg) {
            node.status({ fill: "blue", shape: "ring", text: `开始更新脚本` });
            axios.get('https://raw.fastgit.org/NobyDa/Script/master/JD-DailyBonus/JD_DailyBonus.js').then(({ data }) => {
                // 签到文件
                const qdFile = __dirname + '/JD_DailyBonus.js'
                // 写入配置
                fs.writeFileSync(qdFile, data.replace("var OtherKey = ``;", "var OtherKey = " + JSON.stringify(OtherKey) + ";"))
                // 执行签到命令
                const ls = spawn('node', [qdFile]);
                node.status({ fill: "blue", shape: "ring", text: `开始执行签到命令` });
                const arr = []
                ls.stdout.on('data', (data) => {
                    console.log(data.toString())
                    arr.push(data.toString())
                    // node.send({ payload })
                });
                ls.stderr.on('data', (data) => {
                    console.log('错误', data.toString())
                    // node.status({ fill: "red", shape: "ring", text: `stderr: ${data}` });
                });
                ls.on('close', (code) => {
                    console.log('退出', code)
                    if (code == 0) {
                        node.status({ fill: "blue", shape: "ring", text: `签到成功` });
                        node.send({ payload: arr })
                    }
                    // node.status({ fill: "red", shape: "ring", text: `child process exited with code ${code}` });
                });
            })
        })
    })
}
