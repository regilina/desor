let startTime: number = 0 // Переменная для хранения времени начала посещения

function saveVisitTime (): void {
  startTime = new Date().getTime()
  localStorage.setItem('visitTime', startTime.toString())
}

function sendVisitTimePeriodically (): void {
  setInterval(() => {
    const visitTime: string | null = localStorage.getItem('visitTime')
    if (visitTime) {
      const currentTime: number = new Date().getTime()
      const elapsedTime: number = currentTime - startTime

      const requestData = {
        id: localStorage.getItem('userId'),
        data: {
          visit_duration: elapsedTime.toString()
        }
      }

      const currentDomain: string = window.location.origin
      const url: string = `${currentDomain}/submit_data/`
      // Здесь отправляем данные на сервер
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
            throw new Error('Network response was not ok')
          }
          return response.json()
        })
        .then(responseData => {
          console.log('Ответ сервера:', responseData)
        })
        .catch(error => {
          console.error('Произошла ошибка:', error)
        })
    }
  }, 10000) // Отправляем данные каждые 10 секунд (в миллисекундах)
}

saveVisitTime()
sendVisitTimePeriodically()
