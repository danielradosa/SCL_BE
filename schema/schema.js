// Imports
const graphql = require('graphql');
const _ = require('lodash');
const { GraphQLObjectType, GraphQLString, GraphQLSchema, GraphQLID, GraphQLInt, GraphQLList } = graphql;

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
        posts: {
            type: new GraphQLList(PostType),
            resolve(parent, args) {
                //return _.filter(posts, { postedBy: parent.handle });
            }
        }
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
                //return _.find(user, { handle: parent.postedBy });
            }
        }
    })
});


// Queries
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        getUserById: {
            type: UserType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                //return _.find(user, { id: args.id });
            }
        },
        getPostById: {
            type: PostType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                //return _.find(posts, { id: args.id });
            }
        },
        getAllUsers: {
            type: new GraphQLList(UserType),
            resolve(parent, args) {
                //return user;
            }
        },
        getAllPosts: {
            type: new GraphQLList(PostType),
            resolve(parent, args) {
                //return posts;
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery
});