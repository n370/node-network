const net = require('net')
const socket = new net.Socket()

socket
  .on('close', () => {
    process.exit()
  })
  .connect({
    host: process.argv[2] || 'localhost',
    port: process.argv[3] || 8080,
  })

process.stdin.on('data', data => {
  socket.write(data)
})

process.on('SIGINT', () => {
  socket.end()
})
