const screenshot = require('screenshot-desktop')

module.exports = function (RED) {
    RED.nodes.registerType('ha-tools-screenshot', function (cfg) {
        RED.nodes.createNode(this, cfg);
        const node = this
        node.on('input', async function (msg) {
            try {
                node.status({ fill: "blue", shape: "ring", text: "开始捕获桌面屏幕" });
                let payload = await screenshot()
                switch (cfg.format) {
                    case 1:

                        break;
                    case 2:

                        break;
                }
                node.send({ payload })
                node.status({ fill: "green", shape: "ring", text: "截屏成功" });
            } catch (ex) {
                node.status({ fill: "red", shape: "ring", text: ex });
            }
        })

    })
}