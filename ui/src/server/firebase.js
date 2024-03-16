import firebase from "firebase";

var firebaseConfig = {
  apiKey: "AIzaSyAjhHdSgrsJ4ofpJbkbFnFBy_bgR9aeuyE", // Add API Key
  databaseURL: "https://studysample-a28bc-default-rtdb.firebaseio.com/", // Add databaseURL
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export const db = firebase;

var firepadRef = firebase.database().ref();

export const userName = prompt("What's your name?");
const urlparams = new URLSearchParams(window.location.search);
const roomId = urlparams.get("id");
localStorage.setItem("RoomID", roomId);
if (roomId) {
  firepadRef = firepadRef.child(roomId);
} else {
  firepadRef = firepadRef.push();
  window.history.replaceState(null, "Meet", "?id=" + firepadRef.key);
}

export default firepadRef;
