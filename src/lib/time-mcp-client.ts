import { spawn } from 'child_process';
// @ts-ignore
import { Client } from '@modelcontextprotocol/sdk';

// Function to create and connect to Time MCP server
export async function createTimeMCPClient(): Promise<Client | null> {
  try {
    // Spawn the Time MCP server as a subprocess
    const serverProcess = spawn('python3', ['-m', 'mcp_server_time', '--local-timezone', 'Asia/Singapore']);
    
    // Create MCP client
    const client = new Client({
      name: 'chatbot-nextjs',
      version: '1.0.0',
    });
    
    // Connect to the server via stdio
    await client.connect({
      reader: serverProcess.stdout,
      writer: serverProcess.stdin,
    });
    
    return client;
  } catch (error) {
    console.error('Failed to create Time MCP client:', error);
    return null;
  }
}

// Function to get current time from Time MCP server
export async function getCurrentTimeFromMCP(client: Client): Promise<any> {
  try {
    // Call the get_current_time tool
    const result = await client.request('call_tool', {
      name: 'get_current_time',
      arguments: {
        timezone: 'Asia/Singapore',
      },
    });
    
    return result;
  } catch (error) {
    console.error('Failed to get current time from MCP server:', error);
    throw error;
  }
}

// Function to close the MCP client connection
export async function closeTimeMCPClient(client: Client): Promise<void> {
  try {
    await client.close();
  } catch (error) {
    console.error('Failed to close Time MCP client:', error);
  }
}
