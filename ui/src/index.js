import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import { ThemeProvider } from '@material-ui/styles';
import theme from './pages/theme';
import Main from './pages/Main';
// import App from './pages/App';
// import { BrowserRouter as Router } from "react-router-dom";

ReactDOM.render(
    <ThemeProvider theme={theme}>
        <Main />
        {/* <Router>
            <App />
        </Router> */}
    </ThemeProvider>
    , document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
