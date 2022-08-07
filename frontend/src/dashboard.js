import React from "react";
import { Link, NavLink } from "react-router-dom";
import "./css/dashboard.css";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import axios from "axios";
import PopupMessage from "./component/pop-up-message";
import Follower from "./component/followers";
import Following from "./component/Following";
import HOST_URL from "./proxy";
import Cookies from "js-cookie";
import baseUrl from "./proxy";
import DashboardPosts from "./component/dashboard-post";

import { ReactComponent as Settings } from "./images/settings.svg";
import { ReactComponent as Bookmark } from "./images/bookmark1.svg";
import { ReactComponent as PostsGrid } from "./images/PostsGrid.svg";
import { ReactComponent as Tagged } from "./images/tagged.svg";

class Dashboard extends React.Component {
  constructor(props) {
    super(props);

    let message = {
      title: "",
      message: "Update profile successfully",
      status: true,
      showPoupView: props.isShowPopupView,
      toggle: () => {},
    };
    let profile = localStorage.getItem("currentuserprofile");

    this.state = {
      selected: 0,
      profileurl:
        profile !== undefined
          ? profile
          : "https://upload.wikimedia.org/wikipedia/commons/3/3c/IMG_logo_%282017%29.svg",
      userId: 0,
      username: "insta_user",
      fullname: "insta_user",
      bio: "",
      website: "",
      posts: 0,
      followers: 0,
      following: 0,
      visibility: "public",
      hasErrorOnFetchInfo: false,
      updateProfile: false,
      message: message,
    };
  }

  componentDidMount() {
    console.log("Dashboard mounted");
    axios
      .get(HOST_URL + "/current_user_info", {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + Cookies.get("token"),
        },
      })
      .then((result) => {
        if (result.status === 200) {
          let data = result.data;
          console.log(data);

          localStorage.setItem("username", data.username);
          localStorage.setItem("currentuserprofile", data.profile);

          this.setState({
            profileurl: data.profile,
            username: data.username,
            fullname: data.fullname,
            bio: data.description,
            visibility: data.account_visibility,
            userId: data.userId,
            website: data.website,
          });
        } else {
          this.setState({
            hasErrorOnFetchInfo: true,
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
    axios
      .get(HOST_URL + "/currentUser_follower_following", {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + Cookies.get("token"),
        },
      })
      .then((result) => {
        if (result.status === 200) {
          let data = result.data;
          console.log(data);
          this.setState({
            followers: data.followers,
            following: data.following,
            posts: data.post,
          });
        } else {
          this.setState({
            hasErrorOnFetchInfo: true,
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  handleClickMenu = (e) => {};
  handleFileSelection = (e) => {
    e.preventDefault();
    let files = e.target.files;
    this.setState({
      updateProfile: false,
    });
    if (files.length > 0) {
      e.preventDefault();
      this.uploadProfile(files[0]);
    }
  };
  async uploadProfile(file) {
    let formData = new FormData();
    formData.append("profile", file);

    let result = await axios.post(HOST_URL + "/upload_profile", formData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + Cookies.get("token"),
      },
    });
    if (result.status === 200) {
      console.log(result.data);
      this.setState({
        updateProfile: true,
        profileurl: result.data.url,

        message: {
          title: "Success",
          message: "Update profile successfully",
          status: true,
        },
      });
    } else {
    }
  }
  handleClick = () => {};
  handleClosePopup = () => {
    window.location.href = "/" + this.state.username;
  };

  render() {
    let savedUrl = "/" + this.state.username + "/__saved__";
    let postsUrl = "/" + this.state.username;
    let following = "/" + this.state.username + "/following";
    let followers = "/" + this.state.username + "/followers";

    if (this.state.hasErrorOnFetchInfo) {
      return (
        <>
          <h1>Something went wrong</h1>
        </>
      );
    }
    let style = {
      link: {
        color: "#ffffff",
        textDecoration: "none",
      },
    };

    return (
      <>
        {this.state.updateProfile ? (
          <PopupMessage data={this.state.message} />
        ) : null}
        <Router>
          <Switch>
            <Route exact path={followers}>
              <div className="full-screen-popup">
                <span className="close" onClick={this.handleClosePopup}>
                  &times;
                </span>
                <Follower
                  info={{
                    userId: this.state.userId,
                    username: this.state.username,
                  }}
                  calledFrom="dash"
                />
              </div>
            </Route>
            <Route exact path={following}>
              <div className="full-screen-popup">
                <span className="close" onClick={this.handleClosePopup}>
                  &times;
                </span>
                <Following
                  info={{
                    userId: this.state.userId,
                    username: this.state.username,
                  }}
                  calledFrom="dash"
                />
              </div>
            </Route>
            <Route exact path={"accounts/edit"}></Route>
          </Switch>

          <div className="dashboard">
            {/* User Information Section */}

            <div className="main-container-user-information">
              <div className="profile-section">
                <img src={baseUrl + "/" + this.state.profileurl} alt="" />
              </div>

              <div className="user-information-section">
                <div className="username-edit-setting">
                  <h2>{this.state.username}</h2>
                  <label htmlFor="profile-pic" className="edit-profile-btn">
                    Edit Profile
                  </label>
                  <input
                    type="file"
                    hidden
                    name="profile-pic"
                    multiple={false}
                    accept="image/*"
                    id="profile-pic"
                    onChange={this.handleFileSelection}
                  />
                  <a href={"/accounts/edit"}>
                    {" "}
                    <Settings />
                  </a>
                </div>
                {/* Post,Followers and Following */}
                <div className="dashboard-post-follower-following">
                  <div
                    className="dashboard-post-container"
                    style={{ color: "white" }}
                  >
                    <span>{this.state.posts}</span>
                    <span>Posts</span>
                  </div>
                  <div
                    className="dashboard-follower-container"
                    onClick={this.handleClick}
                  >
                    <NavLink
                      to={followers}
                      onClick={this.handleClick}
                      style={style.link}
                    >
                      <span>{this.state.followers}</span>
                      <span>Followers</span>
                    </NavLink>
                  </div>
                  <div
                    className="dashboard-following-container"
                    onClick={this.handleClick}
                  >
                    <NavLink
                      to={following}
                      onClick={this.handleClick}
                      style={style.link}
                    >
                      <span>{this.state.following}</span>
                      <span>Following</span>
                    </NavLink>
                  </div>
                </div>

                <div className="user-fullname">{this.state.fullname}</div>
                <div className="user-website">
                  <a
                    href={"https://" + this.state.website}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {this.state.website}
                  </a>
                </div>
                <div className="user-bio">{this.state.bio}</div>
              </div>
            </div>

            <hr className="dashboard-userinfo-divider" />

            <Router>
              <div className="main-container-dashboard-menu">
                <div
                  className="current-user-post dashboard-sub-menu"
                  onClick={this.handleClickMenu(0)}
                >
                  <Link to={postsUrl} className="sub-menu-item">
                    <PostsGrid onSelect={this.handleSelected} />
                    &nbsp;
                    <span style={{ color: "white" }}>POSTS</span>
                  </Link>
                </div>
                <div
                  className="current-user-saved dashboard-sub-menu"
                  onClick={this.handleClickMenu(1)}
                >
                  <Link to={savedUrl} className="sub-menu-item">
                    <Bookmark onSelect={this.handleSelected} />
                    &nbsp;
                    <span style={{ color: "white" }}>SAVED</span>
                  </Link>
                </div>
                <div
                  className="current-user-tagged dashboard-sub-menu"
                  onClick={this.handleClickMenu(2)}
                >
                  <a
                    href={"/explore/tags/" + this.state.username}
                    className="sub-menu-item"
                    onSelect={this.handleSelected}
                  >
                    <Tagged /> &nbsp;
                    <span style={{ color: "white" }}>TAGGED</span>
                  </a>
                </div>
              </div>
              {/* POSTS */}
              <div className="main-container-dashboard-data">
                <Switch>
                  <Route exact path={postsUrl}>
                    <DashboardPosts calledFrom="dashboard_post" />
                  </Route>
                  <Route exact path={savedUrl}>
                    <DashboardPosts calledFrom="dashboard_saved" />
                  </Route>
                </Switch>
              </div>
            </Router>
          </div>
        </Router>
      </>
    );
  }
}

export default Dashboard;
