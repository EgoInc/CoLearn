const path = require('path');
const express = require('express');
const expressApp = express();
const https = require('https');
const fs = require('fs');

const option = {
        key: fs.readFileSync("./13.42.37.29-key.pem"),
        cert: fs.readFileSync("./13.42.37.29.pem")
}

const port = 5000;

const httpsServer = https.createServer(option, expressApp).listen(port, () => {
        console.log("server starts on" + port);
});

const io = require('socket.io')(httpsServer, {
    cors: { origin: true }
});



// Структура данных для хранения информации о сессиях досок
const sessions = {};


expressApp.get("/", (req,res) => {
	res.send("WELCOME TO CoLearning! /n We are happy to see you here. Open https://13.42.37.29:3000 to start CoLearning session")
});

io.on('connection', (socket) => {
    
    // Обработчик подключения к сессии
    const sessionId = socket.handshake.query.sessionId;

    console.log('К нам подключился пользователь!', sessionId);

    if (sessionId) {
        if (sessions[sessionId]) {
            console.log('Сессия существует');
            // Подключаем пользователя к существующей сессии
            sessions[sessionId].users.push(socket.id);
            socket.join(sessionId);
        } else {
            console.log('Создаем новую сессию');
            // Создаем новую сессию
            sessions[sessionId] = {
                users: [socket.id],
                images: []
            };
            socket.join(sessionId);
        }
    } else {
        console.log('Идентификатор сессии не найден');
    }

    // Обработчик отключения
    socket.on('disconnect', () => {
        // Удаляем пользователя из сессии при отключении
        for (const sessionId in sessions) {
            const index = sessions[sessionId].users.indexOf(socket.id);
            if (index !== -1) {
                sessions[sessionId].users.splice(index, 1);
                if (sessions[sessionId].users.length === 0) {
                    delete sessions[sessionId];
                    console.log(`Сессия ${sessionId} завершена`);
                }
                break;
            }
        }
    });
    
    // Обработчик для получения данных изображения от клиента
    socket.on('image-data', (data) => {
        console.log('Получены данные изображения');
        const sessionId = data.sessionId;
        // Проверяем существует ли свойство images в сессии, если нет, инициализируем его
        if (!sessions[sessionId].images) {
            sessions[sessionId].images = [];
        }
        sessions[sessionId].images.push(data.imageData); // сохраняем изображение в соответствующей сессии
        // Отправляем изображение только подключенным клиентам в этой сессии
        socket.to(sessionId).emit('image-data', data.imageData);
    });
});

console.log('server env', process.env.NODE_ENV)
expressApp.use(express.static(path.join(__dirname, '../ui/build')));
expressApp.get('*', function (req, res) {
    console.log('response received');
    res.sendFile(path.join(__dirname, '../ui/build', 'index.html'));
});  










