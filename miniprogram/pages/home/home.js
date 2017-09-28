//home.js
const util = require('../../utils/util.js')
const app = getApp()

Page({
  data: {

  },
  onLoad: function () {
    this.reloadData();
    // if (app.debug) {
    //   wx.navigateTo({
    //     // url: "/pages/route/route?routeId=732&stopId=41491"
    //     url: "/pages/route/route?routeId=518&stopId=51634"
    //   })
    // }
  },
  reloadData: function () {
    var self = this
    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        // debug
        if (app.debug) {
          latitude = 30.128741;
          longitude = 120.085117;
        }

        app.latitude = latitude;
        app.longitude = longitude;

        wx.request({
          url: "https://publictransit.dtdream.com/v1/bus/findNearbyStop?city=330100&radius=1000&lat=" + latitude + "&lng=" + longitude,
          success: function (res) {
            var stops = [];
            for (var i in res.data.items) {
              var item = res.data.items[i];
              var onestop;
              for (var j in item.stops) {
                if (item.stops[j].stop.amapId != 'INVALID_ID') {
                  onestop = item.stops[j];
                  break;
                }
              }
              var oneroute = onestop.routes[0];
              var onebus = oneroute.buses[0];

              var stop = {
                stopId: onestop.stop.stopId,
                amapId: onestop.stop.amapId,
                stopName: item.stopName,
                userDistance: util.formatDistance(onestop ? onestop.stop.userDistance : undefined),
                routeName: oneroute.route.routeName,
                routeId: oneroute.route.routeId,
                nextStation: oneroute.nextStation,
                targetDistance: util.formatDistance(onebus ? onebus.targetDistance : undefined)
              }
              stops.push(stop)
            }
            self.setData({
              stops: stops
            })
          },
          fail: function () {

          }
        })
        // wx.openLocation({
        //   latitude: latitude,
        //   longitude: longitude,
        //   scale: 28
        // })
      },
      fail: function (res) {
        console.log(res)
      }
    })
  },
  onPullDownRefresh: function () {
    this.reloadData();
  }
})
