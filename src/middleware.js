/**
  some helpful middleware for the remote localagent
  */
module.exports = {
  /**
    logs out the current context to the command line
    @param {object} ctx - current application context
    @return {object} new application context
  */
  logger: async (ctx) => {
    console.log(ctx.event, ctx.request);
    return ctx;
  },
  /**
    sends the local agent's response back to the requesting server,
    all responses trigger a CLIENT_RESPONSE event
    @param {object} ctx - current application context
    @return {object} new application context
  */
  responder: async (ctx) => {
    const event = 'CLIENT_RESPONSE'
    ctx.socket.emit(event, ctx.response)
    return ctx;
  },
  /**
    a handler for a simple  hello world test not the transaction_id, this is
    necessary for the response to be mapped to the request on the server side
    @param {object} ctx - current application context
    @return {object} new application context
  */
  hello: async (ctx) => {
    ctx.response = {
      transaction_id: ctx.request.transaction_id,
      payload:{ message: 'hello world!'}
    };
    return ctx;
  },
  /**
    a disconnect handler, should include logic for handling a server disconnect
    @param {object} ctx - current application context
    @return {object} new application context
  */
  disconnect: async (ctx) => {
    // @TODO add disconnect handler
    return ctx;
  },
};
