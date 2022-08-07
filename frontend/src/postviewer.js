import React, { useEffect, useState } from "react";
import "./css/postviewer.css";
import axios from "axios";
import HOST_URL from "./proxy";
import FollowAndFollowing from "./component/follow-following";
import PostFooter from "./component/postFooter";
import Cookies from "js-cookie";

import helper from "./helper";
import { PopupViewPost } from "./component/pop-up-message";
import PopupMenuPost from "./post-popup";

import { ReactComponent as BackButton } from "./images/back.svg";
import { ReactComponent as NextButton } from "./images/next.svg";

function ButtonSliderArrow(props) {
  let className = props.className;
  let handler = props.handler;

  return (
    <>
      <button onClick={handler} className={"arrow-button"}>
        {className === "slider-arrow-left" ? <BackButton /> : <NextButton />}
      </button>
    </>
  );
}

function PostViewerSlider(props) {
  let post = props.post;
  let len = post && post[0].length;
  let [slideIndex, setSlideIndex] = React.useState(0);

  const nextSlide = () => {
    if (slideIndex === len - 1) {
      setSlideIndex(0);
    } else {
      setSlideIndex(slideIndex + 1);
    }
  };
  const prevSlide = () => {
    if (slideIndex === 0) {
      setSlideIndex(len - 1);
    } else {
      setSlideIndex(slideIndex - 1);
    }
  };
  return (
    <>
      <div className="post-viewer-slider">
        {len > 1 ? (
          <div className="slider-arrow-container">
            {slideIndex === 0 ? (
              <div></div>
            ) : (
              <ButtonSliderArrow
                className="slider-arrow-left"
                handler={prevSlide}
              />
            )}
            {slideIndex === len - 1 ? (
              <div></div>
            ) : (
              <ButtonSliderArrow
                className="slider-arrow-right"
                handler={nextSlide}
              />
            )}
          </div>
        ) : null}
        {post &&
          Array.from(post[0]).map((item, index) => {
            return (
              <PostViewerSliderItem
                className={
                  slideIndex === index
                    ? "post-viewer-activeSlider"
                    : "post-viewer-disableSlider"
                }
                post={item}
                key={index}
              />
            );
          })}
      </div>
    </>
  );
}
function PostViewerSliderItem(props) {
  let item = props.post;
  let mimetype = item && item.mimetype;

  return (
    <>
      {mimetype.includes("image") ? (
        <img
          className={props.className}
          draggable={false}
          src={HOST_URL + "/" + item.url}
          alt="postimg"
        />
      ) : null}
      {mimetype.includes("video") ? (
        <video
          className={props.className}
          draggable={false}
          src={HOST_URL + "/" + item.url}
          controls
        />
      ) : null}
    </>
  );
}

function RightSideHeader(params) {
  let post = params.post;
  let userId = post && post[0][0].userId;
  let [user, userInfo] = React.useState(null);
  let [isError, setIsError] = React.useState(false);
  let [errorMessage, setErrorMessage] = React.useState("");
  let [isLoading, setIsLoading] = React.useState(true);
  let [isPopupView, setIsPopupView] = React.useState(false);

  useEffect(() => {
    if (userId === null) {
      return;
    }
    axios
      .get(HOST_URL + "/get_user?userId=" + userId, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        if (res.status === 200) {
          userInfo({
            userId: res.data.userId,
            username: res.data.username,
            profile: res.data.profile,
            incFollower: () => {},
            decFollower: () => {},
          });
          setIsLoading(false);
        }
      })
      .catch((err) => {
        setIsError(true);
        setErrorMessage(err.message);
      });
  }, [userId]);

  if (isLoading) {
    return <></>;
  }
  let linkStyle = {
    textDecoration: "none",
  };

  return (
    <>
      <div className={"righsideheader-main-container"}>
        <div className={"righsideheader-left-side"}>
          <a href={"/" + user.username}>
            {" "}
            <img
              className={"righsideheader-left-side-img"}
              draggable={false}
              src={HOST_URL + "/" + user.profile}
              alt="propic"
            />
          </a>
          <div className={"righsideheader-left-side-name"}>
            <a href={"/" + user.username} style={linkStyle}>
              {user.username}
            </a>
          </div>
          <div className={"rightsideheader-follow-following"}>
            <FollowAndFollowing
              user={{
                account_visibility: user.account_visibility,
                userId: user.userId,
              }}
              calledFrom={"callFromPostView"}
            />
          </div>
        </div>
      </div>
    </>
  );
}

function handleCaption(caption = "") {
  let caption_array = caption;
  let patternForTags = /#[a-zA-Z0-9]+/g;
  let tags = caption.match(patternForTags);

  for (let tag in tags) {
    let a =
      "<a href='/explore/tags/" +
      tags[tag].replace(/#/g, "") +
      "'/''>" +
      tags[tag] +
      "</a>";
    let pattern = new RegExp(tags[tag], "g");
    caption_array = caption_array.replaceAll(pattern, a);
  }
  return caption_array;
}
function CommentItem(params) {
  let comment = params.comment;
  let [objcomment, setObjComment] = React.useState([]);
  useEffect(() => {
    setObjComment(comment);
  }, [comment]);
  let currentTimestamp = new Date().getTime();
  let diff = currentTimestamp - comment.timestamp;
  let time = helper.getCustomTimeForComment(diff);
  return (
    <>
      <div className="comment-item">
        <div className="comment-item-left">
          <div className="comment-item-left-img">
            {" "}
            <a href={"/" + objcomment.username}>
              <img
                draggable={false}
                src={HOST_URL + "/" + objcomment.profile}
                alt="propic"
              />
            </a>
          </div>
          <p>
            <a
              href={"/" + objcomment.username}
              style={{ textDecoration: "none", color: "#ffffff" }}
            >
              {objcomment.username}
            </a>
          </p>
        </div>
        <div className="comment-item-right">
          <div
            dangerouslySetInnerHTML={{
              __html: handleCaption(objcomment.comment_content),
            }}
          ></div>
        </div>
      </div>
      <div className="comment-item-next-row">
        <div className="comment-item-next-row-time">{time}</div>
        {/* <div className="comment-item-next-row-replay">Replay</div> */}
      </div>
    </>
  );
}
function RightSideBody(params) {
  let post = params.post;
  let [currentPost, setCurrentPost] = useState([]);
  let [caption, setCaption] = useState("");
  let [comments, setComments] = useState([]);
  let [time, setTime] = useState(0);

  useEffect(() => {
    if (post !== null) {
      setCurrentPost(post[0][0]);
    }
    return () => {};
  }, [post]);

  const getAllPosts = () => {
    axios
      .get(HOST_URL + "/get_comments?postId=" + currentPost.postId, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + Cookies.get("token"),
        },
      })
      .then((res) => {
        setComments(res.data.comments);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    let handleInterval = null;
    if (currentPost !== null) {
      let c = handleCaption(currentPost.caption);
      setCaption(c);
      setCaption(c);
      handleInterval = setInterval(() => {
        getAllPosts();
      }, 1000);
    }
    return () => {
      if (handleInterval != null) clearInterval(handleInterval);
    };
  }, [currentPost]);

  if (currentPost === null) {
    return <></>;
  }
  if (post === null) {
    return <></>;
  }

  return (
    <>
      <div className="rightsidebody-main-container">
        <div className="rightsidebody-caption">
          <div dangerouslySetInnerHTML={{ __html: caption }} />
        </div>
        <div className="rightsidebody-comments">
          {comments &&
            Array.from(comments).map((item, index) => {
              return <CommentItem comment={item} key={index} />;
            })}
        </div>
      </div>
    </>
  );
}
function RightSideFooter(params) {
  let post = params.post;
  if (post === null) {
    return <></>;
  }
  return (
    <div className="rightsidefooter-main-container">
      <PostFooter post={post[0]} calledFrom="postviewer" />
    </div>
  );
}

function PostViewer(props) {
  let url = props.match.params.url;
  let [data, setData] = React.useState(null);
  let [isLoading, setIsLoading] = React.useState(true);
  let [isError, setIsError] = React.useState(false);
  let [errorMessage, setErrorMessage] = React.useState("");

  useEffect(() => {
    axios
      .get(HOST_URL + "/p?postUrl=" + url, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        if (res.status === 200) {
          if (res.data.status === 200) {
            if (res.data.post.length > 0) {
              setData(res.data.post);
              setIsLoading(false);
            } else {
              setIsError(true);
              setErrorMessage("No post found");
            }
          } else {
            setIsError(true);
            setErrorMessage(res.data.message);
          }
        } else if (res.status === 403) {
          setErrorMessage(res.data.message);
          setIsError(true);
        }
      })
      .catch((err) => {
        setErrorMessage(err.message);
        setIsError(true);
      });
  }, [url]);

  useEffect(() => {
    setTimeout(() => {
      if (Cookies.get("token") !== undefined) {
        axios.post(
          HOST_URL + "/postviewer",
          {
            postUrl: url,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + Cookies.get("token"),
            },
          }
        );
      } else {
        axios.post(
          HOST_URL + "/postviewer_unknown",
          {
            postUrl: url,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
    }, 7000);
  }, []);

  if (isError) {
    return (
      <div className="post-viewer-error">
        <h1>{errorMessage}</h1>
      </div>
    );
  }
  return (
    <>
      <div className="main-container-postviewer">
        <div className="left-side-postviewer"></div>
        <div className="center-post-viewer">
          <div className="post-view-container">
            <div className="left-side-post-view-container">
              <PostViewerSlider post={data} />
            </div>
            <div className="right-side-post-view-container">
              <RightSideHeader post={data} />
              <RightSideBody post={data} />
              <RightSideFooter post={data} />
            </div>
          </div>
        </div>
        <div className="right-side-postviewer"></div>
      </div>
    </>
  );
}

export default PostViewer;
