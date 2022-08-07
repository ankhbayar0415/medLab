import React from "react";
import { Link, NavLink } from "react-router-dom";
import HOST_URL from "../proxy";
import Cookies from "js-cookie";

import "../css/menu.css";

import { ReactComponent as Home } from "../images/home.svg";
import { ReactComponent as NewPost } from "../images/newPost.svg";
import { ReactComponent as Explore } from "../images/explore.svg";
import { ReactComponent as Notifications } from "../images/notifications.svg";
import { ReactComponent as Account } from "../images/account.svg";
import { ReactComponent as Bookmark } from "../images/bookmark.svg";
import { ReactComponent as SettingsIcon } from "../images/settings.svg";
import { ReactComponent as LogoutIcon } from "../images/logout.svg";

class InstaMenu extends React.Component {
  logout = (e) => {
    e.preventDefault();
    fetch(HOST_URL + "/logout", {
      method: "POST",
      headers: { "content-type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status == 200) {
          Cookies.remove("token");
          localStorage.clear();
          window.location.href = "/login";
        }
      })
      .catch((err) => {
        console.log(err);
      });

    this.props.close();
  };

  render() {
    let username = localStorage.getItem("username");

    return (
      <>
        <div className="menuItems">
          <div className="icon">
            <NavLink to="/" onClick={this.props.close}>
              <Home />
            </NavLink>
          </div>

          <div className="icon">
            <Link to="/create/" onClick={this.props.close}>
              <NewPost />
            </Link>
          </div>

          <div className="icon">
            <Link to="/explore" onClick={this.props.close}>
              <Explore />
            </Link>
          </div>
          <div className="icon">
            <Link to="/activity" onClick={this.props.close}>
              <Notifications />
            </Link>
          </div>
          <div className="pro-icon">
            <Account onClick={this.props.handleClickProfile} />
            {/* Sub Menu */}
            <div className="sub-menu-profile">
              <Link to={"/" + username} onClick={this.props.close}>
                <div className="sub-menu-options">
                  <Account /> &nbsp; Profile
                </div>
              </Link>
              <Link
                to={"/" + username + "/__saved__"}
                onClick={this.props.close}
              >
                <div className="sub-menu-options">
                  <Bookmark /> &nbsp; Saved
                </div>
              </Link>
              <Link to="/accounts/edit" onClick={this.props.close}>
                <div className="sub-menu-options">
                  <SettingsIcon /> &nbsp; Settings
                </div>
              </Link>
              <Link to="" onClick={this.logout}>
                <div className="sub-menu-options">
                  <LogoutIcon /> &nbsp; Logout
                </div>
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default InstaMenu;
