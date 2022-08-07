import axios from "axios";
import React from "react";
import { Redirect } from "react-router-dom";

import "./css/login.css";
import HOST_URL from "./proxy";
import Cookies from "js-cookie";

import Banner from "./images/banner.png";
import logo from "./images/logo.png";
import { ReactComponent as Warning } from "./images/warning.svg";

class Login extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isLogin: false,
      email: "",
      fullname: "",
      username: "",
      pswd: "",
      isLoginFail: false,
      message: "",
      btnState: true,
    };

    this.onChangePassword = this.onChangePassword.bind(this);
    this.onChangeUserName = this.onChangeUserName.bind(this);
    this.onChangeFullName = this.onChangeFullName.bind(this);
    this.onChangeEmail = this.onChangeEmail.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  onChangeEmail = (e) => {
    this.setState({
      email: e.target.value,
    });
    if (e.target.value.length > 0) {
      this.setState({
        btnState: false,
      });
    }
  };
  onChangeUserName = (e) => {
    this.setState({
      username: e.target.value,
    });
  };
  onChangeFullName = (e) => {
    this.setState({
      fullname: e.target.value,
    });
  };
  onChangePassword = (e) => {
    this.setState({
      pswd: e.target.value,
    });
  };
  handleCookie = (token) => {
    try {
      Cookies.set("token", token, { expires: 1, path: "/" });
    } catch (error) {
      console.log("Failed to set cookie");
    }
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.setState({
      btnState: true,
    });

    axios
      .post(
        HOST_URL + "/login",
        {
          email: this.state.email,
          password: this.state.pswd,
        },
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      )
      .then((res) => {
        let data = res.data;
        if (res.status === 200) {
          if (data.status === 200) {
            Cookies.set("username", data.username);
            localStorage.setItem("username", data.username);
            this.handleCookie(data.token);
            this.setState({
              isLogin: true,
              isLoginFail: false,
              isAuth: true,
            });
            window.location.href = "/";
          }
          if (data.status === 201) {
            Cookies.set("email_verify_token", data.token);
            window.location.href = "/accounts/verify/email/";
          } else {
            this.setState({
              isLogin: false,
              isLoginFail: true,
              message: data.message,
            });
          }
        } else if (res.status === 401) {
          this.setState({
            isLogin: false,
            isLoginFail: true,
            message: res.data.message,
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });

    document.getElementsByTagName("form")[0].reset();
    this.setState({
      email: "",
      fullname: "",
      username: "",
      pswd: "",
      error: "",
      btnState: true,
    });
  };

  render() {
    if (this.props.isAuth) {
      return <Redirect to="/" isAuth={this.state.isAuth} />;
    }
    if (this.state.isLogin) {
      return <Redirect to="/" isAuth={this.state.isLogin} />;
    }
    return (
      <>
        <div className="login">
          <div className="loginContainer">
            <img className="banner" src={Banner} alt="banner" />
            <div className="signinContainer">
              <div className="signinMenu">
                <img className="logo" src={logo} alt="logo" />
                <form
                  method="POST"
                  className="signInForm"
                  id="login-form"
                  onSubmit={this.handleSubmit}
                >
                  <input
                    value={this.state.email}
                    onChange={this.onChangeEmail}
                    name="email"
                    id="email"
                    type="email"
                    placeholder="Email"
                    required
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={this.state.pswd}
                    onChange={this.onChangePassword}
                    name="pswd"
                    id="pswd"
                    required
                  />
                  <input
                    type="submit"
                    value="Login"
                    disabled={this.state.btnState}
                  />
                </form>
                {this.state.isLoginFail && (
                  <div className="validation">
                    <Warning />
                    &nbsp;&nbsp;
                    {this.state.message}
                  </div>
                )}
                <div className="forgotPassword">
                  <a href="/accounts/password/reset">Forgot your password?</a>
                </div>
              </div>
              <div className="signIn">
                <div className="signInText">
                  Don't have an account?{" "}
                  <a href="/accounts/emailsignup">Sign up</a>
                </div>
              </div>
              <div className="copyright">
                <span>Made by Ankhbayar Enkhlkhagva 2022</span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default Login;
