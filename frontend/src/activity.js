import React, { useEffect } from "react";
import { useState } from "react";
import HOST_URL from "./proxy";

import "./css/activity.css";
import axios from "axios";
import Cookies from "js-cookie";

function NotificationItems(props) {
  let notifi = props.notifi;
  let type = props.notifi.notif_type;
  let [details, setDetails] = useState([]);
  let [detailsTo, setDetailsTo] = useState([]);
  let [message, setMessage] = useState("");
  let [solved, setSolved] = useState(null);
  let [del, setDel] = useState(false);

  useEffect(() => {
    if (type === "like") {
      setMessage("liked your post");
    } else {
      setMessage("reported a user ");
    }
    axios
      .get(HOST_URL + "/get_user?userId=" + notifi.notif_by, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        if (res.status === 200) {
          setDetails(res.data);
          console.log(res.data);
        }
      })
      .catch((err) => {
        console.log(err);
      });
    axios
      .get(HOST_URL + "/get_user?userId=" + notifi.notif_to, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        if (res.status === 200) {
          setDetailsTo(res.data);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [notifi]);

  useEffect(() => {
    if (del) {
      if (Cookies.get("token") === undefined) {
        alert("You must be logged in to delete this post");
        return;
      }
      axios
        .delete(HOST_URL + "/delete/user/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + Cookies.get("token"),
          },
          data: {
            deleteUserId: notifi.notif_to,
          },
        })
        .then((res) => {
          if (res.status === 200) {
            let data = res.data;
            if (data.statusCode === 200) {
              //Success
              setSolved("Deleted");
            } else {
              //Something went's wrong
              setSolved("Error");
            }
          } else {
          }
        })
        .catch((err) => {});
    }

    return () => {};
  }, [del]);

  const deleteUser = () => {
    setDel(true);
  };

  return (
    <>
      <div className="notif-body">
        <div className="entry-description">
          <div className="entry-profile">
            <a href={details.username}>
              <img draggable={false} src={HOST_URL + "/" + details.profile} />
            </a>
          </div>
          <div className="entry-text">
            <a href={details.username}>{details.username}</a> {message}
          </div>
          {solved && <div className="entry-text-solve">{solved}</div>}
        </div>
        <div className="entry-control">
          {type === "report" && (
            <>
              <div className="entry-control-review">
                <a
                  href={HOST_URL + "/" + detailsTo.username}
                  style={{ color: "white" }}
                >
                  Review
                </a>
              </div>
              <div className="entry-control-delete" onClick={deleteUser}>
                Delete user
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function Activity(props) {
  let cUser = props;
  let [notifCount, setNotifCount] = useState(0);
  let [notif, setNotif] = useState([]);
  let [time, setTime] = useState(0);
  let [loading, setLoading] = useState(true);
  let [error, setError] = useState(false);
  let [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    axios
      .get(HOST_URL + "/get_notifications", {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + Cookies.get("token"),
        },
      })
      .then((res) => {
        if (res.status === 200) {
          console.log(res.data.notifications.length);
          console.log(res.data);
          setNotif(res.data.notifications);
          setNotifCount(res.data.notifications.length);
          setLoading(false);
        }
      })
      .catch((err) => {
        setError(true);
        setErrorMessage(err.message);
      });
    return () => {};
  }, [cUser]);

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
    <>
      <div className="notif-main-container">
        <div className="notif-header">
          <div className="notif-header-text">Notifications</div>
          <div className="notif-header-meter">{notifCount}</div>
        </div>
        {notifCount === 0 ? (
          <div
            style={{
              color: "white",
              display: "flex",
              justifyContent: "center",
              padding: "15px 0",
            }}
          >
            No notification
          </div>
        ) : null}
        {notif &&
          Array.from(notif).map((notifi, index) => {
            return <NotificationItems key={index} notifi={notifi} />;
          })}
      </div>
    </>
  );
}

export default Activity;
