"use strict";
let startTime = 0; // Переменная для хранения времени начала посещения
// Функция для сохранения времени начала посещения
function saveVisitTime() {
    startTime = new Date().getTime(); // Получаем текущее время в миллисекундах при загрузке страницы
    localStorage.setItem('visitTime', startTime.toString()); // Сохраняем время посещения в локальное хранилище
}
// Функция для отправки значения времени посещения при закрытии сайта
function sendVisitTimeOnClose() {
    window.addEventListener('beforeunload', () => {
        const visitTime = localStorage.getItem('visitTime'); // Получаем сохраненное время посещения
        if (visitTime) {
            const endTime = new Date().getTime(); // Получаем текущее время при закрытии страницы
            const elapsedTime = endTime - startTime; // Вычисляем прошедшее время
            console.log(`Время на сайте: ${elapsedTime} миллисекунд`); // Выводим время в консоль
            // Здесь можно отправить это значение на сервер, используя, например, AJAX или Fetch
            // Например:
            // fetch('ваш_сервер/путь_для_отправки_времени', {
            //   method: 'POST',
            //   body: JSON.stringify({ visitTime }),
            //   headers: {
            //     'Content-Type': 'application/json'
            //   }
            // });
        }
    });
}
// Вызываем функцию сохранения времени посещения при загрузке страницы
saveVisitTime();
// Вызываем функцию отправки времени посещения при закрытии страницы
sendVisitTimeOnClose();
