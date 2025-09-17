
const http = require('http');
const PORT = process.env.PORT || 3000;
const VERSION = process.env.APP_VERSION || 'dev';

const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type':'text/plain'});
  res.end(`Hello from myapp! version=${VERSION}\n`);
});

server.listen(PORT, () => {
  console.log(`Listening on ${PORT}, version=${VERSION}`);
});
