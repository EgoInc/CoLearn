const path = require('path');
const express = require('express');
const expressApp = express();
const https = require('https');
const fs = require('fs');
const bodyParser = require('body-parser');

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

io.on('connection', (socket) => {
    const sessionId = socket.handshake.query.sessionId;
    console.log('К нам подключился пользователь!', sessionId);

    if (sessionId) {
        if (sessions[sessionId]) {
            console.log('Сессия существует');
            socket.join(sessionId);
            const taskImg = sessions[sessionId].task || ""; // Получаем изображение задания или пустую строку
            socket.emit('current-task', taskImg);
        } else {
            console.log('Создаем новую сессию');
            sessions[sessionId] = {
                users: [socket.id],
                images: []
            };
            socket.join(sessionId);
            socket.emit('current-task', "");
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

expressApp.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

expressApp.use(bodyParser.json());
expressApp.post('/upload-task-image', (req, res) => {
    console.log("Knock")
    const sessionId = req.body.sessionId;
    const taskImage = req.body.taskImage;

    if (sessionId && taskImage) {
        sessions[sessionId].task = taskImage;
        console.log('Изображение задания получено и сохранено в сессии:');
        res.status(200).send('Изображение задания сохранено успешно.');
    } else {
        res.status(400).send('Отсутствуют обязательные параметры sessionId или taskImage.');
    }
});


httpServer.listen(port, () => {
    console.log('Server running at', port)
});