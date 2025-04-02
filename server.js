const WebSocket = require('ws')
const pm2 = require('pm2')
const { exec } = require('child_process')
const { scriptPath, gameServers, port, serverPort } = require('./config')

const server = new WebSocket.Server({ port: port })
let sessionPort = serverPort

console.log(`WebSocket Server running on port ${port}`)

server.on('connection', (ws) => {
    console.log('New client connected!')

    //send welcome message
    ws.send('Hellow this is welcome message')

    ws.on('message', (message) => {
        console.log(`Received: ${message}`)

        let data
        try {
            data = JSON.parse(message)
        } catch (e) {
            console.error(`Invalid JSON: ${message}`)
            ws.send(JSON.stringify({ error: 'invalid_json' }))
            return
        }

        const { action, sessionId } = data

        //message handling
        if (action == 'create_session') {
            console.log('create_session')
	    startServer()
            /*let session = gameServers.find(server => server.status === 'wait')
            if (session) {
                const server = exec(`sh ${scriptPath} -port=${sessionPort} -log`)
		sessionPort += 1
                session.status = 'ready'
                session.server = server
            }*/
        }
        else if (action == 'stop_session' && sessionId) {
            console.log('stop_session')
            let session = gameServers.find(s => s.port === sessionId && s.status === 'ready')
            if (session) {
                session.server.kill() // หยุด process ที่รัน shell script อยู่
                session.status = 'wait'
                session.server = null
                console.log('Session stopped.')
            }
        }
    })

    ws.on('close', () => {
        console.log('client disconnect')
    })
})

function startServer() {
	pm2.connect((err) => {
		if (err) {
			console.log('Error connecting to PM2: ', err)
			process.exit(2);
		}

		sessionPort += 1

		pm2.start(
		{
        		name: `EscapeServer-${sessionPort}`,
        		script: scriptPath,
        		exec_mode: "fork", // "fork" หรือ "cluster" ก็ได้
			args: `--port=${sessionPort} -log`,
        		autorestart: true,
        		watch: false, // true ถ้าต้องการให้ PM2 เฝ้าดูไฟล์
        		max_memory_restart: "500M",
      		},
      		(err, proc) => {
        		if (err) console.error("Error starting server:", err);
        		else console.log(`✅ Server started with PM2: EscapeServer-${sessionPort}`);
        		pm2.disconnect();
		})
	})
}
