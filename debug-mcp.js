const { spawn } = require('child_process');

console.log('Starting MCP server...');

// Spawn the Time MCP server as a subprocess from the correct directory
const serverProcess = spawn('python3', ['-m', 'mcp_server_time', '--local-timezone', 'Asia/Singapore'], {
  cwd: '/Users/00140216oliversimchoohowe/Desktop/mcp-servers/src/time'
});

let stdoutData = '';
let stderrData = '';

serverProcess.stdout.on('data', (data) => {
  const output = data.toString();
  stdoutData += output;
  console.log('STDOUT:', JSON.stringify(output));
});

serverProcess.stderr.on('data', (data) => {
  const output = data.toString();
  stderrData += output;
  console.log('STDERR:', JSON.stringify(output));
});

serverProcess.on('error', (error) => {
  console.log('PROCESS ERROR:', error);
});

serverProcess.on('close', (code) => {
  console.log(`Process exited with code ${code}`);
  console.log('Final stdout:', JSON.stringify(stdoutData));
  console.log('Final stderr:', JSON.stringify(stderrData));
});

// Send initialization message after a short delay
setTimeout(() => {
  console.log('Sending initialization message...');
  const initMessage = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-06-11',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    }
  };
  
  const messageString = JSON.stringify(initMessage) + '\n';
  console.log('Sending message:', JSON.stringify(messageString));
  serverProcess.stdin.write(messageString);
}, 2000);

// Kill the process after 10 seconds
setTimeout(() => {
  console.log('Killing process...');
  serverProcess.kill();
}, 10000);
