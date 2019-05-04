import { Observable } from 'rxjs/Observable';
import { combineLatest, throwError } from 'rxjs';
import { store } from '../helpers/store';
import { and, or, cond } from "space-api";
import * as _ from 'lodash'
import { config } from './config';


const sendMessage = async (partnerID, text) => {
    const user = store.getState().user.user;

    await config.db.insert("messages")
        .one({ _id: config.generateId(), text: text, read: false, to: partnerID, from: user._id, time: new Date() })
        .then(res => {
            // Verify if get request is successful
            if (res.status !== 200) {
                throw "User not allowed to sign in";
                return;
            }
            return res;
        }).catch((error) => {
            throw error;
        });
}

const getMessages = async () => {
    const user = store.getState().user.user;

    const condition = or(cond("to", "==", user._id), cond("from", "==", user._id));

    await config.db.get("messages").where(condition).apply().then(res => {
        if (res.status === 200) {
            let messages = {}

            res.data.result.forEach((elt) => {
                const key = (elt.from === user._id) ? elt.to : elt.from
                if (!messages[key]) {
                    messages[key] = []
                }
                messages[key].push(elt)
            })
            messages["ALL"] = []

            return messages;
        }
    }).catch((err) => { throw err });
}

const getUsers = async () => {
    const user = store.getState().user.user;
    const condition = cond("_id", "!=", user._id);

    await config.db.get("users").where(condition).apply().then(res => {
        if (res.status === 200) {
            let users = convertRawUsersToHasedObject(res.data.result)

            return users;
        }
    }).catch((err) => {
        throw err
    });
}

const convertRawUsersToHasedObject = (rawUsers) => {
    let users = {}
    rawUsers.forEach((elt) => {
        users[elt._id] = elt
    })
    users["ALL"] = { _id: "ALL", name: 'ALL' }
    return users;
}

const getChats = async (localUserID) => {
    const user = store.getState().user.user;

    const condition = or(
        cond("from", "==", user._id),
        cond("to", "==", user._id),
        cond("to", "==", "ALL")
    );

    await config.db.get("chats").where(condition).apply().then(res => {
        if (res.status === 200) {
            return res.data.result;
        }
    }).catch((err) => { throw err });

}

const startMessagesRealtime = (partnerID) => {
    const user = store.getState().user.user;
    const condition = or(
        and(cond("to", "==", user._id), cond("from", "==", partnerID)),
        and(cond("to", "==", partnerID), cond("from", "==", user._id))
    )
    const allCondition = cond("to", "==", partnerID)
    return config.db.liveQuery("messages").where(
        (partnerID.toString().localeCompare("ALL") === 0) ? allCondition : condition
    )
}

const startUsersRealtime = () => {
    return config.db.liveQuery("users");
}

const startChatsRealtime = () => {
    const user = store.getState().user.user;
    const condition = or(
        and(cond("to", "==", user._id)),
    )

    return config.db.liveQuery("chats").where(
        condition
    )
}


const getChatsList = () => {

    return Observable.create((observer) => {
        const activeUser = store.getState().user.user;

        let userID = activeUser._id
        const fetchUsers$ = getUsers(userID)
        const fetchChats$ = getChats(userID)

        const combined = combineLatest(fetchUsers$, fetchChats$);
        combined.subscribe(
            ([users, existingChats]) => {
                let chats = {}
                // chats["ALL"] = {
                //     user: { name: "ALL", _id: "ALL" },
                //     messages: [

                //     ]
                // }
                console.log(existingChats)
                existingChats.forEach(chat => {
                    if (chat.to !== 'ALL') {
                        const partner = (chat.to === userID) ? chat.from : chat.to
                        if (!chats[partner]) {
                            chats[partner] = {
                                user: _.first(users.filter((usr) => usr._id === partner)),
                                messages: [

                                ]
                            }
                        }
                    } else {
                        chats["ALL"] = {
                            user: { name: "ALL", _id: "ALL" },
                            messages: [

                            ]
                        }
                    }
                })

                // TODO
                // chats = _.reject(chats, chat => chat.messages.length === 0)
                // chats = _.reject(chats, chat => chat.user._id === activeUser._id)

                observer.next(_.values(chats))
            }, (error) => {
                console.log(error)
            })

    });
}



export const ChatService = {
    getChats,
    getUsers,
    getMessages,
    // getChatsList,
    sendMessage,
    startMessagesRealtime,
    startChatsRealtime,
    startUsersRealtime
}