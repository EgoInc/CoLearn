import React, { useRef, useEffect, useState } from "react";
import MeetingFooter from "../MeetingFooter/MeetingFooter.component";
import Participants from "../Participants/Participants.component";
import "./MainScreen.css";
import { connect } from "react-redux";
import { setMainStream, updateUser } from "../../store/actioncreator";
import PaintingBoard from "../PaintingBoard/PaintingBoard.component";

const MainScreen = (props) => {
  const [imageData, setImageData] = useState(null);
  useEffect(() => {
    const urlparams = new URLSearchParams(window.location.search);
    const sessionId = urlparams.get("id");
    const roomDataString = sessionStorage.getItem(sessionId);

    // Проверяем, что строка JSON не пустая
    if (roomDataString) {
      // Преобразуем строку JSON обратно в объект JavaScript
      const roomData = JSON.parse(roomDataString);

      // Получаем значение image из объекта roomData
      const image = roomData.image;

      // Делаем что-то с полученным значением image
      setImageData(image);
    } else {
      console.error(`Элемент с ключом ${sessionId} не найден в sessionStorage.`);
    }
  });

  const participantRef = useRef(props.participants);

  const onMicClick = (micEnabled) => {
    if (props.stream) {
      props.stream.getAudioTracks()[0].enabled = micEnabled;
      props.updateUser({ audio: micEnabled });
    }
  };
  const onVideoClick = (videoEnabled) => {
    if (props.stream) {
      props.stream.getVideoTracks()[0].enabled = videoEnabled;
      props.updateUser({ video: videoEnabled });
    }
  };

  useEffect(() => {
    participantRef.current = props.participants;
  }, [props.participants]);

  const updateStream = (stream) => {
    for (let key in participantRef.current) {
      const sender = participantRef.current[key];
      if (sender.currentUser) continue;
      const peerConnection = sender.peerConnection
        .getSenders()
        .find((s) => (s.track ? s.track.kind === "video" : false));
      peerConnection.replaceTrack(stream.getVideoTracks()[0]);
    }
    props.setMainStream(stream);
  };

  const onScreenShareEnd = async () => {
    const localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    localStream.getVideoTracks()[0].enabled = Object.values(
      props.currentUser
    )[0].video;

    updateStream(localStream);

    props.updateUser({ screen: false });
  };

  const onScreenClick = async () => {
    let mediaStream;
    if (navigator.getDisplayMedia) {
      mediaStream = await navigator.getDisplayMedia({ video: true });
    } else if (navigator.mediaDevices.getDisplayMedia) {
      mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
    } else {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { mediaSource: "screen" },
      });
    }

    mediaStream.getVideoTracks()[0].onended = onScreenShareEnd;

    updateStream(mediaStream);

    props.updateUser({ screen: true });
  };
  return (
    <div className="mainScreen-container">
      <div className="mainScreen-wrapper">
        <div className="img-container">
          {imageData && (
            <img
              src={imageData}
              className="img-container_img"
              alt="Изображение"
            />
          )}
        </div>
        <div className="main-screen">
          <Participants />
        </div>

        <div className="footer">
          <MeetingFooter
            onScreenClick={onScreenClick}
            onMicClick={onMicClick}
            onVideoClick={onVideoClick}
          />
        </div>
      </div>
      <div className="wrapper-board">
        <PaintingBoard />
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    stream: state.mainStream,
    participants: state.participants,
    currentUser: state.currentUser,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setMainStream: (stream) => dispatch(setMainStream(stream)),
    updateUser: (user) => dispatch(updateUser(user)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MainScreen);
