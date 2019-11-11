import React, { Component } from "react";
import AuthService from "./Auth";
import SignIn from "./SignIn";
import { BrowserRouter as Router } from "react-router-dom";

import App from "./App";
import SignUp from "./SignUp";
import ForgetPassword from "./ForgetPassword";

class Main extends Component {
  state = {
    loading: true,
    loggedIn: false,
    page: 0,
    showCode: false,
  };

  componentDidMount() {
    // toast.configure({
    //     autoClose: 3000,
    // })
    // new AuthService().logout();
    // console.log("main");
    if (new AuthService().loggedIn()) {
      this.setState({
        loading: false,
        loggedIn: true
      });
    } else {
      this.setState({
        loading: false,
        loggedIn: false
      });
    }
  }

  login = (username, password) => {
    this.setState({
      loading: true,
      loggedIn: false
    });

    new AuthService()
      .login(username, password)
      .then(() => {
        this.setState({
          loading: false,
          loggedIn: true
        });
        // toast.info('Login successful!');
      })
      .catch(() => {
        // toast.error('Email or password incorrect!');
        this.setState({
          loading: false,
          loggedIn: false
        });
      });
  };

  register = (username, name, password) => {
    this.setState({
      loading: true,
      loggedIn: false,
    });

    new AuthService()
      .register(username, name, password)
      .then(() => {
        this.setState({
          loading: false,
          loggedIn: false,
          page: 0,
        }, () => {
          alert('A verification mail has been sent to your email to activate the account!');
          // toast.info('Login successful!');
        });
      })
      .catch(() => {
        alert('Account already exists!');
        // toast.error('Email or password incorrect!');
        this.setState({
          loading: false,
          loggedIn: false
        });
      });
  };

  forgetPassword = (username) => {
    this.setState({
      loading: true,
      loggedIn: false,
    });

    new AuthService()
      .forgetPassword(username)
      .then(() => {
        this.setState({
          loading: false,
          loggedIn: false,
          username,
          showCode: true,
          page: 5,
        }, () => {
          alert('A verification code has been sent to your email to reset the passowrd!');
          // toast.info('Login successful!');
        });
      })
      .catch(() => {
        alert('Account not found or verified!');
        // toast.error('Email or password incorrect!');
        this.setState({
          loading: false,
          loggedIn: false
        });
      });
  };

  changePassword = (code, password) => {
    this.setState({
      loading: true,
      loggedIn: false,
    });

    new AuthService()
      .changePassword(this.state.username, password, code)
      .then(() => {
        this.setState({
          loading: false,
          loggedIn: false,
          page: 0,
        }, () => {
          alert('Password Reset!');
          // toast.info('Login successful!');
        });
      })
      .catch(() => {
        alert('Something went worng! Please check you verification code!');
        // toast.error('Email or password incorrect!');
        this.setState({
          loading: false,
          loggedIn: false
        });
      });
  };

  goToSignUp = () => {
    this.setState({
      page: 1,
    })
  }

  goToSignIn = () => {
    this.setState({
      page: 0,
    })
  }

  goToForgetPassword = () => {
    this.setState({
      page: 5,
      showCode: false,
    })
  }

  render() {
    if (this.state.loading) {
      return (
        <div>
          <h1>Loading...</h1>
        </div>
      );
    }

    if (!this.state.loggedIn) {
      switch (this.state.page) {
        case 0:
          return <SignIn login={this.login} goToSignUp={this.goToSignUp} goToForgetPassword={this.goToForgetPassword} />;
        case 1:
          return <SignUp register={this.register} goToSignIn={this.goToSignIn} />;
        default:
          return <ForgetPassword changePassword={this.changePassword} showCode={this.state.showCode} forgetPassword={this.forgetPassword} goToSignIn={this.goToSignIn} />
      }
    }

    return (
      <Router>
        <App />
      </Router>
    );
  }
}

export default Main;
