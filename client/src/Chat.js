import React from 'react'
import { 
    ApolloClient, 
    InMemoryCache, 
    ApolloProvider,
    useMutation,
    useSubscription,
    gql
} from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws'



// create a link for the subscription
const link = new WebSocketLink({
    uri: `ws://localhost:4000/`,
    options: {
        reconnect: true
    }
})

const client = new ApolloClient({
    link,
    uri: "http://localhost:4000/",
    cache: new InMemoryCache(),
  });


const GET_MESSAGES = gql`
  subscription {
    messages {
      id
      content
      user
    }
  }
`;

const POST_MESSAGE = gql `
    mutation ($user: String!, $content: String!) {
    postMessage(user: $user, content: $content)
    }
`

const Messages = ({ user }) => {
    const { data } = useSubscription(GET_MESSAGES);
    if (!data) {
      return null; 
    }
    return (
        <>
            {data.messages.map(({ id, user: messageUser, content }) => (
                <>
                    {user !== messageUser && (
                        <div className = 'not-me-name'>
                            {messageUser.slice(0,2).toUpperCase()}
                        </div>
                    )}
                    {user !== messageUser && (
                        <div className = 'not-me-name'>
                            {messageUser}
                        </div>
                    )}
                    <div className = {user === messageUser ? 'from-me' : 'from-them'}>
                        {user !== messageUser && (
                            <div className = 'not-me-name'>
                                {messageUser.slice(0,2).toUpperCase()}
                                {messageUser}
                            </div>
                        )}
                        <div className = 'chat-content'>
                            {content}
                        </div>
                    </div>
                    <div className="clear"></div>
                </>
            ))}
        </>
    )
}

const Chat = () => {
    const [state, stateSet] = React.useState({
        // user: 'Change To iArt UserName',
        user: 'Jack',
        content: '',
    })
    const [postMessage] = useMutation(POST_MESSAGE)
    const onSend = () => {
        if(state.content.length > 0) {
            postMessage({
                variables: state,
            })
        }
        stateSet({
            ...state, 
            content: '',
        })
    }


    return (
    <section>
        <Messages user={state.user} />
        <div className='new-chat-form'>
            <input
                label="User"
                value={state.user}
                onChange={(evt) =>
                    stateSet({
                    ...state,
                    user: evt.target.value,
                })
                }
            />

            <input
                label="Content"
                value={state.content}
                onChange={(evt) =>
                    stateSet({
                    ...state,
                    content: evt.target.value,
                })
            }

            onKeyUp={(e) => {
                if (e.keyCode === 13) {
                onSend();
                } else if (e.keyIdentifier === 13) {
                onSend()
              } 
            }}
            />

            <button onClick={() => onSend()} style={{ width: "100%" }}>
            Send
            </button>

        </div>
    </section>
    );
}

export default () => (
    <ApolloProvider client={client}>
        <Chat />
    </ApolloProvider>
)  