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
          // tmp.push({
          //   key: childKey,
          //   data: _.map(childData, (value, key) => ({
          //     key,
          //     value: value.value,
          //     date: value.date,
          //   })),
          // });
          // ...
        });
        console.log(tmp);
        setData(tmp);
      },
      {
        onlyOnce: true,
      }
    );
  }, []);
  return (
    <section
      className="landing"
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
      }}
    ></section>
  );
};

Landing.propTypes = {
  isAuthenticated: PropTypes.bool,
};

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
});

export default connect(mapStateToProps)(Landing);
