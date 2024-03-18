import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import "./Canvas.css";

const Canvas = () => {
  const { current: canvasDetails } = useRef({
    color: "green",
    socketUrl: "/",
    mode: "draw",
  });
  const [textMode, setTextMode] = useState(false); // Состояние для отслеживания режима ввода текста
  let sessionId = localStorage.getItem("RoomID");

  const changeColor = (newColor) => {
    canvasDetails.color = newColor;
  };

  useEffect(() => {
    console.log("HERE", sessionId);
    if (process.env.NODE_ENV === "development") {
      canvasDetails.socketUrl = "https://13.42.37.29:5000";
    }
    console.log("socketUrl", canvasDetails.socketUrl);
    canvasDetails.socket = io.connect(canvasDetails.socketUrl, {
      query: {
        sessionId: sessionId,
      },
      // Обработчик подключения
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ["websocket"],
    });

    canvasDetails.socket.on("connect", () => {
      console.log("Connected to server");

      // Обработчик для получения данных изображения от сервера
      canvasDetails.socket.on("image-data", (data) => {
        console.log("Передаю рисуночки");
        const image = new Image();
        const canvas = document.getElementById("canvas");
        const context = canvas.getContext("2d");
        image.src = data;
        image.addEventListener("load", () => {
          context.drawImage(image, 0, 0);
        });
      });
    });
  }, []);

  useEffect(() => {
    const mouseMoveHandler = (e, type) => {
      const event = type === "touch" ? e.touches[0] : e;
      if (canvasDetails.mode === "draw") {
        findxy("move", event);
      }
    };
    const mouseDownHandler = (e, type) => {
      const event = type === "touch" ? e.touches[0] : e;
      if (textMode) {
        const text = prompt("Введите текст:");
        if (text) {
          drawText(event.clientX, event.clientY, text);
        }
      } else {
        if (canvasDetails.mode === "draw") {
          findxy("down", event);
        }
      }
    };

    const mouseUpHandler = (e, type) => {
      const event = type === "touch" ? e.touches[0] : e;
      if (canvasDetails.mode === "draw") {
        findxy("up", event);
      }
    };

    let prevX = 0,
      currX = 0,
      prevY = 0,
      currY = 0,
      flag = false;

    const canvas = document.getElementById("canvas");
    canvas.height = window.innerHeight - 30;
    canvas.width = window.innerWidth / 2;
    const context = canvas.getContext("2d");

    const onSave = () => {
      if (!canvasDetails.waiting) {
        const base64EncodedUrl = canvas.toDataURL("image/png");
        canvasDetails.socket.emit("image-data", {
          sessionId: sessionId,
          imageData: base64EncodedUrl,
        });
        canvasDetails.waiting = true;
        setTimeout(() => {
          canvasDetails.waiting = false;
        }, 100);
      }
    };

    const draw = () => {
      context.beginPath();
      context.moveTo(prevX, prevY);
      context.lineTo(currX, currY);
      context.strokeStyle = canvasDetails.color;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.lineWidth = 2;
      context.stroke();
      context.closePath();
      onSave();
    };

    const drawText = (x, y, text) => {
      context.fillStyle = canvasDetails.color; // Устанавливаем цвет текста
      context.font = "20px Arial"; // Устанавливаем шрифт и размер текста
      context.fillText(text, x, y); // Отрисовываем текст на холсте
    };

    const findxy = (res, e) => {
      if (res === "down") {
        prevX = currX;
        prevY = currY;
        currX = e.clientX - canvas.offsetLeft;
        currY = e.clientY - canvas.offsetTop;
        flag = true;
      }
      if (res === "up" || res === "out") {
        flag = false;
      }
      if (res === "move") {
        if (flag) {
          prevX = currX;
          prevY = currY;
          currX = e.clientX - canvas.offsetLeft;
          currY = e.clientY - canvas.offsetTop;
          draw();
        }
      }
    };

    canvas.addEventListener("mousemove", mouseMoveHandler);
    canvas.addEventListener("mousedown", mouseDownHandler);
    canvas.addEventListener("mouseup", mouseUpHandler);
    canvas.addEventListener("touchmove", (e) => mouseMoveHandler(e, "touch"), {
      passive: true,
    });
    canvas.addEventListener("touchstart", (e) => mouseDownHandler(e, "touch"), {
      passive: true,
    });
    canvas.addEventListener("touchend", (e) => mouseUpHandler(e, "touch"));
    canvas.addEventListener("dblclick", onSave);

    return () => {
      canvas.removeEventListener("mousemove", mouseMoveHandler);
      canvas.removeEventListener("mousedown", mouseDownHandler);
      canvas.removeEventListener("mouseup", mouseUpHandler);
      canvas.removeEventListener("dblclick", onSave);
    };
  }, [textMode]);

  const toggleTextMode = () => {
    const newMode = canvasDetails.mode === "draw" ? "text" : "draw";
    setTextMode(newMode === "text");
    canvasDetails.mode = newMode;
  };

  return (
    <div className="canvas-wrapper">
      <div className="controls">
        <div className="color-picker-wrapper">
          <input
            className="color-picker"
            type="color"
            defaultValue="#00FF00"
            onChange={(e) => changeColor(e.target.value)}
          />
        </div>
        <div className="text-mode-toggle">
          <button onClick={toggleTextMode} className="modeBut">
            {textMode ? "РИСОВАНИЕ" : "ТЕКСТ"}
          </button>
        </div>
      </div>
      <canvas className="canvas" id="canvas"></canvas>
    </div>
  );
};

export default Canvas;
