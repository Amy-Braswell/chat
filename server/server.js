const { GraphQLServer, PubSub } = require('graphql-yoga')

// resolver has to return an array so create an empty message array
const messages = []

// define what different types look like
// this establishes the shape of ALL fields in each message type
const typeDefs = `
    type Message {
        id: ID!
        user: String!
        content: String!
    }
    type Query {
        messages: [Message!]
    }
    type Mutation {
        postMessage(user: String!, content: String!): ID!
    }
    type Subscription {
      messages: [Message!]
    }
`

// this creates a list of who is subscribed
const subscribers = []
const onMessagesUpdates = (fn) => subscribers.push(fn)

// use resolvers to actually get the data - this is how we get the data
// resolvers are a function 
const resolvers = {
    Query: {
        messages: () => messages,
      },
      Mutation: {
        postMessage: (parent, { user, content }) => {
          const id = messages.length;
          messages.push({
            id,
            user,
            content,
          });
          subscribers.forEach(fn => fn())
          return id;
        },
      },
      Subscription: {
        messages: {
          subscribe: (parent, args, { pubsub }) => {
            // this creates a new random channel
            const channel = Math.random().toString(36).slice(2,15)
            onMessagesUpdates(() => pubsub.publish(channel, { messages }))
            setTimeout(() => pubsub.publish(channel, { messages }), 0)
            return pubsub.asyncIterator(channel)
          }
        }
      }

}


const pubsub = new PubSub()
// establishes server & starts it
const server = new GraphQLServer({ typeDefs, resolvers, context: {pubsub} });
server.start(({ port }) => {
  console.log(`Server on http://localhost:${port}/`);
});