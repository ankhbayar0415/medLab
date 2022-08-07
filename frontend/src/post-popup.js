import axios from "axios";
import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import {
  ConfirmationToReportPost,
  ConfirmationRemoveFollowing,
  ConfirmationToDeletePost,
} from "./component/follow-following";
import Toast from "./component/toast";
import HOST_URL from "./proxy";

function PopupMenuPost(props) {
  let post = props.post;
  let [user, setUser] = React.useState({});
  let close = props.close;
  let message = props.message;
  let [isFollowing, setIsFollowing] = React.useState(false);
  let [isClickedUnFollow, setIsClickedUnFollow] = React.useState(false);
  let [isClickedDelete, setIsClickedDelete] = useState(false);
  let [isClickedReport, setIsClickedReport] = useState(false);
  let [userId, setUserId] = React.useState(0);
  let [isMounted, setIsMounted] = React.useState(true);

  useEffect(() => {
    if (isMounted)
      axios
        .get(HOST_URL + "/is_following?userId=" + post[0].userId, {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + Cookies.get("token"),
          },
        })
        .then((res) => {
          if (res.status === 200) {
            let data = res.data;
            if (data.status === 200) {
              setUserId(data.currentUserId);
              setIsFollowing(data.result);
            }
          } else {
          }
        })
        .catch((err) => {
          console.log(err);
        });
    return () => {
      setIsMounted(false);
    };
  }, [post]);
  useEffect(() => {
    if (isMounted)
      axios
        .get(HOST_URL + "/get_user?userId=" + post[0].userId)
        .then((res) => {
          if (res.status == 200) {
            setUser(res.data);
          }
        })
        .catch((err) => {
          //(err);
        });
    return () => {
      setIsMounted(false);
    };
  }, [post]);

  const goToPost = () => {
    window.location.href = post[0].postUrl;
  };

  const unfollow = () => {
    setIsClickedUnFollow(true);
  };
  const closeView = () => {
    setIsClickedUnFollow(false);
    setIsClickedDelete(false);
    setIsClickedReport(false);
    close();
  };
  const deletePost = () => {
    setIsClickedDelete(true);
  };
  const addReport = () => {
    setIsClickedReport(true);
  };

  return (
    <>
      {isClickedUnFollow ? (
        <ConfirmationRemoveFollowing user={user} close={closeView} />
      ) : null}
      {isClickedDelete ? (
        <ConfirmationToDeletePost
          post={post}
          close={closeView}
          message={message}
        />
      ) : null}
      {isClickedReport ? (
        <ConfirmationToReportPost user={user} close={closeView} />
      ) : null}

      <div className="popup-menupost-main-container">
        <div className="popup-menupost-container">
          <ul>
            {userId !== post[0].userId ? (
              <li className="post-report" onClick={addReport}>
                Report
              </li>
            ) : null}
            {isFollowing ? (
              <li className="post-unfollow-user" onClick={unfollow}>
                Unfollow
              </li>
            ) : userId === post[0].userId ? null : null}
            {userId === post[0].userId ? (
              <li className="post-delete-post" onClick={deletePost}>
                Delete
              </li>
            ) : null}
            <li onClick={goToPost} style={{ color: "#ffffff" }}>
              Go to post
            </li>
            <li onClick={close} style={{ color: "#ffffff" }}>
              Cancel
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}

export default PopupMenuPost;
