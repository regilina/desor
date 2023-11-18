"use strict";
let startTime = 0;
function saveVisitTime() {
    startTime = Math.floor(new Date().getTime() / 1000);
    localStorage.setItem('visitTime', startTime.toString());
}
function sendVisitTimeBeforeUnload() {
    window.addEventListener('beforeunload', function (event) {
        const visitTime = localStorage.getItem('visitTime');
        if (visitTime) {
            const currentTime = Math.floor(new Date().getTime() / 1000);
            const elapsedTime = currentTime - parseInt(visitTime);
            const requestData = {
                id: localStorage.getItem('userId'),
                data: {
                    visit_duration: elapsedTime.toString()
                }
            };
            const currentDomain = window.location.origin;
            const url = `${currentDomain}/submit_data/`;
            fetch(url, {
                method: 'POST',
                body: JSON.stringify(requestData),
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': 'csrftoken'
                }
            })
                .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
                .then((responseData) => {
                console.log('Server Response:', responseData);
                // Update visitTime without overwriting startTime
                localStorage.setItem('visitTime', currentTime.toString());
            })
                .catch((error) => {
                console.error('Error occurred:', error);
            });
        }
    });
}
saveVisitTime();
sendVisitTimeBeforeUnload();
