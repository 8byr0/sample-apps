import { ChatService } from "../services/ChatService";
import { ChatConstants } from "../constants/chat.constants";
import { store } from "../helpers/store";
import { notificationActions } from "./notifications.actions";

/**
 * Stop all existing livequeries.
 * @authenticated
 */
const stopAllLiveQueries = () => {
    return dispatch => {
        // Stop all single threads listeners
        store.getState().chat.liveQueries.forEach(liveQuery => {
            liveQuery()
            dispatch({
                type: ChatConstants.REMOVE_LIVE_QUERY,
                liveQuery
            })
        })

        // Stop listening for new chats
        const chatsListener = store.getState().chat.chatsListener
        if (null !== chatsListener) {
            chatsListener()
        }

        // Stop listening for new users
        const usersListener = store.getState().chat.usersListener
        if (null !== usersListener) {
            usersListener()
        }
    }
}

/**
 * Dispatch an action to reset
 * chat reducer to its initial state
 * @authenticated
 */
const clearData = () => ({
    type: ChatConstants.CLEAR_DATA
})

/**
 * Add a new chat to the list. 
 * Dispatch this action on new incoming chat (created post-init)
 * @param {Object} chat 
 * @authenticated
 */
const addChat = (chat) => ({
    type: ChatConstants.ADD_CHAT,
    chat
})

/**
 * Listen to messages thread of a given chat.
 * This action instantiates 2 callbacks (onMessages & onError).
 * LiveQuery object is stored in chat reducer
 * @param {Object} chat 
 * @authenticated
 */
const listenToThread = (partnerID) => {
    return dispatch => {
        const currentLiveQuery = ChatService.startMessagesRealtime(partnerID).then(
            /**
             * Callback triggered on new messages in given thread
             * @param {Array<Object>} docs 
             * @param {*} type 
             */
            (docs, type) => {
                // TODO 8byr0 compare incoming list with existing to append only new messages
                const messages = docs

                if (docs.length > 0) {
                    dispatch({ type: ChatConstants.SET_PARTNER_MESSAGES, partnerID: partnerID, messages: messages })
                }

            }).catch(

                /**
                 * Callback triggered when something goes wrong
                 * @param {*} err
                 */
                (error) => {
                    dispatch(notificationActions.failureMessage("An error occurred when listening to chat messages: " + error))
                })

        dispatch({
            type: ChatConstants.SAVE_LIVE_QUERY,
            liveQuery: currentLiveQuery
        })
    }
}

/**
 * Listen to newly created users.
 * @authenticated
 */
const listenToUsers = () => {
    return dispatch => {
        const newUsersListener = ChatService.startUsersRealtime().then(
            /**
             * Callback triggered on new users registered
             * @param {Array<Object>} docs 
             * @param {*} type 
             */
            (rawUsers, type) => {
                let users = {}

                rawUsers.forEach((elt) => {
                    users[elt._id] = elt
                })
                users["ALL"] = { _id: "ALL", name: 'ALL' }

                dispatch({ type: ChatConstants.SET_USERS, users });
            }).catch(


                /**
                 * Callback triggered when something goes wrong
                 * @param {*} err
                 */
                (error) => {
                    dispatch(notificationActions.failureMessage("An error occurred when listening to new users: " + error))
                })

        dispatch({
            type: ChatConstants.SET_INCOMING_USERS_LISTENER,
            listener: newUsersListener
        })
    }
}

/**
 * Listen to new chats.
 * Instantiated callback may be triggered when someone 
 * starts a discussion with active user
 * @authenticated
 */
const listenToChats = () => {
    return dispatch => {
        const newChatsListener = ChatService.startChatsRealtime().then(
            /**
             * Callback triggered on new messages in given thread
             * @param {Array<Object>} docs 
             * @param {*} type 
             */
            (docs, type) => {
                dispatch({ type: ChatConstants.SET_CHATS, docs })
            }).catch(


                /**
                 * Callback triggered when something goes wrong
                 * @param {*} error
                 */
                (error) => {
                    dispatch(notificationActions.failureMessage("An error occurred when listening to chats: " + error))
                })

        dispatch({
            type: ChatConstants.SET_INCOMING_CHATS_LISTENER,
            listener: newChatsListener
        })
    }
}

const retrieveUsers = (launchRealTime = false) => {
    return dispatch => {
        ChatService.getUsers().then(
            (users) => {
                users["ALL"] = { _id: "ALL", name: 'ALL' }

                dispatch({ type: ChatConstants.SET_USERS, users });
                if (launchRealTime === true) {
                    dispatch(listenToUsers())
                    for (const userID in users) {
                        dispatch(listenToThread(userID))

                    }
                }
            }).catch(
                (error) => {
                    dispatch(notificationActions.failureMessage("An error occurred when retrieving users: " + error))
                }
            )
    }
}
const retrieveChats = () => {
    return dispatch => {
        ChatService.getChats().then(
            (chats) => { dispatch({ type: ChatConstants.SET_CHATS, chats }) }
        ).catch(
            (error) => {
                dispatch(notificationActions.failureMessage("An error occurred when retrieving chats: " + error))
            }
        )
    }
}
const retrieveMessages = () => {
    return dispatch => {
        ChatService.getMessages().then(
            (messages) => {
                dispatch({ type: ChatConstants.SET_MESSAGES, messages })
            }).catch(
                (error) => {
                    dispatch(notificationActions.failureMessage("An error occurred when retrieving messages: " + error))
                }
            )
    }
}

const loadInitialData = () => {
    return dispatch => {
        dispatch(retrieveChats());
        dispatch(retrieveUsers(true));
        dispatch(retrieveMessages());
    }
}

/**
 * Set the active chat of the app
 * TODO pass only id instead of full object
 * @param {string} partnerID 
 */
const openDiscussion = (partnerID) => {
    return dispatch => {
        dispatch({ type: ChatConstants.OPEN_DISCUSSION_REQUEST });
        dispatch({
            type: ChatConstants.OPEN_DISCUSSION_SUCCESS,
            id: partnerID
        });
    };
}

/**
 * Send a new message
 * @param {string} partnerID id of the partner
 * @param {string} text text of the message
 */
const sendMessage = (partnerID, text) => {
    return dispatch => {
        dispatch({ type: ChatConstants.SEND_MESSAGE_REQUEST });
        // Call chat service function
        ChatService.sendMessage(partnerID, text).subscribe(
            res => {
                dispatch({ type: ChatConstants.SEND_MESSAGE_SUCCESS });
            },
            (error) => {
                // In case of error dispatch an FAILURE notice
                dispatch({
                    type: ChatConstants.SEND_MESSAGE_FAILURE,
                    error: error.toString()
                });
                dispatch(notificationActions.failureMessage("Unable to send message, please try again. Details: " + error))
            }
        );
    };
}

export const ChatActions = {
    loadInitialData,
    openDiscussion,
    sendMessage,
    stopAllLiveQueries,
    clearData
}