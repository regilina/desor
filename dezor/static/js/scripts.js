"use strict";
let startTime = 0; // Переменная для хранения времени начала посещения
function saveVisitTime() {
    startTime = new Date().getTime();
    localStorage.setItem('visitTime', startTime.toString());
}
function sendVisitTimePeriodically() {
    setInterval(() => {
        const visitTime = localStorage.getItem('visitTime');
        if (visitTime) {
            const currentTime = new Date().getTime();
            const elapsedTime = currentTime - startTime;
            const requestData = {
                id: localStorage.getItem('userId'),
                data: {
                    visit_duration: elapsedTime.toString()
                }
            };
            const currentDomain = window.location.origin;
            const url = `${currentDomain}/submit_data/`;
            // Здесь отправляем данные на сервер
            fetch(url, {
                method: 'POST',
                body: JSON.stringify(requestData),
                headers: {
                    'Content-Type': 'application/json'
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
            })
                .catch(error => {
                console.error('Произошла ошибка:', error);
            });
        }
    }, 10000); // Отправляем данные каждые 10 секунд (в миллисекундах)
}
saveVisitTime();
sendVisitTimePeriodically();
