// Imports
const rule = require('graphql-shield').rule;
const verifyToken = require('../../utils').verifyToken;

// Function to verify token
const isAuthorized = rule()(async (parent, args, ctx, info) => {
  const { authorization } = ctx.request.headers;
  if (!authorization) {
    return false;
  }

  const token = authorization.replace("Bearer", "").trim();
  const { userId } = verifyToken(token);

  return !!userId;
});

module.exports = {
    isAuthorized
};