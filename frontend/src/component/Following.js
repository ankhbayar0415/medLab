import axios from "axios";
import React, { useEffect } from "react";
import HOST_URL from "../proxy";
import Cookies from "js-cookie";
import FollowAndFollowing, { RemoveFollowing } from "./follow-following";

function FollowingListRender(props) {
  let caller = props.caller;
  let follower = props.follower;

  let style = {
    container: {
      position: "relative",
      display: "block",
      width: "100%",
      userSelect: "none",
    },
    followerInfo: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      userSelect: "none",
      padding: "10px",
      height: "53px",
    },
    image: {
      width: "49px",
      height: "49px",
      objectFit: "cover",
      borderRadius: "50%",
      userSelect: "none",
      marginRight: "10px",
    },
    link: {
      textDecoration: "none",
      color: "black",
      zIndex: "1",
      display: "flex",
      alignItems: "center",
    },
    usernameFullname: {
      fontSize: "14px",
      fontWeight: "500",
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
      textAlign: "start",
    },
    fullname: {
      color: "#828282",
    },
    removeFollowerFollowing: {
      position: "relative",
      display: "flex",
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
    },
  };
  return (
    <>
      <div style={style.container}>
        <div className="followers-info" style={style.followerInfo}>
          <a href={"/" + follower.username} style={style.link}>
            <div className="user-profile">
              <img
                src={HOST_URL + "/" + follower.profile}
                alt="profile"
                style={style.image}
              />
            </div>
            <div className="username-fullname" style={style.usernameFullname}>
              <span style={style.link}>{follower.username}</span>
              <span style={style.fullname}>{follower.fullname}</span>
            </div>
          </a>
          <div
            className="remove-follow-following"
            style={style.removeFollowerFollowing}
          >
            {caller === "dash" ? null : (
              <FollowAndFollowing
                user={{
                  userId: follower.userId,
                  username: follower.username,
                  incFollower: () => {},
                  decFollower: () => {},
                }}
                calledFrom="callFromPostView"
              />
            )}

            {caller === "dash" ? <RemoveFollowing user={follower} /> : null}
          </div>
        </div>
      </div>
    </>
  );
}

function Following(props) {
  let info = props.info;
  let caller = props.calledFrom;

  let [follower, setFollower] = React.useState([]);
  let [isLoading, setIsLoading] = React.useState(true);
  let [userId, setUserId] = React.useState(0);
  let [username, setUsername] = React.useState("");
  let [error, setError] = React.useState(false);
  let [errorMessage, setErrorMessage] = React.useState("");

  useEffect(() => {
    setUserId(info.userId);
    setUsername(info.username);

    axios
      .get(
        HOST_URL +
          "/get_followings?info=" +
          JSON.stringify({
            userId: info.userId,
            username: info.username,
          }),
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + Cookies.get("token"),
          },
        }
      )
      .then((res) => {
        if (res.status === 200) {
          let data = res.data;
          if (data.status === 200) {
            setFollower(data.following);
            setIsLoading(false);
          } else {
            let data = res.data;
            if (data.status === 403) {
              setError(true);
              setErrorMessage(data.message);
              setIsLoading(false);
            } else {
              setError(true);
              setErrorMessage("Something went wrong");
              setIsLoading(false);
            }
          }
        }
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
        setError(true);
      });
    return () => {
      setIsLoading(false);
    };
  }, [info]);

  let style = {
    close: {
      cursor: "pointer",
    },
  };

  return (
    <>
      <div
        className={
          isLoading
            ? "dashboard-followers-main-container"
            : "dashboard-followers-main-container-active"
        }
      >
        <div className="dashboard-follower-header">
          <div className="dashboard-follower-header-title">
            <h4>Following</h4>
          </div>
        </div>
        <div className="dashboard-following-list">
          {isLoading ? (
            <h1 style={{ marginLeft: "15px" }}>Loading...</h1>
          ) : error === true ? (
            <h1 style={{ marginLeft: "15px" }}>{errorMessage}</h1>
          ) : follower.length == 0 ? (
            <>
              <h1 style={{ marginLeft: "15px" }}>No Following</h1>
            </>
          ) : (
            follower.map((follower, index) => {
              return (
                <FollowingListRender
                  follower={follower}
                  key={index}
                  caller={caller}
                />
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

export default Following;
