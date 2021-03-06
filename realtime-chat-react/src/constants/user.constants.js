/**
 * user.constants.js contain all actions that can be dispatched to UserReducer.
 * 
 * @author 8byr0 <https://github.com/8byr0>
 */

export const userConstants = {
    REGISTER_REQUEST: 'REGISTER_REQUEST',
    REGISTER_SUCCESS: 'REGISTER_SUCCESS',
    REGISTER_FAILURE: 'REGISTER_FAILURE',

    LOGIN_REQUEST: 'LOGIN_REQUEST',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGIN_FAILURE: 'LOGIN_FAILURE',

    LOGOUT: 'LOGOUT',

    GETALL_REQUEST: 'GETALL_REQUEST',
    GETALL_SUCCESS: 'GETALL_SUCCESS',
    GETALL_FAILURE: 'GETALL_FAILURE',

    DELETE_REQUEST: 'DELETE_REQUEST',
    DELETE_SUCCESS: 'DELETE_SUCCESS',
    DELETE_FAILURE: 'DELETE_FAILURE',

    UPDATE_LAST_ACTIVE_TIME: 'UPDATE_LAST_ACTIVE_TIME'
};
