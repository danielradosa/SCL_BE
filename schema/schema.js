// Imports
const graphql = require('graphql');
const _ = require('lodash');
const { GraphQLObjectType, GraphQLString, GraphQLSchema, GraphQLID, GraphQLInt, GraphQLList } = graphql;

// Models
const User = require('../models/user');
const Post = require('../models/post');
const Bio = require('../models/bio');

// Define Types
const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLID },
        username: { type: GraphQLString },
        email: { type: GraphQLString },
        handle: { type: GraphQLString },
        password: { type: GraphQLString },
        following: { type: GraphQLInt },
        followers: { type: GraphQLInt },
        bio: {
            type: BioType,
            resolve(parent, args) {
                return Bio.find({ id: parent.id });
            }
        },
        posts: {
            type: new GraphQLList(PostType),
            resolve(parent, args) {
                return Post.find({ postedBy: parent.id });
            }
        }
    })
});

const BioType = new GraphQLObjectType({
    name: 'Bio',
    fields: () => ({
        id: { type: GraphQLID },
        who: {
            type: UserType,
            resolve(parent, args) {
                return User.findById(parent.who);
            }
        },
        body: { type: GraphQLString },
        website: { type: GraphQLString },
        location: { type: GraphQLString }
    })
});

const PostType = new GraphQLObjectType({
    name: 'Post',
    fields: () => ({
        id: { type: GraphQLID },
        title: { type: GraphQLString },
        content: { type: GraphQLString },
        postImageURL: { type: GraphQLString },
        postedBy: {
            type: UserType,
            resolve(parent, args) {
                return User.findOne({ id: parent.postedBy });
            }
        }
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
        getBioByUserId: {
            type: BioType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                return Bio.findOne({ who: args.id });
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
        getAllPosts: {
            type: new GraphQLList(PostType),
            resolve(parent, args) {
                return Post.find({});
            }
        }
    }
});

// Mutations
const Mutations = new GraphQLObjectType({
    name: 'Mutations',
    fields: {
        registerUser: {
            type: UserType,
            args: {
                username: { type: GraphQLString },
                email: { type: GraphQLString },
                handle: { type: GraphQLString },
                password: { type: GraphQLString },
                following: { type: GraphQLInt },
                followers: { type: GraphQLInt }
            },
            resolve(parent, args) {
                let user = new User({
                    username: args.username,
                    email: args.email,
                    handle: args.handle,
                    password: args.password,
                    following: args.following,
                    followers: args.followers
                });
                return user.save();
            }
        },
        createBio: {
            type: BioType,
            args: {
                who: { type: GraphQLID },
                body: { type: GraphQLString },
                website: { type: GraphQLString },
                location: { type: GraphQLString }
            },
            resolve(parent, args) {
                let bio = new Bio({
                    who: args.who,
                    body: args.body,
                    website: args.website,
                    location: args.location
                });
                return bio.save();
            }
        },
        createPost: {
            type: PostType,
            args: {
                title: { type: GraphQLString },
                content: { type: GraphQLString },
                postImageURL: { type: GraphQLString },
                postedBy: { type: GraphQLString }
            },
            resolve(parent, args) {
                let post = new Post({
                    title: args.title,
                    content: args.content,
                    postImageURL: args.postImageURL,
                    postedBy: args.postedBy
                });
                return post.save();
            }

        }
    }
});

module.exports = new GraphQLSchema({
    query: Queries,
    mutation: Mutations
});