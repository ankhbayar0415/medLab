import React, { useEffect } from "react";
import HOST_URL from "../proxy";
import "../css/peopleList.css";
import axios from "axios";
import { Link } from "react-router-dom/cjs/react-router-dom.min";
import PostFooter from "./postFooter";
import PopupMenuPost from "../post-popup";
import Toast from "./toast";

import { ReactComponent as CardButton } from "../images/cardButton.svg";
import { ReactComponent as BackButton } from "../images/back.svg";
import { ReactComponent as NextButton } from "../images/next.svg";

function ImageView(props) {
  let post = props.post;
  let className = props.className;

  return (
    <>
      <img
        src={HOST_URL + "/" + post.url}
        alt=""
        draggable={false}
        decoding="auto"
        crossOrigin="anonymous"
        className={className}
        height={"600px"}
        width={"540px"}
        id="image-post-view"
      />
    </>
  );
}
function VideoView(props) {
  let post = props.post;
  return (
    <>
      <video
        className={props.className}
        draggable={false}
        id="video-post-view"
        height={"600px"}
        width={"540px"}
        controls
      >
        <source
          src={HOST_URL + "/" + post.url}
          height={"600px"}
          width={"540px"}
          draggable={false}
          type="video/mp4"
          id="video-post-view"
        />
      </video>
    </>
  );
}

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

function PostHeader(props) {
  let post = props.post;
  let remove = props.remove;
  let [user, setUser] = React.useState({});
  let [isLoading, setIsLoading] = React.useState(true);
  let [isClicked, setIsClicked] = React.useState(false);
  let currentUid = props.currentUserId;
  let pc_userId = post && post[0].userId;
  let [msg, setmsg] = React.useState("");
  let [deletestatus, setStatus] = React.useState(false);
  let [hasMessage, setHasMessage] = React.useState(false);
  // let [smallView, setSmallView] = React.useState(false);
  useEffect(() => {
    axios
      .get(HOST_URL + "/get_user?userId=" + pc_userId)
      .then((res) => {
        if (res.status === 200) {
          setIsLoading(false);
          setUser(res.data);
        }
      })
      .catch((err) => {
        //(err);
      });
    return () => {};
  }, []);

  useEffect(() => {
    if (deletestatus) {
      remove(post);
    }
  }, [deletestatus]);
  if (isLoading) {
    return <></>;
  }

  const handleMoreClick = () => {
    setIsClicked(!isClicked);
  };
  const close = () => {
    setIsClicked(false);
  };
  const message = (status, data) => {
    setStatus(status);
    setmsg(data);
    setHasMessage(true);
  };

  return (
    <>
      {isClicked ? (
        <PopupMenuPost
          post={post}
          currentUid={currentUid}
          close={close}
          message={message}
        />
      ) : null}
      <div className="post-header-left">
        <img
          src={HOST_URL + "/" + user.profile}
          alt=""
          decoding="auto"
          crossOrigin="anonymous"
          draggable={false}
          className="post-header-profile-picture"
        />
        <Link
          to={"/" + user.username}
          className="post-header-username"
          style={{ color: "white", textDecoration: "none" }}
        >
          {user.username}
        </Link>
      </div>
      <div className="post-header-right">
        <CardButton id="post-header-more" onClick={handleMoreClick} />
      </div>
    </>
  );
}

function PostList(props) {
  const post = props.post;
  const [slideIndex, setSlideIndex] = React.useState(0);
  const currentUserId = props.userId;
  const remove = props.remove;
  let len = post && post.length;

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

  if (post === null) {
    return <>Loading...</>;
  }
  return (
    <>
      <div className="insta-post">
        <div className="insta-post-header">
          <PostHeader
            currentUserId={currentUserId}
            post={post}
            remove={remove}
          />
        </div>
        <div className="insta-post-body" height={"600px"} width={"540px"}>
          <div className="post-view">
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
            {len > 1 ? (
              <div className="post-contain">{slideIndex + 1 + "/" + len}</div>
            ) : null}

            {post &&
              Array.from(post).map((p, index) => {
                if (p.mimetype.match(/image/)) {
                  return (
                    <ImageView
                      key={index}
                      height={"600px"}
                      width={"540px"}
                      className={
                        slideIndex === index ? "active-slide" : "slide"
                      }
                      post={p}
                      length={len}
                    />
                  );
                } else if (p.mimetype.match(/video/)) {
                  return (
                    <VideoView
                      height={"600px"}
                      width={"540px"}
                      className={
                        slideIndex === index ? "active-slide" : "slide"
                      }
                      key={index}
                      post={p}
                      length={len}
                    />
                  );
                }
                return <>Something went wrong</>;
              })}
          </div>
        </div>
        <div className="insta-post-footer">
          <PostFooter post={post} currentUserId={currentUserId} />
        </div>
      </div>
    </>
  );
}
export default PostList;
