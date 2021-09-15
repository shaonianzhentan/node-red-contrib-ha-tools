const net = require('net');

module.exports = function (RED) {
    RED.nodes.registerType('ha-tools-yoosee', function (config) {
        RED.nodes.createNode(this, config);
        const node = this
        const { ip } = config
        node.on('input', function (msg) {
            const { payload } = msg
            const ptzCmd = payload.toLocaleUpperCase()
            if (['UP', 'DWON', 'LEFT', 'RIGHT'].includes(ptzCmd)) {
                return node.status({ fill: "red", shape: "ring", text: '发送的值错误[ UP, DWON, LEFT, RIGHT ]' });
            }
            const client = new net.Socket();
            client.connect(554, ip, function () {
                node.status({ fill: "blue", shape: "ring", text: "连接成功" });

                client.write("SETUP rtsp://" + ip + "/onvif1/track1 RTSP/1.0\r\n" +
                    "CSeq: 1\r\n" +
                    "User-Agent: LibVLC/2.2.6 (LIVE555 Streaming Media v2016.02.22)\r\n" +
                    "Transport: RTP/AVP/TCP;unicast;interleaved=0-1\r\n\r\n");
            });

            client.on('data', function (data) {
                console.log('Received: ' + data);
                client.write("SET_PARAMETER rtsp://" + ip + "/onvif1 RTSP/1.0\r\n" +
                    "Content-type: ptzCmd: " + ptzCmd + "\r\n" +
                    "CSeq: 2\r\n" +
                    "Session:\r\n\r\n");
                client.destroy(); // kill client after server's response
            });

            client.on('close', function () {
                console.log('Connection closed');
                node.status({ fill: "green", shape: "ring", text: "发送成功" });
            });

        })
    })
}