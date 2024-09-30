const { GraphQLError } = require('graphql');
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
const { v1: uuid } = require('uuid');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const Book = require('./models/book');
const Author = require('./models/author');
const User = require('./models/user');

const { PubSub } = require('graphql-subscriptions');
const book = require('./models/book');
const pubsub = new PubSub();

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      if (args.author) {
        // find the author from Author collection
        const existingAuthor = await Author.findOne({ name: args.author });
        // if found, proceed to find books under that author's name
        if (existingAuthor) {
          return Book.find({ author: existingAuthor._id }).populate('author');
        } else {
          throw new GraphQLError('Author does not exist', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.name,
              error,
            },
          });
        }
      }
      // find books by genre
      if (args.genre) {
        return Book.find({ genres: { $in: [args.genre] } }).populate('author');
      }
      //return all books if filters are not applied
      return Book.find({}).populate('author');
    },
    allAuthors: async (root, args) => {
      return Author.find({});
    },
    me: (root, args, context) => {
      return context.currentUser;
    },
  },
  Author: {
    bookCount: async (author) => {
      try {
        return Book.collection.countDocuments({ author: author._id });
      } catch (error) {
        throw new GraphQLError('An error occured while counting books', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            error,
          },
        });
      }
    },
  },
  Mutation: {
    addBook: async (root, args, context) => {
      const currentUser = context.currentUser;
      if (!currentUser) {
        throw new GraphQLError('Not authenticated!', {
          extensions: {
            code: 'UNAUTHORIZED',
          },
        });
      }
      try {
        const existingBook = await Book.findOne({ title: args.title }); // find existing book from Book collection
        // if book has existed, throw error
        if (existingBook) {
          throw new GraphQLError('Book name must be unique', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.title,
            },
          });
        }
        //find existing author from Author collection
        let author = await Author.findOne({ name: args.author });
        // // if this is a new author, add the author to collection
        if (!author) {
          author = new Author({ name: args.author });
          await author.save();
        }
        // Save the new book to Collection
        const book = new Book({
          title: args.title,
          author: author._id,
          published: args.published,
          genres: args.genres,
        });
        const savedBook = await book.save();
        pubsub.publish('BOOK_ADDED', { bookAdded: savedBook });
        return Book.findById(savedBook._id).populate('author');
      } catch (error) {
        throw new GraphQLError('An error occurred while adding the book', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            error,
          },
        });
      }
    },
    editAuthor: async (root, args, context) => {
      const { name, setBornTo } = args;
      const currentUser = context.currentUser;
      if (!currentUser) {
        throw new GraphQLError('Not authenticated!', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        });
      }
      try {
        const existingAuthor = await Author.findOne({ name });
        if (!existingAuthor) {
          return null;
        }
        const updatedAuthor = Author.findByIdAndUpdate(
          existingAuthor._id,
          { $set: { born: setBornTo } },
          { new: true }
        );
        return updatedAuthor;
      } catch (error) {
        console.error('Error updating author', error);
        throw new GraphQLError('An error occured while updating the author', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
            error,
          },
        });
      }
    },
    createUser: async (root, args) => {
      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre,
      });

      return user.save().catch((error) => {
        throw new GraphQLError('Creating user failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.username,
            error,
          },
        });
      });
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });
      if (!user || args.password !== 'secret') {
        throw new GraphQLError('Wrong credentials!', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        });
      }
      const userForToken = {
        username: user.username,
        id: user._id,
      };
      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) };
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator('BOOK_ADDED'),
    },
  },
};

module.exports = resolvers;
