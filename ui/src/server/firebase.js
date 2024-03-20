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
  'Загружаем сохраненного пользователя',
  localStorage.getItem("nickname")
);
const urlparams = new URLSearchParams(window.location.search);
const roomId = urlparams.get("id");
sessionStorage.setItem("RoomID", roomId);
if (roomId) {
  firepadRef = firepadRef.child(roomId);
  // Создаем объект для хранения данных комнаты
  const roomData = {
    "image": sessionStorage.getItem("imageData"),
    "localDesk": ""
  }
  sessionStorage.setItem(roomId, JSON.stringify(roomData));
  // sessionStorage.removeItem("imageData")
} else {
  const pathname = window.location.pathname;
  if (pathname.includes("/meeting/")) {
    firepadRef = firepadRef.push();
    // Создаем объект для хранения данных комнаты
    const roomData = {
      "image": sessionStorage.getItem("imageData"),
      "localDesk": ""
    }
    sessionStorage.setItem(firepadRef.key, JSON.stringify(roomData));
    window.history.replaceState(null, "Meet", "?id=" + firepadRef.key);
  }
}

export default firepadRef;
