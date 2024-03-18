import firebase from "firebase";

var firebaseConfig = {
  apiKey: "AIzaSyAjhHdSgrsJ4ofpJbkbFnFBy_bgR9aeuyE", // Add API Key
  databaseURL: "https://studysample-a28bc-default-rtdb.firebaseio.com/", // Add databaseURL
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export const db = firebase;

var firepadRef = firebase.database().ref();

// export const userName = prompt("What's your name?");
export const userName = localStorage.getItem("nickname") || "DefaultName";
console.log(
  'localStorage.getItem("nickname")',
  localStorage.getItem("nickname")
);
const urlparams = new URLSearchParams(window.location.search);
console.log("urlparams", urlparams, window.location.search);
const roomId = urlparams.get("id");
console.log("roomId", roomId);
localStorage.setItem("RoomID", roomId);
if (roomId) {
  firepadRef = firepadRef.child(roomId);
} else {
  const pathname = window.location.pathname;
  if (pathname.includes("/meeting/")) {
    firepadRef = firepadRef.push();
    window.history.replaceState(null, "Meet", "?id=" + firepadRef.key);
  }
}

export default firepadRef;
