let startTime: number = 0

function saveVisitTime (): void {
  startTime = Math.floor(new Date().getTime() / 1000)
  localStorage.setItem('visitTime', startTime.toString())
}

function sendVisitTimePeriodically (): void {
  setInterval(() => {
    const visitTime: string | null = localStorage.getItem('visitTime')
    if (visitTime) {
      const currentTime: number = Math.floor(new Date().getTime() / 1000)
      const elapsedTime: number = currentTime - parseInt(visitTime)

      const requestData = {
        id: localStorage.getItem('userId'),
        data: {
          visit_duration: elapsedTime.toString()
        }
      }

      const currentDomain: string = window.location.origin
      const url: string = `${currentDomain}/submit_data/`

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
            throw new Error('Network response was not ok')
          }
          return response.json()
        })
        .then((responseData) => {
          console.log('Ответ сервера:', responseData)
          // Обновляем только visitTime, не перезаписывая startTime
          localStorage.setItem('visitTime', currentTime.toString())
        })
        .catch((error) => {
          console.error('Произошла ошибка:', error)
        })
    }
  }, 10000)
}

saveVisitTime()
sendVisitTimePeriodically()
