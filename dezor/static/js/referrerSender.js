"use strict";
// Получение информации о реферере (предыдущей странице)
const referrer = document.referrer;
// Данные для отправки на сервер
const data = {
    referrer: referrer
};
// Опции запроса
const requestOptions = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
};
// URL для отправки данных
const serverURL = 'ваш_сервер/путь_обработчика';
console.log(data);
// Отправка данных на сервер
fetch(serverURL, requestOptions)
    .then(response => {
    // Обработка ответа от сервера
    if (response.ok) {
        return response.json();
    }
    throw new Error('Network response was not ok.');
})
    .then(data => {
    // Обработка данных от сервера
    console.log('Ответ сервера:', data);
    // Предположим, что сервер возвращает id в поле data.id
    const userId = data.id;
    // Здесь вы можете сохранить serverId в нужном вам месте
    // Например, можно сохранить в localStorage
    localStorage.setItem('userId', userId);
    // Или просто использовать его сразу
    // например, присвоить его переменной, доступной в других частях кода
    // myForm.id = serverId;
})
    .catch(error => {
    // Обработка ошибок
    console.error('Произошла ошибка:', error);
});
