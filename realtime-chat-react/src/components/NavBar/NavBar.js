import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import { ReactComponent as WhiteLogo } from '../../assets/white_logo.svg';
import { connect } from 'react-redux'
import { UserActions } from '../../actions/user.actions';

const styles = theme => ({
    root: {
        zIndex: theme.zIndex.drawer + 1,
        alignItems: 'center',
    },
    grow: {
        flexGrow: 1,
        textAlign: 'center'
    },
    menuButton: {
        marginLeft: -12,
        marginRight: 20,
    },
});

const NavBar = (props) => {
    const { classes } = props;
    return (
        <div className={classes.root}>
            <AppBar position="fixed">
                <Toolbar>
                    <Grid
                        container
                        direction="row"
                        justify="center"
                        alignItems="center"
                        spacing={8}
                    >
                        <Grid item>
                            <WhiteLogo />

                        </Grid>
                        <Grid item>
                            <Typography variant="h6" color="inherit" className={classes.grow}>
                                WhatsApp Clone
                 </Typography>
                        </Grid>
                    </Grid>
                    <Button color="inherit" onClick={props.logout}>Logout <ExitToAppIcon /></Button>
                </Toolbar>
            </AppBar>
        </div>
    );
}

const mapDispatchToProps = dispatch =>({
    logout: ()=>dispatch(UserActions.logout())
})

export default connect(null, mapDispatchToProps)(withStyles(styles)(NavBar));
