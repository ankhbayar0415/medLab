import React from "react";
import { BrowserRouter as Router, Link } from "react-router-dom";
import LoginAndSignup from "./component/loginandsignup";
import InstaMenu from "./component/menu";
import UserSearchNavSec from "./component/usersearch";
import "./css/navbar.css";

import logo from "./images/logo.png";

class NavBar extends React.Component {
  constructor(props) {
    super(props);
    console.log(props);
    this.state = {
      isClickedProfile: false,
    };
    this.handleClickProfile = this.handleClickProfile.bind(this);
    this.close = this.close.bind(this);
    this.addEventListener = this.addEventListener.bind(this);
  }

  addEventListener() {
    document.addEventListener("click", this.close);
  }

  handleClickProfile() {
    if (this.state.isClickedProfile) {
      this.setState({
        isClickedProfile: false,
      });
      document.getElementsByClassName("sub-menu-profile")[0].style.display =
        "none";
    } else {
      this.setState({
        isClickedProfile: true,
      });
      document.getElementsByClassName("sub-menu-profile")[0].style.display =
        "flex";
    }
  }

  close() {
    if (this.state.isClickedProfile) {
      this.setState({
        isClickedProfile: false,
      });
      document.getElementsByClassName("sub-menu-profile")[0].style.display =
        "none";
    }
  }

  componentDidUpdate() {
    //console.log("Update");
  }

  render() {
    return (
      <>
        <nav className="instagram-navbar-menu-container" onClick={this.close}>
          <div className="nav-wrapper">
            {/* Title Section */}
            <section className="title-section">
              <Link to="/">
                <img className="logo" src={logo} alt="medialab logo" />
              </Link>
            </section>

            {/* Search Section */}
            <section className="search-section">
              <UserSearchNavSec />
            </section>

            {/* Menu Section */}
            {this.props.isAuth ? (
              <InstaMenu
                close={this.close}
                handleClickProfile={this.handleClickProfile}
              />
            ) : (
              <LoginAndSignup />
            )}
          </div>
        </nav>
      </>
    );
  }
}

export default NavBar;
