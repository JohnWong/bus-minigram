// pages/stop/stop.js
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
    wx.setNavigationBarTitle({
      title: options.stopName
    })
    this.stopId = options.stopId
    this.loadData();
  },
  onPullDownRefresh: function () {
    this.loadData();
  },
  loadData: function () {
    var self = this;
    wx.request({
      url: "https://publictransit.dtdream.com/v1/bus/getNextBusByStopId?amapStopId=" + this.stopId,
      success: function (res) {
        var oneitem = res.data.items[0];
        wx.setNavigationBarTitle({
          title: oneitem.stopName
        })
        // TODO 不能onestop
        var onestop = oneitem.stops[0];
        var routes = [];
        for (var i in onestop.routes) {
          var oneroute = onestop.routes[i];
          var onebus = oneroute.buses[0];
          var item = {
            routeName: oneroute.route.routeName,
            nextStation: oneroute.nextStation,
            targetDistance: util.formatDistance(onebus ? onebus.targetDistance : undefined),
            origin: oneroute.route.origin,
            terminal: oneroute.route.terminal,
            firstBus: util.formatBusTime(oneroute.route.firstBus),
            lastBus: util.formatBusTime(oneroute.route.lastBus),
            airPrice: oneroute.route.airPrice,
            routeId: oneroute.route.routeId
          }
          routes.push(item)
        }
        self.setData({
          stopId: self.stopId,
          routes: routes
        })
      },
      fail: function (err) {

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