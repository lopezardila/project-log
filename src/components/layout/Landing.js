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
        let executionTimes = {};
        let callTimes = {};
        snapshot.forEach((childSnapshot) => {
          const childKey = childSnapshot.key;
          const childData = childSnapshot.val();
          console.log(childData);
          if (childData.country) {
            if (callTimes[childData.ip]) {
              callTimes[childData.ip]++;
              childData.exeCnt = callTimes[childData.ip];
            } else {
              callTimes[childData.ip] = 1;
              childData.exeCnt = 1;
            }
          }
          if (childData.os) {
            if (executionTimes[childData.ip]) {
              executionTimes[childData.ip]++;
              childData.exeCnt = executionTimes[childData.ip];
            } else {
              executionTimes[childData.ip] = 1;
              childData.exeCnt = 1;
            }
          }
          tmp.push({ ...childData });
          // ...
        });
        setData(tmp);
        if (tmp[tmp.length - 1].country) {
          console.log("dasf");
          new Notification(tmp[tmp.length - 1].id, {
            body:
              tmp[tmp.length - 1].country +
              "\n" +
              tmp[tmp.length - 1].city +
              "\n" +
              tmp[tmp.length - 1].ip,
          });
        }
        setTimeout(function () {
          document
            .getElementById("upload_log")
            .scrollTo({ top: document.getElementById("landing").scrollHeight });
          document
            .getElementById("execute_log")
            .scrollTo({ top: document.getElementById("landing").scrollHeight });
        }, 100);
      },
      {
        // onlyOnce: true,
      }
    );
  }, []);
  return (
    <section
      className="landing"
      id="landing"
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
      }}
    >
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "flex-start",
          height: "100%",
          overflow: "auto",
        }}
        id="execute_log"
      >
        {_.map(data, (item) => {
          return item.country ? (
            <div style={{ marginTop: "20px" }}>
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
                <span style={{ color: "#00ff25", fontSize: "1.4rem" }}>
                  {"===========>"} {item.exeCnt}
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
                <span>CNT: </span>
                <span style={{ color: "yellow", fontSize: "1.2rem" }}>
                  {item.exeCnt}
                </span>
              </div>
              <div>
                --------------------------------------------------------------------------------------------------------
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "flex-start",
          height: "100%",
          overflow: "auto",
        }}
        id="upload_log"
      >
        {_.map(
          data,
          (item) =>
            item.message && (
              <div>
                <div>
                  <span style={{ color: "#fba2f7" }}>{item.ip} Message:</span>
                  {item.message} ----------------------------- {item._date}{" "}
                  {item._time}
                </div>
              </div>
            )
        )}
      </div>
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
