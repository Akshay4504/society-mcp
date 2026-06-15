import express from 'express';
import mongoose from 'mongoose';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema, 
  ListResourcesRequestSchema, 
  ReadResourceRequestSchema, 
  ListPromptsRequestSchema, 
  GetPromptRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

// Import Mongoose repositories
import { ResidentRepository } from './infrastructure/repositories/ResidentRepository.js';
import { PaymentRepository } from './infrastructure/repositories/PaymentRepository.js';
import { ComplaintRepository } from './infrastructure/repositories/ComplaintRepository.js';
import { NoticeRepository } from './infrastructure/repositories/NoticeRepository.js';
import { SocietyRepository } from './infrastructure/repositories/SocietyRepository.js';
import { UserRepository } from './infrastructure/repositories/UserRepository.js';

// Import Application Services
import { GetResidentService } from './services/GetResidentService.js';
import { GetPendingPaymentsService } from './services/GetPendingPaymentsService.js';
import { RegisterComplaintService } from './services/RegisterComplaintService.js';
import { CreateNoticeService } from './services/CreateNoticeService.js';
import { GenerateReportService } from './services/GenerateReportService.js';
import { SendReminderService } from './services/SendReminderService.js';

// Load environmental parameters
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/society_maintenance_db';
const port = Number(process.env.PORT) || 3001;

// Initialize Express App
const app = express();
app.use(express.json());

// Boot Database connection
async function connectDb() {
  try {
    await mongoose.connect(mongoUri);
    console.log(`[MCP Database] Connected successfully to MongoDB at ${mongoUri}`);
  } catch (error) {
    console.error('[MCP Database Error] Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}
connectDb();

// Setup Logger helper
function mcpLog(action: string, details: string, level: 'INFO' | 'WARN' | 'ERROR' = 'INFO') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [MCP ${level}] ${action} - ${details}`);
}

// Instantiate repositories
const residentRepo = new ResidentRepository();
const paymentRepo = new PaymentRepository();
const complaintRepo = new ComplaintRepository();
const noticeRepo = new NoticeRepository();
const societyRepo = new SocietyRepository();
const userRepo = new UserRepository();

// Instantiate services (injecting repository dependencies)
const getResidentService = new GetResidentService(residentRepo);
const getPendingPaymentsService = new GetPendingPaymentsService(paymentRepo);
const registerComplaintService = new RegisterComplaintService(complaintRepo, residentRepo);
const createNoticeService = new CreateNoticeService(noticeRepo, societyRepo, userRepo);
const generateReportService = new GenerateReportService(paymentRepo, complaintRepo, residentRepo);
const sendReminderService = new SendReminderService(residentRepo, paymentRepo);

// Instantiate standard MCP Server
const server = new Server(
  {
    name: "smm-mcp-express-server",
    version: "1.0.0"
  },
  {
    capabilities: {
      resources: {},
      tools: {},
      prompts: {}
    }
  }
);

// Keep track of active SSE transports by sessionId
const activeTransports = new Map<string, SSEServerTransport>();

// --- RESOURCES HANDLERS ---

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  mcpLog('ListResources', 'Client requested available resource listing');
  return {
    resources: [
      {
        uri: "society://residents/list",
        name: "Resident Directory",
        mimeType: "application/json",
        description: " Roster of all housing block flat units and active residents"
      },
      {
        uri: "society://notices/bulletin",
        name: "Public Notice bulletins",
        mimeType: "text/markdown",
        description: "Pinned general, financial, and emergency board announcements"
      },
      {
        uri: "society://system/health",
        name: "Database peeing status",
        mimeType: "application/json",
        description: "Status check of database peering"
      }
    ]
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  mcpLog('ReadResource', `Client requested reading of resource: ${uri}`);
  
  try {
    if (uri === "society://residents/list") {
      const residents = await residentRepo.findAll();
      return {
        contents: [{
          uri,
          mimeType: "application/json",
          text: JSON.stringify(residents, null, 2)
        }]
      };
    }
    
    if (uri === "society://notices/bulletin") {
      const notices = await noticeRepo.findAllSortedByDate();
      const markdown = notices.map((n: any) => 
        `# ${n.title}\n*Category: ${n.category}* | *Target Audience: ${n.targetAudience}* | *Filed: ${new Date(n.createdAt).toLocaleDateString()}*\n\n${n.content}`
      ).join("\n\n---\n\n");
      return {
        contents: [{
          uri,
          mimeType: "text/markdown",
          text: markdown || "No notice announcements found on the bulletin board."
        }]
      };
    }
    
    if (uri === "society://system/health") {
      const dbState = mongoose.connection.readyState;
      const states: Record<number, string> = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
      return {
        contents: [{
          uri,
          mimeType: "application/json",
          text: JSON.stringify({
            status: dbState === 1 ? "healthy" : "degraded",
            database: states[dbState] || 'unknown',
            timestamp: new Date()
          }, null, 2)
        }]
      };
    }
    
    throw new Error(`Resource not found: ${uri}`);
  } catch (err: any) {
    mcpLog('ReadResource Error', `Failed to read resource ${uri}: ${err.message}`, 'ERROR');
    throw err;
  }
});

// --- TOOLS SCHEMA DEFINITIONS ---

server.setRequestHandler(ListToolsRequestSchema, async () => {
  mcpLog('ListTools', 'Client requested tool metadata schemas');
  return {
    tools: [
      {
        name: "getResident",
        description: "Query resident profiles, family members, and parking slots by unit.",
        inputSchema: {
          type: "object",
          properties: {
            block: { type: "string", description: "Housing Block Letter, e.g. A, B" },
            flatNumber: { type: "string", description: "Flat number unit, e.g. 102, 304" }
          },
          required: ["block", "flatNumber"]
        }
      },
      {
        name: "getPendingPayments",
        description: "Retrieve unpaid billing invoices and transaction logs needing reconciliation.",
        inputSchema: {
          type: "object",
          properties: {
            status: { type: "string", enum: ["Unpaid", "Pending", "Partially-Paid"], description: "Dues or transaction reconciliation filters" },
            billingPeriod: { type: "string", description: "Billing period target, e.g., 'June 2026'" }
          }
        }
      },
      {
        name: "registerComplaint",
        description: "File a housing complaint ticket. Automatically categorizes and triages priority.",
        inputSchema: {
          type: "object",
          properties: {
            block: { type: "string", description: "Filing resident block letter, e.g., B" },
            flatNumber: { type: "string", description: "Filing resident flat number, e.g., 304" },
            title: { type: "string", description: "Summary header of complaint" },
            description: { type: "string", description: "Detailed complaint description context" }
          },
          required: ["block", "flatNumber", "title", "description"]
        }
      },
      {
        name: "createNotice",
        description: "Publish a notice bulletin board announcement.",
        inputSchema: {
          type: "object",
          properties: {
            title: { type: "string", description: "Notice header title" },
            content: { type: "string", description: "Bulletin details text" },
            category: { type: "string", enum: ["General", "Financial", "Emergency", "Event"], default: "General" },
            targetAudience: { type: "string", enum: ["All", "Owners", "Tenants", "Staff"], default: "All" },
            isPinned: { type: "boolean", default: false }
          },
          required: ["title", "content"]
        }
      },
      {
        name: "generateReport",
        description: "Compile collections charts, open complaint stats, or occupancies.",
        inputSchema: {
          type: "object",
          properties: {
            reportType: { type: "string", enum: ["Collections", "Tickets", "Occupancy"], description: "Analytics target" },
            billingPeriod: { type: "string", description: "Filter collections by billing cycle period" }
          },
          required: ["reportType"]
        }
      },
      {
        name: "sendReminder",
        description: "Post a maintenance fee dues alert/reminder notification to a resident.",
        inputSchema: {
          type: "object",
          properties: {
            residentId: { type: "string", description: "Resident database 24-char ObjectId" },
            billId: { type: "string", description: "Bill database 24-char ObjectId" },
            customMessage: { type: "string", description: "Optional custom warning message details" }
          },
          required: ["residentId", "billId"]
        }
      }
    ]
  };
});

// --- TOOLS CALL ROUTING ---

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  mcpLog('CallTool', `Executing tool: ${name} with arguments: ${JSON.stringify(args)}`);
  
  try {
    let result: any;
    
    if (name === "getResident") {
      result = await getResidentService.execute(args);
    } else if (name === "getPendingPayments") {
      result = await getPendingPaymentsService.execute(args);
    } else if (name === "registerComplaint") {
      result = await registerComplaintService.execute(args);
    } else if (name === "createNotice") {
      result = await createNoticeService.execute(args);
    } else if (name === "generateReport") {
      result = await generateReportService.execute(args);
    } else if (name === "sendReminder") {
      result = await sendReminderService.execute(args);
    } else {
      throw new Error(`Tool not implemented: ${name}`);
    }
    
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
    };
  } catch (err: any) {
    mcpLog('CallTool Error', `Failed to execute tool ${name}: ${err.message}`, 'ERROR');
    
    // Check if Zod error, format nicely for the client/LLM
    if (err instanceof z.ZodError) {
      const msg = err.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
      return {
        isError: true,
        content: [{ type: "text", text: `Validation Error: ${msg}` }]
      };
    }
    
    return {
      isError: true,
      content: [{ type: "text", text: `Error executing tool: ${err.message}` }]
    };
  }
});

// --- ASSISTANT PROMPTS ---

server.setRequestHandler(ListPromptsRequestSchema, async () => {
  mcpLog('ListPrompts', 'Client requested prompt templates list');
  return {
    prompts: [
      {
        name: "triage-complaints",
        description: "Triage open support tickets and assign them to matching repair technicians."
      },
      {
        name: "reconcile-ledger",
        description: "Reconcile unverified payment logs against outstanding bills."
      }
    ]
  };
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name } = request.params;
  mcpLog('GetPrompt', `Client requested prompt: ${name}`);
  
  if (name === "triage-complaints") {
    return {
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: "Retrieve open complaints using the getPendingPayments tool. Suggest plumber/electrician assignments based on AI categories."
        }
      }]
    };
  }
  
  if (name === "reconcile-ledger") {
    return {
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: "Retrieve pending payments and check corresponding outstanding invoices to verify balance collections."
        }
      }]
    };
  }
  
  throw new Error(`Prompt not found: ${name}`);
});

// --- HTTP SERVER TRANSPORT CONFIG (EXPRESS + SSE) ---

// Establishing SSE connection stream
app.get('/sse', async (req, res) => {
  mcpLog('SSE Connection', 'Establishing SSE Connection stream...');
  
  const transport = new SSEServerTransport('/messages', res);
  const sessionId = transport.sessionId;
  activeTransports.set(sessionId, transport);
  
  await server.connect(transport);
  mcpLog('SSE Connection Success', `Session successfully peered. ID: ${sessionId}`);
  
  req.on('close', async () => {
    mcpLog('SSE Connection Closed', `Session disconnected. ID: ${sessionId}`);
    activeTransports.delete(sessionId);
    await transport.close();
  });
});

// Handling client messages post channel
app.post('/messages', async (req, res) => {
  const sessionId = req.query.sessionId as string;
  mcpLog('SSE Message', `Incoming POST payload for session: ${sessionId}`);
  
  if (!sessionId) {
    res.status(400).json({ error: "Session ID parameter is required" });
    return;
  }
  
  const transport = activeTransports.get(sessionId);
  if (!transport) {
    res.status(404).json({ error: "Active transport connection session not found" });
    return;
  }
  
  try {
    await transport.handleMessage(req.body);
    res.status(200).send("OK");
  } catch (error: any) {
    mcpLog('SSE Message Error', `Error handling post payload: ${error.message}`, 'ERROR');
    res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
});

// Start listening
app.listen(port, () => {
  mcpLog('App Boot', `SMM MCP Express + SSE Server is listening on http://localhost:${port}`);
  console.log(`[MCP Server] Establish SSE channel via GET http://localhost:${port}/sse`);
});
