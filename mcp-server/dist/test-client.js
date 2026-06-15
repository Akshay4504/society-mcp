import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverPath = path.join(__dirname, "../dist/index.js");
const backendUrl = "http://localhost:5000/api/v1";
async function runTests() {
    // 1. Auto-Register test occupant user to trigger bulletin & bill seeding in Palm Grove
    try {
        console.log("[Test Client] Registering test resident to trigger palm grove seeding...");
        await axios.post(`${backendUrl}/auth/register`, {
            firstName: "Mcp",
            lastName: "Tester",
            email: "mcp.tester3@example.com",
            password: "Password123",
            phone: "9876543212",
            role: "ResidentOwner",
            societyName: "Palm Grove",
            flatDetails: {
                block: "B",
                flatNumber: "304",
                areaSqFt: 1450
            }
        });
        console.log("[Test Client] Registered mcp.tester3@example.com successfully!");
    }
    catch (err) {
        if (err.response?.status === 400 && err.response?.data?.message?.includes("already")) {
            console.log("[Test Client] mcp.tester3@example.com is already registered in Palm Grove.");
        }
        else {
            console.error("[Test Client] Failed to register tester resident:", err.response?.data?.message || err.message);
        }
    }
    // 2. Spawn SMM MCP Server subprocess
    console.log(`[Test Client] Spawning SMM MCP Server at: ${serverPath}`);
    const server = spawn("node", [serverPath]);
    let outputBuffer = "";
    server.stdout.on("data", (data) => {
        outputBuffer += data.toString();
        const lines = outputBuffer.split("\n");
        outputBuffer = lines.pop() || "";
        for (const line of lines) {
            if (line.trim()) {
                try {
                    const response = JSON.parse(line);
                    console.log("[Test Client] Received JSON-RPC Response:\n", JSON.stringify(response, null, 2));
                }
                catch (err) {
                    console.log("[Test Client] Raw Output (Non-JSON):", line);
                }
            }
        }
    });
    server.stderr.on("data", (data) => {
        console.log(`[Test Client Server Logs] ${data.toString().trim()}`);
    });
    server.on("exit", (code) => {
        console.log(`[Test Client] Server process exited with code ${code}`);
    });
    function sendRequest(request) {
        const jsonStr = JSON.stringify(request) + "\n";
        console.log(`[Test Client] Sending JSON-RPC Request: ${request.method} (ID: ${request.id})`);
        server.stdin.write(jsonStr);
    }
    // Sequence of testing requests
    setTimeout(() => {
        // 1. List tools
        sendRequest({
            jsonrpc: "2.0",
            method: "tools/list",
            id: 1
        });
    }, 2000);
    setTimeout(() => {
        // 2. Call getResident
        sendRequest({
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
    }, 4000);
    setTimeout(() => {
        // 3. Call getPendingPayments
        sendRequest({
            jsonrpc: "2.0",
            method: "tools/call",
            params: {
                name: "getPendingPayments",
                arguments: {}
            },
            id: 3
        });
    }, 6000);
    setTimeout(() => {
        // Exit
        console.log("[Test Client] Terminating MCP Server test...");
        server.kill();
        process.exit(0);
    }, 8000);
}
runTests().catch(console.error);
//# sourceMappingURL=test-client.js.map