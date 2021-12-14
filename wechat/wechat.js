const CryptoUtil = require('../lib/CryptoUtil')

module.exports = function (RED) {
    RED.nodes.registerType('ha-tools-wechat', function (config) {
        RED.nodes.createNode(this, config);
        this.server = RED.nodes.getNode(config.server);
        if (this.server) {
            const node = this
            const { uid } = config
            node.on('input', async function (msg) {
                try {
                    const message = CryptoUtil.decrypt(msg.payload, uid)
                    const { message_id, content } = JSON.parse(message)
                    const payload = await this.server.conversation(content)
                    node.send({
                        topic: `shaonianzhentan/homeassistant/${message_id}`,
                        payload
                    })
                    node.status({ fill: "green", shape: "ring", text: "解密成功" });
                } catch (ex) {
                    node.status({ fill: "red", shape: "ring", text: JSON.stringify(ex) });
                }
            })
        }
    })
}