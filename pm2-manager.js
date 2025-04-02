const pm2 = require("pm2");

const SERVICE_NAME = "Escape_Server";
const SERVER_PATH = "../EscapeServerTest/Escape_SingleServer.sh"; // เปลี่ยนเป็น path จริงของคุณ

// ฟังก์ชันเริ่มต้นเซิร์ฟเวอร์
function startServer() {
  pm2.connect((err) => {
    if (err) {
      console.error("Error connecting to PM2:", err);
      process.exit(2);
    }

    pm2.start(
      {
        name: SERVICE_NAME,
        script: SERVER_PATH,
        exec_mode: "fork", // "fork" หรือ "cluster" ก็ได้
        autorestart: true,
        watch: false, // true ถ้าต้องการให้ PM2 เฝ้าดูไฟล์
        max_memory_restart: "500M",
      },
      (err, proc) => {
        if (err) console.error("Error starting server:", err);
        else console.log(`✅ Server started with PM2: ${SERVICE_NAME}`);
        pm2.disconnect();
      }
    );
  });
}

// ฟังก์ชันหยุดเซิร์ฟเวอร์
function stopServer() {
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
}

// ฟังก์ชันรีสตาร์ทเซิร์ฟเวอร์
function restartServer() {
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
function deleteServer() {
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

// 📌 เลือกว่าจะใช้ฟังก์ชันไหน
const command = process.argv[2];

switch (command) {
  case "start":
    startServer();
    break;
  case "stop":
    stopServer();
    break;
  case "restart":
    restartServer();
    break;
  case "delete":
    deleteServer();
    break;
  case "list":
    listServers();
    break;
  default:
    console.log("Usage: node pm2-manager.js <start|stop|restart|delete|list>");
}
