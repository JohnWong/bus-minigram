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

let historyKey = "history"

function saveHistory(item) {
  let maxCount = 10;
  let newValue = [];
  newValue.push(item);

  var value
  try {
    value = wx.getStorageSync(historyKey)
  } catch (e) {
    // Do something when catch error
  }
  if (value) {
    for (var i in value) {
      var each = value[i];
      if (each.type == "route"
        && item.type == "route"
        && item.routeId == each.routeId) {
        continue;
      }
      if (each.type == "stop"
        && item.type == "stop"
        && item.stopId == each.stopId) {
        continue;
      }
      newValue.push(each);
      if (newValue.length == 0) {
        break;
      }
    }
  }
  wx.setStorageSync(historyKey, newValue);
}

function loadHistory() {
  try {
    var value = wx.getStorageSync(historyKey)
    return value;
  } catch (e) {
    // Do something when catch error
  }
  return null;
}

module.exports = {
  formatTime: formatTime,
  formatDistance: formatDistance,
  formatBusTime: formatBusTime,
  loadHistory: loadHistory,
  saveHistory: saveHistory
}