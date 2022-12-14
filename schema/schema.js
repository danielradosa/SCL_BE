// Imports
const graphql = require('graphql');
//const cloudinary = require('cloudinary').v2;
const _ = require('lodash');
const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLSchema,
    GraphQLID,
    GraphQLList,
    GraphQLBoolean,
    GraphQLInt,
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
        following: { type: new GraphQLList(GraphQLString) },
        followers: { type: new GraphQLList(GraphQLString) },
        artist: { type: GraphQLBoolean },
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

const BioType = new GraphQLObjectType({
    name: 'Bio',
    fields: () => ({
        id: { type: GraphQLID },
        bioBy: {
            type: UserType,
            resolve(parent, args) {
                return User.findOne({ id: parent.bioBy });
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
        },
        likedBy: {
            type: new GraphQLList(UserType),
            resolve(parent, args) {
                return User.find({ _id: { $in: parent.likedBy } });
            }
        },
    })
});

const LoginType = new GraphQLObjectType({
    name: 'Login',
    fields: () => ({
        id: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        allUserInfo: {
            type: UserType,
            resolve(parent, args) {
                return User.findOne({ email: parent.email });
            }
        },
        token: { type: GraphQLString }
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
            args: {
                limit: { type: GraphQLInt },
                offset: { type: GraphQLInt }
            },
            resolve(parent, args) {
                return Post.find({}).sort({ createdAt: -1 }).limit(args.limit).skip(args.offset);
            }
        },
        getAllPostsByUser: {
            type: new GraphQLList(PostType),
            args: { handle: { type: GraphQLString } },
            resolve(parent, args) {
                return Post.find({ postedBy: args.handle });
            }
        },
        searchPosts: {
            type: new GraphQLList(PostType),
            args: { search: { type: GraphQLString } },
            resolve(parent, args) {
                return Post.find({
                    // search is in title or content
                    $or: [
                        { title: { $regex: args.search, $options: 'i' } },
                        { content: { $regex: args.search, $options: 'i' } }
                    ]
                });
            }
        },
        getAllArtists: {
            type: new GraphQLList(UserType),
            resolve(parent, args) {
                return User.find({ artist: true });
            }
        },
        getMostLikedPosts: {
            type: new GraphQLList(PostType),
            args: {
                limit: { type: GraphQLInt },
                offset: { type: GraphQLInt }
            },
            resolve(parent, args) {
                return Post.find({}).sort({ likedBy: -1 }).limit(args.limit).skip(args.offset);
            }
        },
        getMostFollowedUsers: {
            args: {
                limit: { type: GraphQLInt },
                offset: { type: GraphQLInt }
            },
            type: new GraphQLList(UserType),
            resolve(parent, args) {
                return User.find({}).sort({ followers: -1 }).limit(args.limit).skip(args.offset);
            }
        },
        getCurrentUserBio: {
            type: BioType,
            args: { token: { type: GraphQLString } },
            async resolve(parent, args) {
                const user = await verifyToken(args.token);
                return Bio.findOne({ bioBy: user.id });
            }
        }
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
                password: { type: GraphQLString },
                role: { type: GraphQLString }
            },
            async resolve(parent, args) {
                const hashedPassword = await hashPassword(args.password);
                const user = new User({
                    username: args.username,
                    email: args.email,
                    handle: args.handle,
                    password: hashedPassword,
                    role: args.role
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
                password: { type: GraphQLString }
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
                    return { email: user.email, password: user.password, token: token, ...user._doc };
                }
            }
        },
        updateUsername: {
            type: UserType,
            args: {
                id: { type: GraphQLID },
                username: { type: GraphQLString },
                token: { type: GraphQLString }
            },
            async resolve(parent, args) {
                const user = await verifyToken(args.token);
                const userExists = await User.findOne({ username: args.username });
                if (userExists) {
                    throw new Error('Username already taken');
                }
                if (user.id !== args.id) {
                    throw new Error('You are not authorized to update this user');
                }
                return User.findByIdAndUpdate
                    (args.id, { username: args.username }, { new: true });
            }
        },
        updateEmail: {
            type: UserType,
            args: {
                id: { type: GraphQLID },
                email: { type: GraphQLString },
                token: { type: GraphQLString }
            },
            async resolve(parent, args) {
                const user = await verifyToken(args.token);
                const userExists = await User.findOne({ email: args.email });
                if (userExists) {
                    throw new Error('Email already taken');
                }
                if (user.id !== args.id) {
                    throw new Error('You are not authorized to update this user');
                }
                return User.findByIdAndUpdate
                    (args.id, { email: args.email }, { new: true });
            }
        },
        createOrUpdateBio: {
            type: BioType,
            args: {
                bioBy: { type: GraphQLString },
                body: { type: GraphQLString },
                website: { type: GraphQLString },
                location: { type: GraphQLString }
            },
            async resolve(parent, args) {
                // check if usertype has a bio field with bio id
                const user = await User.findById(args.bioBy);
                if (user.bio) {
                    // if bio exists, update it
                    return Bio.findByIdAndUpdate(user.bio, args, { new: true });
                } else {
                    // if bio does not exist, create it
                    const bio = new Bio(args);
                    const bioSaved = await bio.save();
                    user.bio = bioSaved.id;
                    user.save();
                    return bioSaved;
                }
            }
        },
        likeOrDislikePost: {
            type: PostType,
            args: {
                id: { type: GraphQLID },
                token: { type: GraphQLString }
            },
            async resolve(parent, args) {
                const user = await verifyToken(args.token);
                const post = await Post.findById(args.id);
                if (!post) {
                    throw new Error('Post does not exist');
                }
                if (post.likedBy.includes(user.id)) {
                    post.likedBy = post.likedBy.filter(like => like !== user.id);
                    return post.save();
                } else {
                    post.likedBy.push(user.id);
                    return post.save();
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
                createdAt: { type: GraphQLString },
                likes: { type: GraphQLInt },
            },
            resolve(parent, args) {
                let post = new Post({
                    title: args.title,
                    content: args.content,
                    postImage: args.postImage,
                    postedBy: args.postedBy,
                    createdAt: args.createdAt,
                    likes: args.likes
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
                    return User.findByIdAndUpdate(args.id, { profilePicture: args.profilePicture }, { new: true });
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
        followOrUnfollowUser: {
            type: UserType,
            args: {
                id: { type: GraphQLID },
                handle: { type: GraphQLString }
            },
            async resolve(parent, args) {
                const user = await User.findById(args.id);
                if (!user) {
                    throw new Error('User does not exist');
                } else {
                    const userToFollow = await User.findOne({ handle: args.handle });
                    if (!userToFollow) {
                        throw new Error('User does not exist');
                    } else {
                        // check if user is already following the user
                        const isFollowing = user.following.includes(args.handle);
                        if (isFollowing) {
                            // remove user from following array
                            user.following = user.following.filter(following => following !== args.handle);
                            // remove user from followers array
                            userToFollow.followers = userToFollow.followers.filter(follower => follower !== user.handle);
                            await user.save();
                            return userToFollow.save();
                        } else {
                            // add user to following array
                            user.following.push(args.handle);
                            // add user to followers array
                            userToFollow.followers.push(user.handle);
                            await user.save();
                            return userToFollow.save();
                        }
                    }
                }
            }
        },
        toggleArtist: {
            type: UserType,
            args: {
                id: { type: GraphQLID },
            },
            async resolve(parent, args) {
                const user = await User.findById(args.id);
                if (!user) {
                    throw new Error('User does not exist');
                } else {
                    const isArtist = user.artist;
                    if (isArtist) {
                        user.artist = false;
                        await user.save();
                        return user;
                    }
                    else {
                        // add user to artists array
                        user.artist = true;
                        await user.save();
                        return user;
                    }
                }
            }
        },
        deleteAccount: {
            type: UserType,
            args: {
                id: { type: GraphQLID }
            },
            async resolve(parent, args) {
                const user = await User.findById(args.id);
                if (!user) {
                    throw new Error('User does not exist');
                } else {
                    // delete all posts by user
                    await Post.deleteMany({ postedBy: user.handle });
                    // delete user
                    return User.findByIdAndDelete(args.id);
                }
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: Queries,
    mutation: Mutations
});