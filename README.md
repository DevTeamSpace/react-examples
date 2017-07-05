As the project uses react+redux, it uses components and containers, two entities representing the visuals.
Components are representing the markup while the main logic and application state are transferred to the components by a container.

# Comments.js Component

The given component is representing a comment to a user's request. The main feature of the comment in this particular project is a fast user card - the Avatar Module. As the user card contains lots of user info, all of it should be loaded and transferred into the component itself. The parameters are pre-formed by the prepareAvatarData(item) method.
The components are formed in a way to avoid the extensive logic in the app itself, and to make the component reusable in a different modules of the app.

At the top of component declaration we check the incoming parameters. This makes the development process easier letting the developer know what values should be given as the input.

# ChatMenu Component

This component is used to build the list of chats on the messaging page.

This list can contain several elements

- Chat. Chat is a connectable component called SearchListChat which contains user information, their avatar, time of the last visit, and a latest message from the conversation with this particular user. clicking this component leads to a full chat with a current user.

- User. The component is displayed after the search results are received. It contains the user info and their avatar. A new/existing chat is displayed when clicking the user component.

- Search bar. The search is initiated by dispatching the event this.props.dispatch(searchChat(text, chats)) with the proper parameters.
As the search is done on the server side as well, we decided to use debounce of 500ms while searching. The chats list is stored locally, which allows filtering chats in the reducer itself. If the chat list is empty the search bar just informs the user that search is available.

To improve the app visuals we use a scrollbar from the react-custom-scrollbars with a parameter for auto-hide and hiding the horizontal scroll on Windows OS.

Redux is used inside the project and usually a component contains the markup and a controller represents its state. However, sometimes we change the state inside the component itself, like a self-controlled textbox where the value depends on the state.

# ChatCard Component

This component is used for displaying user messages on the chat page.

The component outputs a list of messages where the messages are an array with the following fields [text, datetime created, author, status (sent, sending, error, etc.)

The messages are sent by dispatching the event with parameters this.props.dispatch(sendMessage(this.state.message, this.props.user.user_id)); The text field for messages contains a counter limiting characters count. The limitation is based on getting and setting state inside the component.

Like the ChatMenu, the component uses a custom parametrized scrollbar with the autoscroll triggered on sending ore receiving a message.

The component cann add user to friends or groups. For this it uses a newly-created sub-component called PersonDropdown.
The username displayed in PersonDropdown is a link to a person's page, namely <Link> from the react-router. The link is formed with the ES6-based string interpolation  {`/people/${user.user_id}`}


# sagas.js

Sagas, a new approach to work with react+redux is used inside the application.
Sagas is used to form and send requests to the server. In a standard Redux workflow, that was done with Actions. However, using sagas gives the developer several advantages.

- Actions do not contain the unnecessary logic, they only reflect the action type and parameters.
- sagas contains the functions with a separate watcher in each of them, processing the pre-set action

The requests for working with a chats page are formed and sent in the saga. After that, a new action containing the data received from the server is dispatched. To encode/decode the sent and received data the normalizer module is used, creating one object ordered by a unique id from a set of objects.
 
