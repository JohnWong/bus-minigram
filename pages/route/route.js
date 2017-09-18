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
        var buses = oneroute.nextBuses.buses;
        var busMap = {};
        for (var i in buses) {
          var bus = buses[i];
          var nextNo = bus.nextSeqNo;
          if (!busMap[nextNo]) {
            busMap[nextNo] = {}
          }
          if (bus.isArrive) {
            busMap[nextNo].arrive = true
          } else {
            busMap[nextNo].nextBus = true
          }
        }
        var stops = [];
        for (var i in oneroute.stops) {
          var item = oneroute.stops[i];
          stops.push({
            stopName: item.routeStop.stopName,
            stopId: item.routeStop.stopId,
            userStop: item.routeStop.stopId == self.stopId,
            metroTrans: item.routeStop.metroTrans,
            bus: busMap[item.routeStop.seqNo]
          })
        }

        self.setData({
          stopId: self.stopId,
          item: {
            routeName: data.routeName,
            origin: oneroute.route.origin,
            terminal: oneroute.route.terminal,
            firstBus: util.formatBusTime(oneroute.route.firstBus),
            lastBus: util.formatBusTime(oneroute.route.lastBus),
            distance: oneroute.route.distance,
            airPrice: oneroute.route.airPrice
          },
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