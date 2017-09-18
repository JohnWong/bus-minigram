const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

module.exports = {
  formatTime: formatTime,
  formatDistance: formatDistance,
  formatBusTime: formatBusTime
}

function formatDistance(dist) {
  if (dist) {
    if (dist > 1000) {
      return Math.round(dist / 100) / 10 + "公里";
    } else {
      return dist + "米";
    }
  } else {
    return "暂无";
  }
}

function formatBusTime(time) {
  if (time.length == 8) {
    return time.substr(0, 5);
  }
  return time;
}