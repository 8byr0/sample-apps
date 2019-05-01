import {
    userService
} from "../services/UserService";
import {
    userConstants
} from "../constants/user.constants";
import {
    history,
} from '../helpers';
import { ChatActions } from "./chat.actions";
import { store } from '../helpers/store'
/**
 * SignUp to space-cloud API using identifiers.
 * This action will trigger a login on success.
 * @param {string} email 
 * @param {string} username 
 * @param {string} password 
 */
const signup = (email, username, password) => {
    const request = () => {
        return {
            type: userConstants.REGISTER_REQUEST
        }
    }

    const success = () => {
        return {
            type: userConstants.REGISTER_SUCCESS,
        }
    }

    const failure = (reason) => {
        return {
            type: userConstants.REGISTER_FAILURE,
            reason
        }
    }
    return dispatch => {
        dispatch(request());

        userService.signup(email, username, password).subscribe(
            (data) => {
                dispatch(success(data.user, data.token));
                dispatch(login(email, password))
            },
            (error) => {
                console.log("ERROR DURING REGISTER", error)
                dispatch(failure(error.toString()));
            }
        );
    };
}

/**
 * Login to space-cloud API
 * @param {string} username 
 * @param {string} password 
 */
const login = (username, password) => {
    const loginRequest = () => {
        return {
            type: userConstants.LOGIN_REQUEST
        }
    }

    const loginSuccess = (user, token) => {
        return {
            type: userConstants.LOGIN_SUCCESS,
            user,
            token
        }
    }

    const loginFailure = (reason) => {
        return {
            type: userConstants.LOGIN_FAILURE,
            reason
        }
    }
    return dispatch => {
        dispatch(loginRequest());

        userService.login(username, password).subscribe(
            (data) => {
                localStorage.setItem("user", JSON.stringify(data.user))
                localStorage.setItem("token", JSON.stringify(data.token))
                dispatch(loginSuccess(data.user, data.token));
                history.push('/')
            },
            (error) => {
                console.log("ERROR LOGGING IN", error)
                dispatch(loginFailure(error.toString()));
            }
        );
    };
}

/**
 * Logout from api. 
 * Clears token and user from local storage.
 * This function also stops all running livequeries
 */
const logout = () => {
    return dispatch => {
        dispatch(ChatActions.stopAllLiveQueries())
        localStorage.removeItem("user")
        localStorage.removeItem("token")
        dispatch({
            type: userConstants.LOGOUT
        })
        history.push('/login')


    }
}

/**
 * Set active user status
 * @param {boolean} isActive 
 * @param {number} lastActiveTime (timestamp)
 */
const setUserActive = (isActive, lastActiveTime) => {
    const updateLocalUser = () => ({ type: userConstants.UPDATE_LAST_ACTIVE_TIME, lastActiveTime, isActive })
    return dispatch => {
        const user = store.getState().user.user
        userService.updateUser({ ...user, lastActiveTime, isActive }).then(
            (res) => {
                dispatch(updateLocalUser())
            },
            (err) => {
                console.log(err)
            });

    }
}

export const UserActions = {
    login,
    signup,
    logout,
    setUserActive
}