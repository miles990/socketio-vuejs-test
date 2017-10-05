# Creating with Express.js, Socket.io, and Vue.js
A real-time web page to show server message.

- via http POST method
	- `curl --data "type=info&msg=hello post" http://localhost:3000`

- via TCP
	- `echo 'hello tcp' | nc localhost 3001`

- via UDP
	- `echo 'hello udp' | nc -4u -w1 localhost 3002`

# Run

```
npm install
node server.js
```

- Demo on [http://localhost:3000](http://localhost:3000)


# MIT