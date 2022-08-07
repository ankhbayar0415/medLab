import React from "react";
import { Link } from "react-router-dom";

class LoginAndSignup extends React.Component {
  render() {
    return (
      <>
        <div style={{ display: "flex" }}>
          <Link to="/login">
            <button
              className="login-button"
              style={{
                backgroundColor: "rgb(243, 117, 59)",
                border: "0",
                borderRadius: "2px",
                marginRight: "10px",
                cursor: "pointer",
                color: "white",
                padding: "10px 20px",
                fontWeight: "bold",
              }}
            >
              {" "}
              Login{" "}
            </button>
          </Link>

          <Link to="/accounts/emailsignup/">
            <button
              className="signup-button"
              style={{
                backgroundColor: "rgb(243, 117, 59)",
                border: "0",
                borderRadius: "2px",
                marginRight: "10px",
                cursor: "pointer",
                color: "white",
                padding: "10px 20px",
                fontWeight: "bold",
              }}
            >
              {" "}
              Signup{" "}
            </button>
          </Link>
        </div>
      </>
    );
  }
}

export default LoginAndSignup;
