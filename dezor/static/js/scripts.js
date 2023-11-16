"use strict";
let startTime = 0;
function saveVisitTime() {
    startTime = Math.floor(new Date().getTime() / 1000); // конвертируем время начала в секунды
    localStorage.setItem('visitTime', startTime.toString());
}
function sendVisitTimePeriodically() {
    setInterval(() => {
        const visitTime = localStorage.getItem('visitTime');
        if (visitTime) {
            const currentTime = Math.floor(new Date().getTime() / 1000); // текущее время в секундах
            const elapsedTime = currentTime - parseInt(visitTime); // вычисляем прошедшее время в секундах
            const requestData = {
                id: localStorage.getItem('userId'),
                data: {
                    visit_duration: elapsedTime.toString()
                }
            };
            const currentDomain = window.location.origin;
            const url = `${currentDomain}/submit_data/`;
            // Отправляем данные на сервер
            fetch(url, {
                method: 'POST',
                body: JSON.stringify(requestData),
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': 'csrftoken'
                }
            })
                .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
                .then(responseData => {
                console.log('Ответ сервера:', responseData);
                saveVisitTime(); // обновляем время после успешной отправки запроса
            })
                .catch(error => {
                console.error('Произошла ошибка:', error);
            });
        }
    }, 10000); // Отправляем данные каждые 10 секунд (в миллисекундах)
}
saveVisitTime();
sendVisitTimePeriodically();
