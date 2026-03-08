const { spawn } = require('child_process');
const path = require('path');

const cliPath = 'E:\\微信web开发者工具\\cli.bat';
const projectPath = 'D:\\recipe\\recipe-miniapp\\wechat-app';

console.log('Spawning CLI...');
console.log('CLI:', cliPath);
console.log('Project:', projectPath);

const child = spawn(cliPath, ['auto', '--project', projectPath], {
  stdio: 'pipe',
  shell: true
});

let output = '';
child.stdout.on('data', (data) => {
  output += data.toString();
  process.stdout.write(data);
});

child.stderr.on('data', (data) => {
  process.stderr.write(data);
});

child.on('close', (code) => {
  console.log('\nExit code:', code);
  console.log('\nOutput:', output);
});

setTimeout(() => {
  console.log('\nTimeout reached, killing process...');
  child.kill();
}, 10000);
