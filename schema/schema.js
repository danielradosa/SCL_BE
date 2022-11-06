// Imports
const graphql = require('graphql');
const cloudinary = require('cloudinary').v2;
const _ = require('lodash');
const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLSchema,
    GraphQLID,
    GraphQLInt,
    GraphQLList
} = graphql;

// Import hashing and token functions
const { hashPassword, verifyPassword, signToken, verifyToken } = require('../utils');

// Import models
const { User, Post, Bio } = require('../models');

// Define types
const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLID },
        username: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        profilePicture: { type: GraphQLString },
        handle: { type: GraphQLString },
        following: { type: GraphQLInt },
        followers: { type: GraphQLInt },
        bio: {
            type: BioType,
            resolve(parent, args) {
                return Bio.findOne({ bioBy: parent.id });
            }
        },
        posts: {
            type: new GraphQLList(PostType),
            resolve(parent, args) {
                return Post.find({ postedBy: parent.handle });
            }
        },
        role: { type: GraphQLString } // ADMIN or USER
    })
});

const LoginType = new GraphQLObjectType({
    name: 'Login',
    fields: () => ({
        id: { type: GraphQLID },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        token: { type: GraphQLString }
    })
});

const PostType = new GraphQLObjectType({
    name: 'Post',
    fields: () => ({
        id: { type: GraphQLID },
        title: { type: GraphQLString },
        content: { type: GraphQLString },
        postImage: { type: GraphQLString },
        postedBy: {
            type: UserType,
            resolve(parent, args) {
                return User.findOne({ handle: parent.postedBy });
            }
        },
        createdAt: {
            type: GraphQLString,
            resolve(parent, args) {
                const date = new Date(parent.createdAt);
                const dateNow = date.toString();
                return dateNow;
            }
        }
    })
});

const BioType = new GraphQLObjectType({
    name: 'Bio',
    fields: () => ({
        id: { type: GraphQLID },
        bioBy: {
            type: UserType,
            resolve(parent, args) {
                return User.findOne({ handle: parent.bioBy });
            }
        },
        body: { type: GraphQLString },
        website: { type: GraphQLString },
        location: { type: GraphQLString }
    })
});

// Queries
const Queries = new GraphQLObjectType({
    name: 'Queries',
    fields: {
        getUserById: {
            type: UserType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                return User.findById(args.id);
            }
        },
        getPostById: {
            type: PostType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                return Post.findById(args.id);
            }
        },
        getAllUsers: {
            type: new GraphQLList(UserType),
            resolve(parent, args) {
                return User.find({});
            }
        },
        getCurrentUser: {
            type: UserType,
            args: { token: { type: GraphQLString } },
            async resolve(parent, args) {
                const user = await verifyToken(args.token);
                return User.findById(user.id);
            }
        },
        getAllPosts: {
            type: new GraphQLList(PostType),
            resolve(parent, args) {
                return Post.find({});
            }
        },
    }
});

// Mutations
const Mutations = new GraphQLObjectType({
    name: 'Mutations',
    fields: {
        register: {
            type: UserType,
            args: {
                username: { type: GraphQLString },
                email: { type: GraphQLString },
                handle: { type: GraphQLString },
                password: { type: GraphQLString }
            },
            async resolve(parent, args) {
                const hashedPassword = await hashPassword(args.password);
                const user = new User({
                    username: args.username,
                    email: args.email,
                    handle: args.handle,
                    password: hashedPassword
                });
                // Check if user with email or handle already exists
                const userExists = await User.findOne({ $or: [{ email: args.email }, { handle: args.handle }] });
                if (userExists) {
                    throw new Error('User with such handle or email already exists. Please choose another.');
                } else {
                    return user.save();
                }
            }
        },
        login: {
            type: LoginType,
            args: {
                email: { type: GraphQLString },
                password: { type: GraphQLString },
                token: { type: GraphQLString }
            },
            async resolve(parent, args) {
                const user = await User.findOne({ email: args.email });
                if (!user) {
                    throw new Error('User does not exist');
                }
                const passwordMatch = await verifyPassword(user.password, args.password);
                if (!passwordMatch) {
                    throw new Error('Incorrect password');
                } else {
                    const token = signToken({ id: user.id });
                    return { email: user.email, password: user.password, token: token };
                }
            }
        },
        createBio: {
            type: BioType,
            args: {
                bioBy: { type: GraphQLString },
                body: { type: GraphQLString },
                website: { type: GraphQLString },
                location: { type: GraphQLString }
            },
            resolve(parent, args) {
                const bio = new Bio({
                    bioBy: args.bioBy,
                    body: args.body,
                    website: args.website,
                    location: args.location
                });
                const bioExists = Bio.findOne({ bioBy: args.bioBy });
                // if bio exists, update it
                if (bioExists) {
                    return Bio.findOneAndUpdate({ bioBy: args.bioBy }, { body: args.body, website: args.website, location: args.location });
                } else {
                    return bio.save();
                }
            }
        },
        createPost: {
            type: PostType,
            args: {
                title: { type: GraphQLString },
                content: { type: GraphQLString },
                postImage: { type: GraphQLString },
                postedBy: { type: GraphQLString },
                createdAt: { type: GraphQLString }
            },
            resolve(parent, args) {
                let post = new Post({
                    title: args.title,
                    content: args.content,
                    postImage: args.postImage,
                    postedBy: args.postedBy,
                    createdAt: args.createdAt
                });
                return post.save();
            }
        },
        uploadProfilePicture: {
            type: UserType,
            args: {
                id: { type: GraphQLID },
                profilePicture: { type: GraphQLString }
            },
            async resolve(parent, args) {
                const user = await User.findById(args.id);
                if (!user) {
                    throw new Error('User does not exist');
                } else {
                    const path = require('path');
                    const mainDir = path.join(__dirname, '../uploads/');
                    filename = mainDir + args.profilePicture;
                    // upload profile picture with cloudinary
                    const result = await cloudinary.uploader.upload(filename);
                    user.profilePicture = result.secure_url;
                    return user.save();
                }
            }
        },
        deletePostById: {
            type: PostType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                return Post.findByIdAndDelete(args.id);
            }
        },
    }
});

module.exports = new GraphQLSchema({
    query: Queries,
    mutation: Mutations
});