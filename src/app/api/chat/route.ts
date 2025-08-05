import { NextRequest } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';
import { MongoClient } from 'mongodb';
import { spawn } from 'child_process';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Define message interface
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// MCP server interface
interface MCPResource {
  name: string;
  description: string;
  data: Record<string, unknown>;
}

// Function to fetch data from MongoDB MCP server
async function fetchMongoMCPData(): Promise<MCPResource[]> {
  const resources: MCPResource[] = [];
  
  try {
    const uri = 'mongodb://127.0.0.1:27017';
    const client = new MongoClient(uri);
    
    await client.connect();
    
    // Get database list
    const admin = client.db('admin');
    const dbList = await admin.admin().listDatabases();
    
    resources.push({
      name: "mongodb_databases",
      description: "Available MongoDB databases",
      data: {
        databases: dbList.databases.map(db => ({
          name: db.name,
          sizeOnDisk: db.sizeOnDisk,
          empty: db.empty
        }))
      }
    });
    
    // Get collections from a sample database (if any non-system databases exist)
    const userDatabases = dbList.databases.filter(db => 
      !['admin', 'config', 'local'].includes(db.name)
    );
    
    if (userDatabases.length > 0) {
      const sampleDb = client.db(userDatabases[0].name);
      const collections = await sampleDb.listCollections().toArray();
      
      resources.push({
        name: "mongodb_collections",
        description: `Collections in database: ${userDatabases[0].name}`,
        data: {
          database: userDatabases[0].name,
          collections: collections.map(col => ({
            name: col.name,
            type: col.type || 'collection'
          }))
        }
      });
      
      // Get sample documents from first collection if it exists
      if (collections.length > 0) {
        const sampleCollection = sampleDb.collection(collections[0].name);
        const sampleDocs = await sampleCollection.find({}).limit(3).toArray();
        
        resources.push({
          name: "mongodb_sample_data",
          description: `Sample documents from ${collections[0].name} collection`,
          data: {
            collection: collections[0].name,
            sampleDocuments: sampleDocs,
            documentCount: await sampleCollection.countDocuments()
          }
        });
      }
    }
    
    await client.close();
    
  } catch (error: any) {
    console.error('MongoDB MCP connection error:', error);
    resources.push({
      name: "mongodb_error",
      description: "MongoDB connection status",
      data: {
        status: "disconnected",
        error: error.message,
        message: "Unable to connect to MongoDB at 127.0.0.1:27017"
      }
    });
  }
  
  return resources;
}

// Function to fetch data from Time MCP server
async function fetchTimeMCPData(): Promise<MCPResource | null> {
  let serverProcess: any = null;
  
  try {
    // Spawn the Time MCP server as a subprocess from the correct directory
    serverProcess = spawn('python3', ['-m', 'mcp_server_time', '--local-timezone', 'Asia/Singapore'], {
      cwd: '/Users/00140216oliversimchoohowe/Desktop/mcp-servers/src/time'
    });
    
    // Collect all stdout data
    let stdoutData = '';
    let stderrData = '';
    
    serverProcess.stdout.on('data', (data: Buffer) => {
      stdoutData += data.toString();
    });
    
    serverProcess.stderr.on('data', (data: Buffer) => {
      stderrData += data.toString();
    });
    
    // Wait for the process to be ready
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout waiting for MCP server to start'));
      }, 5000);
      
      serverProcess.on('error', (error: any) => {
        clearTimeout(timeout);
        reject(new Error(`MCP server process error: ${error.message}`));
      });
      
      // Give the process a moment to start
      setTimeout(() => {
        clearTimeout(timeout);
        resolve();
      }, 100);
    });
    
    // Send initialization message
    const initMessage = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-06-11',
        capabilities: {},
        clientInfo: {
          name: 'chatbot-nextjs',
          version: '1.0.0'
        }
      }
    };
    
    serverProcess.stdin.write(JSON.stringify(initMessage) + '\n');
    
    // Wait for initialization response
    let initResponse: any;
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout waiting for MCP server initialization response'));
      }, 5000);
      
      const checkForResponse = () => {
        try {
          const lines = stdoutData.split('\n').filter(line => line.trim());
          for (const line of lines) {
            if (line.trim()) {
              const response = JSON.parse(line);
              if (response.id === 1) {
                initResponse = response;
                clearTimeout(timeout);
                resolve();
                return;
              }
            }
          }
          // Check again in a short while
          setTimeout(checkForResponse, 100);
        } catch (parseError) {
          // Not a complete JSON yet, check again
          setTimeout(checkForResponse, 100);
        }
      };
      
      checkForResponse();
    });
    
    // Send initialized notification
    const initializedMessage = {
      jsonrpc: '2.0',
      method: 'initialized',
      params: {}
    };
    
    serverProcess.stdin.write(JSON.stringify(initializedMessage) + '\n');
    
    // Send tool call request
    const toolCallMessage = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'get_current_time',
        arguments: {
          timezone: 'Asia/Singapore',
        }
      }
    };
    
    serverProcess.stdin.write(JSON.stringify(toolCallMessage) + '\n');
    
    // Get the tool response
    let toolResponse: any;
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout waiting for MCP server tool response'));
      }, 5000);
      
      const checkForResponse = () => {
        try {
          const lines = stdoutData.split('\n').filter(line => line.trim());
          for (const line of lines) {
            if (line.trim()) {
              const response = JSON.parse(line);
              if (response.id === 2) {
                toolResponse = response;
                clearTimeout(timeout);
                resolve();
                return;
              }
            }
          }
          // Check again in a short while
          setTimeout(checkForResponse, 100);
        } catch (parseError) {
          // Not a complete JSON yet, check again
          setTimeout(checkForResponse, 100);
        }
      };
      
      checkForResponse();
    });
    
    // Close the process
    serverProcess.kill();
    
    return {
      name: "time_info",
      description: "Current time and timezone information from Time MCP server",
      data: {
        current_time: toolResponse.result?.datetime,
        timezone: toolResponse.result?.timezone,
        is_dst: toolResponse.result?.is_dst,
        mcp_server: "connected"
      }
    };
  } catch (error: any) {
    console.error('Error fetching time data from MCP server:', error);
    
    // Kill the process if it's still running
    if (serverProcess && !serverProcess.killed) {
      serverProcess.kill();
    }
    
    // Fallback to system time
    const currentTime = new Date();
    return {
      name: "time_info",
      description: "Current time and timezone information (fallback to system time due to MCP error)",
      data: {
        current_time: currentTime.toISOString(),
        local_time: currentTime.toLocaleString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        utc_offset: -currentTime.getTimezoneOffset() / 60,
        mcp_server: "error - using system time as fallback"
      }
    };
  }
}

// Function to fetch data from MCP servers (now includes MongoDB and Time)
async function fetchMCPData(): Promise<MCPResource[]> {
  const mongoData = await fetchMongoMCPData();
  const timeData = await fetchTimeMCPData();
  
  // Add system information
  const systemResources: MCPResource[] = [
    {
      name: "system_info",
      description: "Enterprise AI Assistant system information",
      data: {
        app_name: "Enterprise AI Assistant",
        version: "2.0.0",
        framework: "Next.js 15",
        ai_model: "Claude 3.5 Sonnet",
        deployment: "Vercel",
        features: ["MongoDB Integration", "MCP Server Support", "Real-time Chat", "Time Awareness"]
      }
    }
  ];
  
  // Include time data if available
  const allResources = [...mongoData, ...systemResources];
  if (timeData) {
    allResources.push(timeData);
  }
  
  return allResources;
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json() as { messages: Message[] };
    
    // Check if API key is set
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY is not set');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Fetch data from MCP servers
    const mcpData = await fetchMCPData();
    
    // Format the context for Claude
    const context = `
MCP Server Data:
${mcpData.map(resource => `
Resource: ${resource.name}
Description: ${resource.description}
Data: ${JSON.stringify(resource.data, null, 2)}
`).join('')}
    `;
    
    // Prepare messages for Claude
    const claudeMessages: Anthropic.Messages.MessageParam[] = [
      {
        role: "user",
        content: `You are an AI assistant with access to MCP server data. Use the following context to inform your responses:\n\n${context}\n\nUser messages:\n${messages.map(m => `${m.sender}: ${m.content}`).join('\n')}`
      }
    ];
    
    // Call Claude 3.5 Sonnet (corrected model name)
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1024,
      messages: claudeMessages,
    });
    
    const botResponse = response.content[0].type === 'text' ? response.content[0].text : "I'm sorry, I couldn't process that request."
    
    return new Response(
      JSON.stringify({ content: botResponse }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in chat API:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Provide more detailed error information
    const errorMessage = error.message || 'Failed to process chat message';
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process chat message',
        details: errorMessage 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
