const hash = require('argon2').hash;
const verify = require('argon2').verify;
const jwt = require('jsonwebtoken');

const hashPassword = async (password) => {
    return await hash(password);
};

const verifyPassword = async (hash, password) => {
    return await verify(hash, password);
};

const signToken = (data) => {
    return jwt.sign(data, process.env.JWT_SECRET);
};

const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
}; 

module.exports = {
    hashPassword,
    verifyPassword,
    signToken,
    verifyToken
};