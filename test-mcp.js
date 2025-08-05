const { spawn } = require('child_process');

// Spawn the Time MCP server as a subprocess
const serverProcess = spawn('python3', ['-m', 'mcp_server_time', '--local-timezone', 'Asia/Singapore']);

let stdoutData = '';
let stderrData = '';

serverProcess.stdout.on('data', (data) => {
  const output = data.toString();
  stdoutData += output;
  console.log('STDOUT:', output);
});

serverProcess.stderr.on('data', (data) => {
  const output = data.toString();
  stderrData += output;
  console.log('STDERR:', output);
});

serverProcess.on('close', (code) => {
  console.log(`Process exited with code ${code}`);
  console.log('Final stdout:', stdoutData);
  console.log('Final stderr:', stderrData);
});

// Send initialization message after a short delay
setTimeout(() => {
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
  
  console.log('Sending init message:', JSON.stringify(initMessage));
  serverProcess.stdin.write(JSON.stringify(initMessage) + '\n');
}, 1000);

// Kill the process after 5 seconds
setTimeout(() => {
  serverProcess.kill();
}, 5000);
