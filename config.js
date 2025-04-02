module.exports = {
    port: 8080,
    //gameServers: [],
    scriptPath: "../EscapeServerTest/Escape_SingleServer.sh",
    serverPort: 8999,

    gameServers: [
        { port: "9000", status: "wait", scriptPath: "../EscapeServerTest/Escape_SingleServer.sh", server: {}},
        { port: "9001", status: "wait", scriptPath: "../EscapeServerTest/Escape_SingleServer.sh", server: {}},
        { port: "9002", status: "wait", scriptPath: "../EscapeServerTest/Escape_SingleServer.sh", server: {}}
    ]

};
