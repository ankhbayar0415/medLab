import axios from "axios";
import Cookies from "js-cookie";
import React, { useState, useEffect } from "react";
import HOST_URL from "../proxy";

import { ReactComponent as Notifications } from "../images/notifications.svg";
import { ReactComponent as CommentButton } from "../images/comments.svg";

function DashboardPostItem(props) {
  let post = props.post;
  let [item, setItem] = useState([]);
  let [isHover, setHover] = useState(false);
  let [commentCount, setCommentCount] = useState(0);
  let [likeCount, setLikeCount] = useState(0);
  console.log(item);
  useEffect(() => {
    setItem(post[0]);
    axios
      .get("/analyze_post?postId=" + post[0].postId)
      .then((result) => {
        if (result.status === 200) {
          if (result.data.status === 200) {
            setCommentCount(result.data.commentCount);
            setLikeCount(result.data.likeCount);
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
    return () => {};
  }, [post]);

  if (item.length === 0) {
    return <></>;
  }

  const handleMouseOver = () => {
    setHover(true);
  };
  const handleMouseOut = () => {
    setHover(false);
  };

  return (
    <>
      <div
        className="post-data"
        onMouseEnter={handleMouseOver}
        onMouseLeave={handleMouseOut}
      >
        {isHover ? (
          <a href={item.postUrl}>
            <div
              className="analyze-comment-and-like"
              onMouseEnter={handleMouseOver}
              onMouseLeave={handleMouseOut}
            >
              <div>
                <b style={{ fontSize: "20px" }}>{likeCount}</b>
                <Notifications />
              </div>
              <div>
                <b style={{ fontSize: "20px" }}>{commentCount}</b>
                <CommentButton />
              </div>
            </div>
          </a>
        ) : null}
        <a href={item.postUrl} style={{ display: "flex" }}>
          {item.mimetype.match(/image/) ? (
            <img
              className="dashboard-post-item-image"
              draggable={false}
              src={HOST_URL + "/" + item.url}
              onMouseEnter={handleMouseOver}
              onMouseLeave={handleMouseOut}
            />
          ) : null}
          {item.mimetype.match(/video/) ? (
            <video
              className="dashboard-post-item-video"
              draggable={false}
              src={HOST_URL + "/" + item.url}
              onMouseEnter={handleMouseOver}
              onMouseLeave={handleMouseOut}
            />
          ) : null}
        </a>
      </div>
    </>
  );
}

function DashboardPosts(props) {
  let calledFrom = props.calledFrom;
  let [posts, setPosts] = useState([]);
  let [loading, setLoading] = useState(true);
  let [error, setError] = useState(false);
  let [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (calledFrom === "dashboard_saved") {
      axios
        .get(HOST_URL + "/get_saved_posts", {
          headers: {
            "content-type": "application/json",
            Authorization: "Bearer " + Cookies.get("token"),
          },
        })
        .then((res) => {
          if (res.status == 200) {
            setPosts(res.data.posts);
            setLoading(false);
          }
        })
        .catch((err) => {
          //(err);
          setError(true);
          setErrorMessage(err.message);
        });
    } else if (calledFrom == "dashboard_post") {
      axios
        .get("/currentuser_posts", {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + Cookies.get("token"),
          },
        })
        .then((res) => {
          if (res.status === 200) {
            let data = res.data;
            if (data.status === 200) {
              setPosts(data.posts);
              setLoading(false);
            } else {
              setLoading(false);
              setError(true);
              setErrorMessage(data.message);
            }
          } else {
            setLoading(false);
            setError(true);
            setErrorMessage(res.data.message);
          }
        })
        .catch((err) => {
          console.log(err);
          setError(true);
          setLoading(false);
        });
    } else {
      let userId = props.userId;

      //Check the viewer is login or not
      if (Cookies.get("token")) {
        axios
          .get("/login_user_posts?userId=" + userId, {
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + Cookies.get("token"),
            },
          })
          .then((res) => {
            if (res.status === 200) {
              let data = res.data;
              if (data.status === 200) {
                setPosts(data.posts);
                setLoading(false);
              } else {
                setLoading(false);
                setError(true);
                setErrorMessage(data.message);
              }
            } else {
              let data = res.data;
              if (data.status === 403) {
                setLoading(false);
                setError(true);
                setErrorMessage(data.message);
              } else {
                setError(true);
                setErrorMessage("Something went wrong");
                setLoading(false);
              }
            }
          })
          .catch((err) => {
            console.log(err);
            setLoading(false);
            setError(true);
          });
      } else {
        axios
          .get("/otheruser_posts?userId=" + userId, {
            headers: {
              "Content-Type": "application/json",
            },
          })
          .then((res) => {
            if (res.status === 200) {
              let data = res.data;
              if (data.status === 200) {
                setPosts(data.posts);
                setLoading(false);
              } else {
                let data = res.data;
                if (data.status === 403) {
                  setError(true);
                  setErrorMessage(data.message);
                  setLoading(false);
                } else {
                  setError(true);
                  setErrorMessage("Something went wrong");
                  setLoading(false);
                }
              }
            }
          })
          .catch((err) => {
            console.log(err);
            setLoading(false);
            setError(true);
          });
      }
    }

    return () => {};
  }, [calledFrom]);
  if (error) {
    return (
      <div
        style={{
          color: "white",
          display: "flex",
          justifyContent: "center",
          width: "50%",
          margin: "50px auto",
        }}
      >
        {errorMessage}
      </div>
    );
  }

  if (loading) {
    return <div className="loading-posts">Loading...</div>;
  }

  return (
    <div className="dashboard-post-main-container">
      <section className="dashboard-post-blank-section"></section>
      <section className="dashboard-post-main-data-section">
        {posts.length == 0 ? (
          <div style={{ color: "white" }}>No posts</div>
        ) : null}
        {posts &&
          Array.from(posts).map((post, index) => {
            return <DashboardPostItem key={index} post={post} />;
          })}
      </section>
      <section className="dashboard-post-blank-section"></section>
    </div>
  );
}

export default DashboardPosts;
