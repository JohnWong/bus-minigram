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
    wx.showLoading();
    var self = this;
    wx.request({
      url: "https://publictransit.dtdream.com/v1/bus/getBusPositionByRouteId?userLng=" + app.longitude + "&userLat=" + app.latitude + "&routeId=" + this.routeId,
      success: function (res) {
        if (res.data.result != 0) {
          wx.showToast({
            title: res.data.message
          })
          return;
        }
        var data = res.data.items[0];
        var oneroute = data.routes[0];
        self.oppositeId = oneroute.route.oppositeId;
        wx.setNavigationBarTitle({
          title: data.routeName,
        })
        self.setData({
          stopId: self.stopId,
          routeName: data.routeName,
          origin: oneroute.route.origin,
          terminal: oneroute.route.terminal,
          firstBus: util.formatBusTime(oneroute.route.firstBus),
          lastBus: util.formatBusTime(oneroute.route.lastBus),
          distance: oneroute.route.distance,
          airPrice: oneroute.route.airPrice
        })

        var stopMap = {};
        for (var i in oneroute.stops) {
          var stop = oneroute.stops[i].routeStop;
          stopMap[stop.stopId] = stop;
        }
        self.stopMap = stopMap;

        if (!self.amapId && self.stopId) {
          for (var i in oneroute.stops) {
            var stop = oneroute.stops[i].routeStop;
            if (stop.stopId == self.stopId) {
              self.amapId = stop.amapId;
              self.stopName = stop.stopName;
              break;
            }
          }
        }
        if (!self.stopId && self.amapId) {
          for (var i in oneroute.stops) {
            var stop = oneroute.stops[i].routeStop;
            if (stop.amapId == self.amapId) {
              self.stopId = "" + stop.stopId;
              self.stopName = stop.stopName;
              break;
            }
          }
        }
        if (!self.stopId && self.stopName) {
          for (var i in oneroute.stops) {
            var stop = oneroute.stops[i].routeStop;
            if (stop.stopName == self.stopName) {
              self.stopId = "" + stop.stopId;
              self.amapId = stop.amapId;
              break;
            }
          }
        }
        if (!self.stopId) {
          var routeStop = oneroute.stops[0].routeStop;
          self.stopId = routeStop.stopId;
          self.amapId = routeStop.amapId;
          self.stopName = routeStop.stopName;
        }
        self.loadBusData();
      }
    });
  },

  loadBusData: function () {
    wx.showLoading();
    var self = this;
    wx.request({
      url: "https://publictransit.dtdream.com/v1/bus/getNextBusByRouteStopId?userLng=" + app.longitude + "&userLat=" + app.latitude + "&routeId=" + this.routeId + "&stopId=" + this.stopId,
      success: function (res) {
        wx.hideLoading();
        if (res.data.result != 0) {
          wx.showToast({
            title: res.data.message
          })
          return;
        }

        var data = res.data.item;

        var stops = [];
        var buses = [];
        var shouldStop = false;
        var userIndex = 0;
        for (var i = 0; i < data.stops.length; i++) {
          var item = data.stops[i];
          var userStop = item.stopId == self.stopId;
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
            buses.push({
              isArrive: bus.isArrive,
              targetStopCount: 1,
              targetDistance: bus.distance
            })
          }
          var fullStop = self.stopMap[item.stopId];
          stops.push({
            stopName: item.stopName,
            stopId: item.stopId,
            userStop: userStop,
            metroTrans: fullStop.metroTrans,
            amapId: fullStop.amapId,
            bus: bus
          })
        }

        var buses = [];
        for (var i in data.nextBuses.buses) {
          var bus = data.nextBuses.buses[i];
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
    this.stopId = e.currentTarget.dataset.stop;
    var stop = this.stopMap[this.stopId];
    this.amapId = e.currentTarget.dataset.amapId;
    this.stopName = e.currentTarget.dataset.stopName;
    this.loadBusData();
  },

  changeDirection: function () {
    if (!this.oppositeId) {
      return;
    }
    this.routeId = this.oppositeId;
    this.stopId = undefined;
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