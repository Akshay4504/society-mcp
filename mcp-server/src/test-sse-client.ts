import axios from 'axios';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverPath = path.join(__dirname, '../dist/index.js');

console.log(`[Test Client] Spawning SMM Express MCP Server at: ${serverPath}`);
const server = spawn("node", [serverPath]);

server.stdout.on("data", (data) => {
  console.log(`[Server Stdout] ${data.toString().trim()}`);
});

server.stderr.on("data", (data) => {
  console.log(`[Server Stderr] ${data.toString().trim()}`);
});

server.on("exit", (code) => {
  console.log(`[Server Process] Exited with code ${code}`);
});

// Wait for server to boot, then connect over SSE
setTimeout(() => {
  const req = http.request({
    hostname: 'localhost',
    port: 3001,
    path: '/sse',
    method: 'GET',
    headers: {
      'Accept': 'text/event-stream'
    }
  }, (res) => {
    console.log("[Test Client] SSE Stream Established!");
    let postUrl = "";

    res.on('data', async (chunk) => {
      const dataStr = chunk.toString();
      console.log(`[Test Client Received SSE Data]\n${dataStr}`);

      // Check for endpoint event to get sessionId
      if (dataStr.includes("event: endpoint")) {
        const lines = dataStr.split("\n");
        const dataLine = lines.find((l: string) => l.startsWith("data:"));
        if (dataLine) {
          postUrl = dataLine.replace("data:", "").trim(); // e.g. "/messages?sessionId=..."
          console.log(`[Test Client] Extracted Message Endpoint: ${postUrl}`);
          
          // Now that we have the endpoint, let's post JSON-RPC requests!
          try {
            // 1. List Tools request
            console.log("[Test Client] Sending tools/list request...");
            await axios.post(`http://localhost:3001${postUrl}`, {
              jsonrpc: "2.0",
              method: "tools/list",
              id: 1
            });
            
            // 2. Call getResident request
            setTimeout(async () => {
              console.log("[Test Client] Sending tools/call (getResident) request...");
              await axios.post(`http://localhost:3001${postUrl}`, {
                jsonrpc: "2.0",
                method: "tools/call",
                params: {
                  name: "getResident",
                  arguments: {
                    block: "B",
                    flatNumber: "304"
                  }
                },
                id: 2
              });
            }, 2000);

            // 3. Call getPendingPayments request
            setTimeout(async () => {
              console.log("[Test Client] Sending tools/call (getPendingPayments) request...");
              await axios.post(`http://localhost:3001${postUrl}`, {
                jsonrpc: "2.0",
                method: "tools/call",
                params: {
                  name: "getPendingPayments",
                  arguments: {}
                },
                id: 3
              });
            }, 4000);

            // Terminate test
            setTimeout(() => {
              console.log("[Test Client] Concluding SMM Express MCP tests...");
              server.kill();
              process.exit(0);
            }, 6000);

          } catch (err: any) {
            console.error("[Test Client POST Error]", err.response?.data || err.message);
          }
        }
      }
    });
  });

  req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
  });

  req.end();
}, 3000);
