import {
    createMuiTheme
} from '@material-ui/core/styles';
import blue from '@material-ui/core/colors/blue';

const theme = createMuiTheme({
    palette: {
        primary: {
            main: '#0063FF',
        }
    },
    typography: {
        fontFamily: [
            'Proxima Nova',
        ],
        useNextVariants: true
    }
});

export default theme;