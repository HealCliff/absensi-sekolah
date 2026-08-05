/* global process */

import { spawn } from 'node:child_process'

const processes = []
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'

function start(command, cwd, args) {
  const executable = process.platform === 'win32' ? 'cmd.exe' : npmCommand
  const childArgs = process.platform === 'win32'
    ? ['/d', '/s', '/c', [npmCommand, command, ...args].join(' ')]
    : [command, ...args]
  const child = spawn(executable, childArgs, {
    cwd,
    stdio: 'inherit',
    env: process.env,
  })
  processes.push(child)
  return child
}

const root = process.cwd()
start('run', root, ['dev', '--', '--host', '127.0.0.1', '--port', '5174'])
start('run', `${root}/server`, ['dev'])

function stop() {
  for (const child of processes) child.kill('SIGTERM')
}

process.on('SIGINT', () => {
  stop()
  process.exit(0)
})
process.on('SIGTERM', () => {
  stop()
  process.exit(0)
})

console.log('[LOCAL] Frontend: http://localhost:5174')
console.log('[LOCAL] Backend:  http://localhost:4000')
console.log('[LOCAL] Tekan Ctrl+C untuk menghentikan keduanya.')
