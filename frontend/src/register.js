import axios from "axios";
import Cookies from "js-cookie";
import React, { useEffect } from "react";
import { Redirect } from "react-router-dom";
import { useHistory } from "react-router-dom";

import "./css/login.css";
import HOST_URL from "./proxy";

import Banner from "./images/banner.png";
import logo from "./images/logo.png";
import { ReactComponent as Warning } from "./images/warning.svg";

function EmailSignUp(props) {
  const [userInfo, setUserInfo] = React.useState({
    email: "",
    pswd: "",
    fullname: "",
    username: "",
  }); // eslint-disable-next-line
  const [email, setEmail] = React.useState("");
  const history = useHistory();
  const [btnState, setBtnState] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [hasError, setHasError] = React.useState(false);
  const [isRegister, setIsRegister] = React.useState(false);

  useEffect(() => {
    if (isRegister) {
      setTimeout(() => {
        history.push("/login");
      }, 3000);
    }
    return () => {
      setTimeout(() => {
        setIsRegister(false);
      }, 2500);
    }; // eslint-disable-next-line
  }, [isRegister]);

  useEffect(() => {
    if (
      userInfo.email !== "" &&
      userInfo.fullname !== "" &&
      userInfo.username !== "" &&
      userInfo.pswd !== ""
    ) {
      setBtnState(false);
    } else {
      setBtnState(true);
    }
    return () => {
      setBtnState(true);
    };
  }, [userInfo]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    axios
      .post(
        HOST_URL + "/accounts/register",
        {
          ...userInfo,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        if (res.status === 200) {
          let data = res.data;
          if (data.status === 200) {
            Cookies.set("email_verify_token", data.token, { expires: 1 });
            setEmail(userInfo.email);
            setIsRegister(true);
            setUserInfo({
              email: "",
              pswd: "",
              fullname: "",
              username: "",
            });
            window.location.href = "/accounts/verify/email/";

            setHasError(false);
            setErrorMessage("");
          } else if (data.status === 403) {
            setErrorMessage(data.message);
            setHasError(true);
          }
        } else {
          setErrorMessage("Something went wrong");
          setHasError(true);
        }
      })
      .catch((err) => console.log(err));
  };
  const onchangeInput = (e) => {
    setUserInfo({
      ...userInfo,
      [e.target.name]: e.target.value,
    });
  };

  let token = Cookies.get("token");

  if (token !== undefined) {
    return <Redirect to="/" isAuth={this.props.isAuth} />;
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
                id="register-form"
                onSubmit={handleSubmit}
              >
                <input
                  value={userInfo.email}
                  onChange={onchangeInput}
                  name="email"
                  id="email"
                  type="email"
                  placeholder="Email"
                />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={userInfo.fullname}
                  onChange={onchangeInput}
                  name="fullname"
                  id="fullname"
                />
                <input
                  type="text"
                  placeholder="Username"
                  value={userInfo.username}
                  onChange={onchangeInput}
                  name="username"
                  id="username"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={userInfo.pswd}
                  onChange={onchangeInput}
                  name="pswd"
                  id="pswd"
                  autoComplete=""
                />
                <input type="submit" value="Register" disabled={btnState} />
              </form>

              {hasError && (
                <div className="validation">
                  <Warning />
                  &nbsp;&nbsp;
                  {errorMessage}
                </div>
              )}

              {isRegister && (
                <div className="validation">Successfully Registered</div>
              )}
            </div>
            <div className="signIn">
              <div className="signInText">
                Have an account? <a href="/login">Login</a>
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

export default EmailSignUp;
