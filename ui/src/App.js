import MainScreen from "./components/MainScreen/MainScreen.component";
import firepadRef, { db, userName } from "./server/firebase";
import "./App.css";
import { useEffect } from "react";
import {
  setMainStream,
  addParticipant,
  setUser,
  removeParticipant,
  updateParticipant,
} from "./store/actioncreator";
import { connect } from "react-redux";

function App(props) {

  const getUserStream = async () => {
    try {
      const localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true, // Попробуйте запросить видео
      });
  
      return localStream;
    } catch (error) {
      // Обработка ошибки{
        console.log('Доступ к камере отклонен или камера не обнаружена.');
        // Здесь вы можете предложить альтернативные варианты или просто не запрашивать видеопоток
        return null; // Возвращаем null, чтобы показать, что поток не доступен
    }
  };

  useEffect(async () => {
    const stream = await getUserStream();
    if (stream) {
      // Если поток доступен, устанавливаем его и отправляем данные о пользователе
      props.setMainStream(stream);
  
      connectedRef.on("value", (snap) => {
        if (snap.val()) {
          const defaultPreference = {
            audio: true,
            video: false,
            screen: false,
          };
          const userStatusRef = participantRef.push({
            userName,
            preferences: defaultPreference,
          });
          props.setUser({
            [userStatusRef.key]: { name: userName, ...defaultPreference },
          });
          userStatusRef.onDisconnect().remove();
        }
      });
    } else {
      // Если поток не доступен, предложим альтернативу без видео
      const alternativeStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      props.setMainStream(alternativeStream);
  
      // Можно также предложить пользователю сообщение о том, что камера недоступна и будет использоваться только аудио
      console.log('Камера недоступна или не обнаружена. Будет использован только аудиопоток.');
  
      connectedRef.on("value", (snap) => {
        if (snap.val()) {
          const defaultPreference = {
            audio: true,
            video: false,
            screen: false,
          };
          const userStatusRef = participantRef.push({
            userName,
            preferences: defaultPreference,
          });
          props.setUser({
            [userStatusRef.key]: { name: userName, ...defaultPreference },
          });
          userStatusRef.onDisconnect().remove();
        }
      });
    }
  }, []);  

  const connectedRef = db.database().ref(".info/connected");
  const participantRef = firepadRef.child("participants");

  const isUserSet = !!props.user;
  const isStreamSet = !!props.stream;

  useEffect(() => {
    if (isStreamSet && isUserSet) {
      participantRef.on("child_added", (snap) => {
        const preferenceUpdateEvent = participantRef
          .child(snap.key)
          .child("preferences");
        preferenceUpdateEvent.on("child_changed", (preferenceSnap) => {
          props.updateParticipant({
            [snap.key]: {
              [preferenceSnap.key]: preferenceSnap.val(),
            },
          });
        });
        const { userName: name, preferences = {} } = snap.val();
        props.addParticipant({
          [snap.key]: {
            name,
            ...preferences,
          },
        });
      });
      participantRef.on("child_removed", (snap) => {
        props.removeParticipant(snap.key);
      });
    }
  }, [isStreamSet, isUserSet]);

  return (
    <div className="App">
      <MainScreen />
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    stream: state.mainStream,
    user: state.currentUser,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setMainStream: (stream) => dispatch(setMainStream(stream)),
    addParticipant: (user) => dispatch(addParticipant(user)),
    setUser: (user) => dispatch(setUser(user)),
    removeParticipant: (userId) => dispatch(removeParticipant(userId)),
    updateParticipant: (user) => dispatch(updateParticipant(user)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
