const net = require('net')
const IAC_DONT_ECHO = Buffer.from([255,254,1])
const IAC_WONT_ECHO = Buffer.from([255,252,1])
const CR = Buffer.from([13])
const LF = Buffer.from([10])
let connected_sockets = [];
net.createServer()
  .on('error', err => {
    throw err
  })
  .on('listening', () => {
    console.log('TCP server is listening')
  })
  .on('connection', socket => {
    const linePrefix = Buffer.from(socket.remotePort + ': ', 'utf8')
    let line = [];
    connected_sockets.push(socket);
    socket.write(IAC_DONT_ECHO) // unset localecho
    socket
      .on('data', data => {
        if (data.equals(IAC_WONT_ECHO)) { return }
        if (data.includes(CR) || data.includes(LF)) {
          line.push(data)
          line.unshift(linePrefix)
          const message = Buffer.concat(line).toString()
          connected_sockets
            .filter(connected => socket != connected)
            .forEach(connected => connected.write(message))
          process.stdout.write(message)
          line = [];
          return socket.write(data)
        }
        socket.write(data)
        line.push(data)
      })
      .on('close', () => {
        connected_sockets = connected_sockets.filter(connected => {
          return connected.remotePort !== socket.remotePort
        })
        process.stdout.write(socket.remotePort + ': socket disconnected\n')
      })
  })
  .listen({
    port: 8080,
    host: 'localhost'
  })
