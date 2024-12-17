const { createServer } = require('node:http');

const fs = require('node:fs/promises');

console.log('started onepage server ...')

const err = (o, path) => {
    console.log('unknown route : ', path);
    o.statusCode = 404;
    o.end(`unknown route : ${path}`);
};

let polls = [];
const send = m => {
    polls.map(o =>{
        o.writeHead(200, {'Content-Type': 'text/html'});
        o.end(m);
    })
    polls = [];
};

const getGreeting = () => {
    const t = (new Date).getHours()
    return t < 6 ? 'Good night'
        :  t < 12  ? 'Good morning'
        :  t < 18 ? 'Good afternoon'
        : 'Good evening';
};

setInterval(() => send("server tick: " + new Date), 5 * 60_000);

const server = createServer(async (i, o) => {
    const { url } = i;
    //console.log('server request : ', url, o);

    if(url == "/favicon.ico")
        return o.end(await fs.readFile("onepage\\favicon.ico"));

    if(url.startsWith("/poll/")) {
        polls.push(o);
        if (url.slice(6))
            send(getGreeting() + " " + url.slice(6) + "!");
        return;
    }
    if(url.startsWith("/send/")) {
        send(url.slice(6).replaceAll("%20", " "));
        return o.end("OK");
    }

    try {
        if(url.startsWith("/data/"))
            return console.log("got data :", url),
                o.end(await fs.readFile(`onepage\\${url.slice(6)}`));
    } catch(err) {
        o.writeHead(404);
        return o.end('not found');
    }

    o.writeHead(200, {'Content-Type': 'text/html'});
    o.end(await fs.readFile('onepage\\index.html', 'utf8'));
});

const hostname = '127.0.0.1', port = 3000;

server.listen(port, hostname,
    () => console.log(`Server running at http://${hostname}:${port}/`));