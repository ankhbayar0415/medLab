import axios from "axios";
import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import HOST_URL from "../proxy";
import FollowAndFollowing from "./follow-following";

import { ReactComponent as BackButton } from "../images/back.svg";
import { ReactComponent as NextButton } from "../images/next.svg";

function SuggestionItem(props) {
  let suggestion = props.suggestion;
  let [user, setUser] = useState({});
  let followers = props.followers;

  useEffect(() => {
    setUser({
      userId: suggestion.userId,
      username: suggestion.username,
      profile: suggestion.profile,
      account_visibility: suggestion.account_visibility,
      incFollower: () => {},
      decFollower: () => {},
    });

    return () => {};
  }, [suggestion]);

  let style = {
    linkStyle: {
      color: "#000",
      textDecoration: "none",
    },
  };

  return (
    <>
      <div className="suggestion-item-user">
        <a href={"/" + user.username} style={style.linkStyle}>
          {" "}
          <div className="suggestion-item-user-image">
            <img src={HOST_URL + "/" + user.profile} key={user.username} />
          </div>
        </a>
        <div className="suggestion-item-user-info">
          <div className="suggestion-item-user-name">
            <a href={"/" + user.username} style={style.linkStyle}>
              {user.username}
            </a>
          </div>
          <FollowAndFollowing user={user} followers={followers} />
        </div>
      </div>
    </>
  );
}

function ScrollButton(props) {
  let direction = props.direction;
  let handler = props.handler;
  return (
    <>
      {direction === "next" ? (
        <NextButton
          id={direction}
          onClick={handler}
          style={{ height: "17px", width: "17px" }}
        />
      ) : (
        <BackButton
          onClick={handler}
          id={direction}
          style={{ height: "17px", width: "17px" }}
        />
      )}
    </>
  );
}
function VerticalSuggestionItem(props) {
  let suggestion = props.suggestion;
  let [user, setUser] = useState({});
  let followers = props.followers;

  useEffect(() => {
    setUser({
      userId: suggestion.userId,
      username: suggestion.username,
      profile: suggestion.profile,
      account_visibility: suggestion.account_visibility,
      incFollower: () => {},
      decFollower: () => {},
    });

    return () => {};
  }, [suggestion]);

  return (
    <>
      <div className="vertical-suggestion-item">
        <div className="vertical-suggestion-item-image">
          <img
            src={HOST_URL + "/" + user.profile}
            style={{ height: "32px", width: "32px", borderRadius: "50%" }}
          />
        </div>
        <div className="vertical-suggestion-item-info">
          <div className="vertical-suggestion-item-name">
            <a
              href={"/" + user.username}
              style={{
                color: "#ffffff",
                textDecoration: "none",
              }}
            >
              {user.username}
            </a>
          </div>
        </div>
        <FollowAndFollowing
          user={user}
          followers={followers}
          calledFrom="callFromPostView"
        />
      </div>
    </>
  );
}

function Suggestion(props) {
  let [leftBtn, setLeftBtn] = useState(false);
  let [rightBtn, setRightBtn] = useState(true);
  let [suggestions, setSuggestions] = useState([]);
  let [followers, setFollowers] = useState([]);
  let type = props.type;

  useEffect(() => {
    axios
      .get("/suggestions", {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + Cookies.get("token"),
        },
      })
      .then((result) => {
        if (result.status === 200) {
          if (result.data.status === 200) {
            setSuggestions(result.data.suggestions);

            setFollowers(result.data.followers);
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });

    return () => {
      setSuggestions([]);
      setFollowers([]);
    };
  }, []);
  const nextHandler = () => {
    document
      .getElementsByClassName("suggestions-container")[0]
      .scrollBy(300, 0);
  };
  const prevHandler = () => {
    document
      .getElementsByClassName("suggestions-container")[0]
      .scrollBy(-300, 0);
  };
  let style = {
    suggestionScrollBarContainer: {
      zIndex: 9,
    },
    linkStyle: {
      color: "#fff",
      textDecoration: "none",
    },
    bStyle: {
      color: "white",
      margin: "7px",
      opacity: 0.5,
    },
  };
  const handleScroll = (e) => {
    var container = document.getElementsByClassName("suggestions-container")[0];
    var reachedWidth = container.scrollLeft;
    var totalWidth = container.scrollWidth;
    var containerWidth = container.offsetWidth;
    var contentWidth = container.scrollWidth;
    var scrollWidth = contentWidth - containerWidth;

    if (reachedWidth === 0) {
      setLeftBtn(false);
    } else {
      setLeftBtn(true);
    }
    if (Math.round(reachedWidth) === scrollWidth) {
      setRightBtn(false);
    } else {
      setRightBtn(true);
    }
  };

  if (type === "scroll-bar") {
    return (
      <>
        <div className="suggestions-main-container">
          <div className="suggestions-scroll-container">
            {leftBtn ? (
              <ScrollButton
                direction="prev"
                handler={prevHandler}
                key={"prev"}
              />
            ) : (
              <div></div>
            )}
            {rightBtn ? (
              <ScrollButton
                direction="next"
                handler={nextHandler}
                key={"next"}
              />
            ) : null}
          </div>
          <div className="suggestions-container-header">
            <b style={style.bStyle}>Suggestions for you</b>
            <NavLink to="/explore/people/" style={style.linkStyle}>
              See all
            </NavLink>
          </div>

          <div className="suggestions-container" onScroll={handleScroll}>
            {suggestions &&
              Array.from(suggestions).map((suggestion, index) => {
                return (
                  <SuggestionItem
                    suggestion={suggestion}
                    followers={followers}
                    key={"suggestion-item" + index}
                  />
                );
              })}
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <div className="vertical-suggestions-main-container">
        <div className="vertical-suggestions-container-header">
          <p style={style.bStyle}>Suggestions for you</p>
          <NavLink to="/explore/people/" style={style.linkStyle}>
            See all
          </NavLink>
        </div>
        <div className="vertical-suggestions-container">
          {suggestions &&
            Array.from(suggestions).map((suggestion, index) => {
              if (index < 5) {
                return (
                  <VerticalSuggestionItem
                    suggestion={suggestion}
                    followers={followers}
                    key={"vertical-suggestion-items" + index}
                  />
                );
              }
              return null;
            })}
        </div>
      </div>
    </>
  );
}

export default Suggestion;
