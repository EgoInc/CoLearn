import React, { useState, useContext, useEffect } from "react";
import "./MainPage.css";

const MainPage = (props) => {
  const [showInput, setShowInput] = useState(false);
  const [nickname, setNickname] = useState();
  const [image, setImage] = useState();

  const createMeeting = () => {
    setShowInput(true);
  };

  const handleInputChange = (event) => {
    const newNickname = event.target.value;
    setNickname(newNickname);
  };

  const handleImageChange = (event) => {
    const selectedImage = event.target.files[0];
    setImage(selectedImage);
    saveImageToLocalStorage(selectedImage);
  };

  function saveImageToLocalStorage(imageFile) {
    const reader = new FileReader();

    reader.onload = function (event) {
      const base64String = event.target.result;
      sessionStorage.setItem("imageData", base64String);
    };

    reader.readAsDataURL(imageFile);
  }

  const handleInputKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Отменяем действие по умолчанию (обычно это отправка формы)
      handleOkButtonClick();
    }
  };

  const handleOkButtonClick = () => {
    setShowInput(false);
    localStorage.setItem("nickname", nickname);
    window.location.href = "/meeting/";
  };

  return (
    <div>
      <div className="MainPage_buttonsContainer">
        <button className="MainPage_button">Подключиться к конференции</button>
        <button className="MainPage_button" onClick={createMeeting}>
          Создать конференцию
        </button>
        {showInput && (
          <div className="MainPage_inputsContainer">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="MainPage_inputFile"
            />
            <div className="MainPage_inputContainer">
              <input
                type="text"
                value={nickname}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                placeholder="Введите ник"
                className="MainPage_input"
              />
              <button onClick={handleOkButtonClick}>
                <svg
                  width="15px"
                  height="15px"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M3 14a1 1 0 0 1 1-1h12a3 3 0 0 0 3-3V6a1 1 0 1 1 2 0v4a5 5 0 0 1-5 5H4a1 1 0 0 1-1-1z"
                    fill="#0D0D0D"
                  />
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M3.293 14.707a1 1 0 0 1 0-1.414l4-4a1 1 0 0 1 1.414 1.414L5.414 14l3.293 3.293a1 1 0 1 1-1.414 1.414l-4-4z"
                    fill="#0D0D0D"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainPage;
