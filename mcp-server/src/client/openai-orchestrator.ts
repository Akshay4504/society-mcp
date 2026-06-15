import http from 'http';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

// Load environmental parameters
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const port = 3001;
let messageIdCounter = 1;
const pendingRequests = new Map<number, (result: any) => void>();

/**
 * Sends JSON-RPC message to MCP session messages endpoint
 */
async function sendJsonRpcRequest(postUrl: string, method: string, params?: any): Promise<any> {
  const id = messageIdCounter++;
  return new Promise((resolve, reject) => {
    pendingRequests.set(id, resolve);
    axios.post(`http://localhost:${port}${postUrl}`, {
      jsonrpc: "2.0",
      method,
      params,
      id
    }).catch(err => {
      pendingRequests.delete(id);
      reject(err);
    });
  });
}

/**
 * Translates standard MCP tool schemas to OpenAI Chat Tool representation
 */
function translateMcpToolsToOpenAi(mcpTools: any[]): any[] {
  return mcpTools.map(t => ({
    type: "function",
    function: {
      name: t.name,
      description: t.description,
      parameters: t.inputSchema
    }
  }));
}

/**
 * Simulates GPT-4 responses for dry-run/mock testing
 * This executes real MCP tool calls via our SSE client to verify database connectivity.
 */
function simulateOpenAiResponse(query: string, messages: any[], loopCount: number): any {
  const q = query.toLowerCase();
  
  if (q.includes("paid maintenance") || q.includes("who has not paid")) {
    if (loopCount === 1) {
      return {
        role: "assistant",
        tool_calls: [{
          id: "call_mock_pending_payments",
          type: "function",
          function: {
            name: "getPendingPayments",
            arguments: JSON.stringify({ status: "Unpaid" })
          }
        }]
      };
    } else {
      const toolMessage = messages.find(m => m.role === "tool" && m.tool_call_id === "call_mock_pending_payments");
      const data = JSON.parse(toolMessage?.content || "{}");
      const textResult = data.content?.[0]?.text;
      const parsed = textResult ? JSON.parse(textResult) : {};
      const bills = parsed.outstandingBills || [];
      const names = bills.map((b: any) => `${b.userId?.firstName || "Resident"} ${b.userId?.lastName || ""}`).join(", ");
      
      return {
        role: "assistant",
        content: `Based on outstanding bills, the following residents have not paid maintenance this month: ${names || "None"}. Total unpaid invoices found: ${bills.length}.`
      };
    }
  }

  if (q.includes("defaulter report") || q.includes("defaulter")) {
    if (loopCount === 1) {
      return {
        role: "assistant",
        tool_calls: [{
          id: "call_mock_defaulter_report",
          type: "function",
          function: {
            name: "generateReport",
            arguments: JSON.stringify({ reportType: "Collections" })
          }
        }]
      };
    } else {
      const toolMessage = messages.find(m => m.role === "tool" && m.tool_call_id === "call_mock_defaulter_report");
      const data = JSON.parse(toolMessage?.content || "{}");
      const textResult = data.content?.[0]?.text;
      const parsed = textResult ? JSON.parse(textResult) : {};
      const summary = parsed.summary || {};
      
      return {
        role: "assistant",
        content: `### Payment Defaulter Report\n\n- **Cleared Collections**: ${summary.totalClearedCollections}\n- **Unresolved Accounts**: ${summary.pendingReconciliationLogs}\n- **Dues Amount**: ${summary.pendingReconciliationAmount}\n- **Reporting Period**: ${summary.cycle}`
      };
    }
  }

  if (q.includes("notice") || q.includes("water shutdown")) {
    if (loopCount === 1) {
      return {
        role: "assistant",
        tool_calls: [{
          id: "call_mock_create_notice",
          type: "function",
          function: {
            name: "createNotice",
            arguments: JSON.stringify({
              title: "Water Shutdown Alert",
              content: "Scheduled water shutdown on Wednesday, June 17th from 10:00 AM to 2:00 PM for maintenance pipeline repairs.",
              category: "Emergency",
              targetAudience: "All",
              isPinned: true
            })
          }
        }]
      };
    } else {
      const toolMessage = messages.find(m => m.role === "tool" && m.tool_call_id === "call_mock_create_notice");
      const data = JSON.parse(toolMessage?.content || "{}");
      const textResult = data.content?.[0]?.text;
      const parsed = textResult ? JSON.parse(textResult) : {};
      const notice = parsed.notice || {};
      
      return {
        role: "assistant",
        content: `Successfully created notice bulletin: "${notice.title}" (ID: ${notice._id || "generated-id"}). It is pinned as an ${notice.category} notification targeting ${notice.targetAudience} residents.`
      };
    }
  }

  return {
    role: "assistant",
    content: "No matching tool simulation mapped for this mock query."
  };
}

/**
 * Runs the OpenAI GPT-4 agent reasoning loop
 */
async function runAgent(query: string, openaiTools: any[], postUrl: string): Promise<string> {
  const hasKey = process.env.OPENAI_API_KEY && 
                 process.env.OPENAI_API_KEY !== "mock-api-key" && 
                 !process.env.OPENAI_API_KEY.includes("YOUR_API_KEY");

  const openai = new OpenAI({
    apiKey: hasKey ? process.env.OPENAI_API_KEY : "mock-api-key"
  });

  const messages: any[] = [
    { 
      role: "system", 
      content: "You are a helpful housing society assistant. Query resident details, bills, complaints, or notices to answer the user query accurately." 
    },
    { role: "user", content: query }
  ];

  let loopCount = 0;
  const maxLoops = 10;

  while (loopCount < maxLoops) {
    loopCount++;
    console.log(`[Orchestrator Loop] Iteration ${loopCount}...`);

    let response: any;

    if (!hasKey) {
      // Dry-run simulation mode (still queries the live database over real SSE connection)
      response = simulateOpenAiResponse(query, messages, loopCount);
    } else {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages,
        tools: openaiTools,
        tool_choice: "auto"
      });
      response = completion.choices[0].message;
    }

    messages.push(response);

    if (response.tool_calls && response.tool_calls.length > 0) {
      console.log(`[Orchestrator Loop] GPT-4 requested tool executions: ${response.tool_calls.map((tc: any) => tc.function.name).join(', ')}`);
      
      for (const toolCall of response.tool_calls) {
        const { name, arguments: argString } = toolCall.function;
        const toolArgs = JSON.parse(argString);

        console.log(`[Orchestrator Loop] Executing tool ${name} with arguments:`, toolArgs);

        // Dispatch tool execution to SMM MCP Server over SSE
        const executionResult = await sendJsonRpcRequest(postUrl, "tools/call", {
          name,
          arguments: toolArgs
        });

        console.log(`[Orchestrator Loop] Tool execution finished:`, JSON.stringify(executionResult).substring(0, 120) + "...");

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(executionResult)
        });
      }
    } else {
      console.log(`[Orchestrator Loop] Final response synthesis completed.`);
      return response.content || "";
    }
  }

  return "Reasoning loop limit exceeded.";
}

/**
 * Entry point to execute the example queries
 */
async function start() {
  console.log("[Orchestrator Client] Initiating Server-Sent Events handshake on port 3001...");
  
  const req = http.request({
    hostname: 'localhost',
    port: 3001,
    path: '/sse',
    method: 'GET',
    headers: {
      'Accept': 'text/event-stream'
    }
  }, (res) => {
    console.log("[Orchestrator Client] SSE channel established!");
    let postUrl = "";
    let buffer = "";

    res.on('data', async (chunk) => {
      buffer += chunk.toString();
      const messages = buffer.split("\n\n");
      buffer = messages.pop() || "";

      for (const msg of messages) {
        // Handle endpoint registration event
        if (msg.includes("event: endpoint")) {
          const lines = msg.split("\n");
          const dataLine = lines.find(l => l.startsWith("data:"));
          if (dataLine) {
            postUrl = dataLine.replace("data:", "").trim();
            console.log(`[Orchestrator Client] Message routing URL registered: ${postUrl}`);
            
            // Trigger Tool Discovery and reasoning query flow
            setTimeout(async () => {
              try {
                console.log("\n[Orchestrator Client] === DISCOVERING TOOLS ===");
                const toolMetadata: any = await sendJsonRpcRequest(postUrl, "tools/list");
                const mcpTools = toolMetadata.tools || [];
                console.log(`[Orchestrator Client] Discovered ${mcpTools.length} tools on server!`);

                const openaiTools = translateMcpToolsToOpenAi(mcpTools);
                console.log("[Orchestrator Client] Tool translation successfully completed!");

                // Query 1: Maintenance dues check
                console.log("\n[Query 1] Query: 'Who has not paid maintenance this month?'");
                const response1 = await runAgent("Who has not paid maintenance this month?", openaiTools, postUrl);
                console.log("[Query 1 Result]:\n", response1);

                // Query 2: Defaulter report generation
                console.log("\n[Query 2] Query: 'Generate payment defaulter report.'");
                const response2 = await runAgent("Generate payment defaulter report.", openaiTools, postUrl);
                console.log("[Query 2 Result]:\n", response2);

                // Query 3: Create water shutdown alert notice
                console.log("\n[Query 3] Query: 'Create a notice for water shutdown.'");
                const response3 = await runAgent("Create a notice for water shutdown.", openaiTools, postUrl);
                console.log("[Query 3 Result]:\n", response3);

                console.log("\n[Orchestrator Client] Concluding OpenAI integration tests.");
                process.exit(0);
              } catch (err: any) {
                console.error("[Orchestrator Client RUNTIME ERROR]", err.message);
                process.exit(1);
              }
            }, 1000);
          }
        }

        // Handle incoming messages responses
        if (msg.includes("event: message")) {
          const lines = msg.split("\n");
          const dataLine = lines.find(l => l.startsWith("data:"));
          if (dataLine) {
            const dataJson = dataLine.replace("data:", "").trim();
            try {
              const parsed = JSON.parse(dataJson);
              if (parsed.id && pendingRequests.has(parsed.id)) {
                const resolve = pendingRequests.get(parsed.id);
                pendingRequests.delete(parsed.id);
                if (resolve) resolve(parsed.result);
              }
            } catch (err) {}
          }
        }
      }
    });
  });

  req.on('error', (e) => {
    console.error(`[Orchestrator SSE Connection Error]: ${e.message}`);
    console.log("Please check if SMM MCP server is running on port 3001");
  });

  req.end();
}

start();
