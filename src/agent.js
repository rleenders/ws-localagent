const Socket = require('socket.io-client');
/**
  Builds a websocket client connection to a remote server
  includes middleware processing for messages from the server
  */
class agent {

  /**
    creates the agent class
    @param {string} name - the local agent name for easy reference
  */
  constructor(name){
    this.name = name;
    this.promises = [];
    this.events = [];
  }

  /**
    adds a middleware function to the stack
    @param {function} fn - an asyncronous function to add to the promise stack
    @param {string} eventName - the  name of the event that this middleware should apply to '*' applies to all events
  */
  use(fn, eventName = '*') {
    this.promises.push({eventName, fn});
    if(eventName != '*'){
      this.events.push(eventName);
      if(this.socket){
        this.socket.on(eventName, (request) => {
          this.runMiddleware({event: eventName, socket, request})
        });
      }
    }
  }

  /**
    when an event comes in, this assembles the middleware chain, and runs through it.
    @param {object} ctx - context object, contains the request, the socket, and the event name
    @return {promise} resolves once all promises in the chain are resolved
  */
  runMiddleware(ctx){
    const chain = [];
    this.promises.forEach(({eventName, fn}) => {
      if(eventName === ctx.event || eventName === '*'){
        chain.push(fn);
      }
    });
    return chain.reduce( async (previousPromise, next) => {
      const ctx = await previousPromise;
      return next(ctx);
    }, Promise.resolve(ctx));

  }
  /**
    connects to the remote server, adds event listeners
    @param {string} connectionString - the connection string needed to connect the websocket client to the server
    @param {object} connectParams -  any additional params that should be sent to the server during the initial handshake
    @return {object} the websocket instance
  */
  async connect(connectionString, connectParams = {}){
    const socket = new Socket(connectionString);
    socket.on('CLIENT_CONNECTED', (data, cb) => {
      cb({name: this.name, ...connectParams});
    });

    this.events.forEach((event) => {
      socket.on(event, (request) => {
        this.runMiddleware({event, socket, request})});
    });
    this.socket = socket;
    return this.socket;
  }

}

module.exports = agent;
