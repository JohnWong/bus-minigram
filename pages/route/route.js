// pages/route/route.js
const app = getApp()
const util = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.stopId = options.stopId;
    this.routeId = options.routeId;
    this.loadData();
  },

  loadData: function () {
    var self = this;
    wx.request({
      url: "https://publictransit.dtdream.com/v1/bus/getBusPositionByRouteId?userLng=" + app.longitude + "&userLat=" + app.latitude + "&routeId=" + this.routeId + "&stopId=" + this.stopId,
      success: function (res) {
        var data = res.data.items[0];
        var oneroute = data.routes[0];
        wx.setNavigationBarTitle({
          title: data.routeName,
        })

        var stops = [];
        var userIndex = 0;
        for (var i = 0; i < oneroute.stops.length; i++) {
          var item = oneroute.stops[i];
          var userStop = item.routeStop.stopId == self.stopId;
          if (userStop) {
            userIndex = i;
          }
          var bus = {}
          for (var j in item.buses) {
            var busItem = item.buses[j];
            if (busItem.isArrive) {
              bus.arrive = true;
            } else {
              bus.nextBus = true;
            }
          }
          stops.push({
            stopName: item.routeStop.stopName,
            stopId: item.routeStop.stopId,
            userStop: userStop,
            metroTrans: item.routeStop.metroTrans,
            bus: bus
          })
        }

        var buses = [];
        for (var i in oneroute.nextBuses.buses) {
          var bus = oneroute.nextBuses.buses[i];
          buses.push({
            isArrive: bus.isArrive,
            targetStopCount: bus.targetStopCount,
            targetDistance: util.formatDistance(bus.targetDistance),
            nextStation: bus.nextStation
          })
        }

        let itemWidth = 56;
        let windowWidth = wx.getSystemInfoSync().windowWidth;
        var stopScroll = (userIndex + 0.5) * itemWidth - windowWidth / 2;
        stopScroll = Math.max(stopScroll, 0)
        stopScroll = Math.min(stopScroll, stops.length * itemWidth - windowWidth);

        self.setData({
          stopId: self.stopId,
          stopScroll: stopScroll,
          buses: buses,
          routeName: data.routeName,
          origin: oneroute.route.origin,
          terminal: oneroute.route.terminal,
          firstBus: util.formatBusTime(oneroute.route.firstBus),
          lastBus: util.formatBusTime(oneroute.route.lastBus),
          distance: oneroute.route.distance,
          airPrice: oneroute.route.airPrice,
          stops: stops
        })
      },
      fail: function () {

      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  changeStop: function (e) {
    var stopId = e.currentTarget.dataset.stop;
    this.stopId = stopId;
    this.loadData();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})