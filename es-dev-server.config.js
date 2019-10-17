module.exports = {
  middlewares: [
    function rewriteIndex(context, next) {
      if (context.url.endsWith('/')) {
        context.url += 'index.html';
      }
  
      return next();
    }
  ],
};