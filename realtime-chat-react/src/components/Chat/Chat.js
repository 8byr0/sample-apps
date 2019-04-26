import React, { useEffect, useState } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import ChatHeader from './ChatHeader';
import ChatDiscussion from './ChatDiscussion';
import ChatSend from './ChatSend';
import { ChatActions } from '../../actions/chat.actions';
import { connect } from 'react-redux'



const styles = theme => ({
    chat: {
        width: '100%',
        background: '#F5F5F5',
        // backgroundColor: theme.palette.background.paper,
        [`${theme.breakpoints.up('xs')} and (orientation: landscape)`]: {
            minHeight: `calc(100% - ${theme.mixins.toolbar["@media (min-width:0px) and (orientation: landscape)"].minHeight}px)`,
            maxHeight: `calc(100% - ${theme.mixins.toolbar["@media (min-width:0px) and (orientation: landscape)"].minHeight}px)`,
        },
        [theme.breakpoints.up('sm')]: {
            minHeight: `calc(100% - ${theme.mixins.toolbar["@media (min-width:600px)"].minHeight}px)`,
            maxHeight: `calc(100% - ${theme.mixins.toolbar["@media (min-width:600px)"].minHeight}px)`,
        },
        display: 'flex',
        flexFlow: 'column',
    },
    discussion:{
        flexGrow:1,
        overflow:'auto'
    },
    root: {
        background: '#F5F5F5',
        backgroundColor: theme.palette.background.paper,
        [`${theme.breakpoints.up('xs')} and (orientation: landscape)`]: {
            height: `calc(100% - ${theme.mixins.toolbar["@media (min-width:0px) and (orientation: landscape)"].minHeight}px)`,
        },
        [theme.breakpoints.up('sm')]: {
            height: `calc(100% - ${theme.mixins.toolbar["@media (min-width:600px)"].minHeight}px)`,
        },
        flexGrow: 1
    },
    sendBox: {
        padding: '30px 100px'
    },
});

const Chat = (props) => {
    const { classes, sendMessage, chatsList, opened } = props;
    const [data, setData] = useState(chatsList[opened])

    useEffect(() => {
        setData(props.chatsList[props.opened])
    }, [props])

    return (
        <div className={classes.root}>
            <ChatHeader user={data.user} />
            <Grid className={classes.chat}>
                {/* <Grid container direction="column"
                    alignItems="baseline"
                    style={{ overflow: 'auto' }} className={classes.chat}> */}
                    <ChatDiscussion data={data} className={classes.discussion}/>
                {/* </Grid> */}
                <ChatSend item className={classes.sendBox} onSubmit={text => sendMessage(data.user._id, text)} />
            </Grid>
        </div>
    )
}

const mapStateToProps = (state) => ({
    chatsList: state.chat.list,
    opened: state.chat.opened
});
const mapDispatchToProps = (dispatch) => ({
    loadChatList: () => dispatch(ChatActions.loadChatList()),
    sendMessage: (id, text) => dispatch(ChatActions.sendMessage(id, text))
});

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Chat));

