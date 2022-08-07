import axios from "axios";
import Cookies from "js-cookie";
import React from "react";

import { Link, NavLink } from "react-router-dom";

import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import DashboardPosts from "./component/dashboard-post";
import FollowAndFollowing from "./component/follow-following";
import UserNotLogin from "./notlogin";
import HOST_URL from "./proxy";
import Follower from "./component/followers";
import Following from "./component/Following";

import { ReactComponent as PostsGrid } from "./images/PostsGrid.svg";
import { ReactComponent as Tagged } from "./images/tagged.svg";
import { Redirect } from "react-router-dom/cjs/react-router-dom.min";
import TagView from "./tagsview";

class OtherUserProfile extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      message: "",
      isLoading: true,
      qusername: this.props.match.params.username,
      followers: 0,
      posts: 0,
      following: 0,
      userId: 0,
      username: "",
      fullname: "",
      user_type: "",
      profile: "",
      description: "",
      bio: "",
      website: "",
      date_of_birth: 0,
      account_status: "",
      account_visibility: "",
      page_not_found: false,
    };
  }

  getFollowerAndFollowingCount = (userID) => {
    axios
      .get(HOST_URL + "/get_follower_following?userId=" + userID)
      .then((result) => {
        if (result.status === 200) {
          let data = result.data;
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
      });
  };

  incrementFollowers = () => {
    if (this.state.account_visibility.toLocaleLowerCase() === "private") {
      return;
    }
    this.setState({
      followers: this.state.followers + 1,
    });
  };

  decrementFollowers = () => {
    if (this.state.account_visibility.toLocaleLowerCase() === "private") {
      return;
    }
    if (this.state.followers > 0)
      this.setState({
        followers: this.state.followers - 1,
      });
  };

  componentDidMount() {
    document.getElementsByTagName("title")[0].innerHTML = this.state.qusername;
    console.log("visited profile username: " + this.state.qusername);

    axios
      .post(HOST_URL + "/other_user_profile", {
        username: this.state.qusername,
      })
      .then((result) => {
        let res = result.data;
        console.log(res);
        if (result.status === 301) {
          window.location.href = res.redirect;
        } else if (res.status === 403) {
          this.setState({
            page_not_found: true,
          });
        } else {
          this.setState({
            userId: res[0].userId,
            username: res[0].username,
            fullname: res[0].fullname,
            user_type: res[0].user_type,
            profile: res[0].profile,
            website: res[0].website,
            description: res[0].description,
            date_of_birth: res[0].date_of_birth,
            account_status: res[0].account_status,
            account_visibility: res[0].account_visibility,
            isLoading: false,
          });
          this.getFollowerAndFollowingCount(res[0].userId);
        }
      })
      .catch((err) => {
        console.log(err);
      });

    setTimeout(() => {
      if (Cookies.get("token") !== undefined) {
        axios
          .post(
            HOST_URL + "/visited_by_someone",
            {
              userId: this.state.userId,
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + Cookies.get("token"),
              },
            }
          )
          .then((result) => {
            if (result.status === 200) {
              //
            }
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        axios
          .post(
            HOST_URL + "/visited_by_someone_notlogin",
            {
              userId: this.state.userId,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          )
          .then((result) => {
            if (result.status === 200) {
              //
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }, 30000);
  }

  handleClosePopup = () => {
    window.location.href = "/" + this.state.username;
  };

  handleClick = () => {};

  render() {
    let postsUrl = "/" + this.state.username;
    let following = "/" + this.state.username + "/following";
    let followers = "/" + this.state.username + "/followers";
    if (this.state.page_not_found) {
      return (
        <>
          <h1>Page not found {this.state.qusername}</h1>
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
                  calledFrom="other"
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
                  calledFrom="other"
                />
              </div>
            </Route>
          </Switch>
          <UserNotLogin />
          <div className="dashboard">
            {/* User Information Section */}
            <div className="main-container-user-information">
              <div className="profile-section">
                <img src={HOST_URL + "/" + this.state.profile} alt="" />
              </div>

              <div className="user-information-section">
                <div className="username-edit-setting">
                  <h2>{this.state.username}</h2>
                  {this.state.isLoading ? null : (
                    <FollowAndFollowing
                      isAuth={this.props.isAuth}
                      user={{
                        account_visibility: this.state.account_visibility,
                        userId: this.state.userId,
                        incFollower: this.incrementFollowers,
                        decFollower: this.decrementFollowers,
                      }}
                    />
                  )}
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
                <div className="user-bio">{this.state.description}</div>
              </div>
            </div>

            <hr className="dashboard-userinfo-divider" />

            <Router>
              <div className="main-container-dashboard-menu">
                <div className="current-user-post dashboard-sub-menu">
                  <Link to={postsUrl} className="sub-menu-item">
                    <PostsGrid onSelect={this.handleSelected} />
                    &nbsp;
                    <span style={{ color: "white" }}>POSTS</span>
                  </Link>
                </div>

                <div className="current-user-tagged dashboard-sub-menu">
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

              {/* End Dashboard Menu Section */}

              {/* Another Section */}
              <div className="main-container-dashboard-data">
                <Switch>
                  <Route exact path={postsUrl}>
                    <DashboardPosts userId={this.state.userId} />
                  </Route>
                </Switch>
              </div>
            </Router>

            {/*End Section  */}
          </div>
        </Router>
      </>
    );
  }
}

export default OtherUserProfile;
