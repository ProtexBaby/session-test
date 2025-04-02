const WebSocket = require('ws')
const pm2 = require('pm2')
const { exec } = require('child_process')
const { scriptPath, gameServers, port, serverPort } = require('./config')

const server = new WebSocket.Server({ port: port })
let sessionPort = serverPort
const Sessions = new Map()

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
        }
        else if (action == 'stop_session') {
            console.log('stop_session')
            if (Sessions.has(sessionId))
                stopServer(Sessions.get(sessionId))
            else
                console.log(`can not found id -> ${sessionId}`)
        }
        else if (action == 'stop_session' && sessionId) {
            console.log('stop_session')
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
        const str = sessionPort.toString()
        Sessions.set(str, `EscapeServer-${sessionPort}`)

		pm2.start({
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
		    }
        )
        listServers()
	})
}

function stopServer(SERVICE_NAME) {
    pm2.connect((err) => {
        if (err) {
            console.error("Error connecting to PM2:", err);
            process.exit(2);
        }

        pm2.stop(SERVICE_NAME, (err) => {
            if (err) console.error("Error stopping server:", err);
            else console.log(`🛑 Server stopped: ${SERVICE_NAME}`);
            pm2.disconnect();
        });
    });
    listServers()
}

// ฟังก์ชันรีสตาร์ทเซิร์ฟเวอร์
function restartServer(SERVICE_NAME) {
    pm2.connect((err) => {
        if (err) {
            console.error("Error connecting to PM2:", err);
            process.exit(2);
        }

        pm2.restart(SERVICE_NAME, (err) => {
            if (err) console.error("Error restarting server:", err);
            else console.log(`🔄 Server restarted: ${SERVICE_NAME}`);
            pm2.disconnect();
        });
    });
}

// ฟังก์ชันลบเซิร์ฟเวอร์ออกจาก PM2
function deleteServer(SERVICE_NAME) {
    pm2.connect((err) => {
        if (err) {
            console.error("Error connecting to PM2:", err);
            process.exit(2);
        }

        pm2.delete(SERVICE_NAME, (err) => {
            if (err) console.error("Error deleting server:", err);
            else console.log(`❌ Server deleted from PM2: ${SERVICE_NAME}`);
            pm2.disconnect();
        });
    });
}

// ฟังก์ชันแสดงรายการเซิร์ฟเวอร์ทั้งหมดใน PM2
function listServers() {
    pm2.connect((err) => {
        if (err) {
            console.error("Error connecting to PM2:", err);
            process.exit(2);
        }

        pm2.list((err, processList) => {
        if (err) console.error("Error listing servers:", err);
        else console.table(processList.map((proc) => ({
            id: proc.pm_id,
            name: proc.name,
            status: proc.pm2_env.status,
            memory: (proc.monit.memory / 1024 / 1024).toFixed(2) + " MB",
            cpu: proc.monit.cpu + " %",
        })));

        pm2.disconnect();
        });
    });
}
