//home.js
const util = require('../../utils/util.js')
const app = getApp()

Page({
  data: {
    focused: false,
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
              var onestop = item.stops[0];
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
  },
  searchFocus: function () {
    this.setData({
      focused: true
    })
    this.searchInit();
  },
  tapCancel: function () {
    this.routes = null;
    this.stops = null;
    this.setData({
      focused: false,
      history: null,
      searchText: '',
      searchStops: null,
      searchRoutes: null
    })
  },
  searchConfirm: function (event) {
    var searchText = event.detail.value;
    this.setData({
      searchText: searchText
    })
    this.search(searchText)
  },
  searchInput: function (event) {
    var searchText = event.detail.value;
    this.setData({
      searchText: searchText
    })
    this.search(searchText)
  },
  searchClear: function (event) {
    this.setData({
      focused: true,
      searchText: '',
      searchStops: null,
      searchRoutes: null
    })
    this.searchInit();
  },
  searchInit: function () {
    var history = util.loadHistory();
    this.setData({
      history: history ? history : []
    })
  },
  search: function (word) {
    var self = this;
    let foldCount = 4;
    wx.request({
      url: "https://publictransit.dtdream.com/v1/bus/findRouteByName?city=330100&routeName=" + encodeURIComponent(word),
      success: function (res) {
        if (res.data.result != 0) {
          wx.showToast({
            title: res.data.message
          })
          return;
        }
        var items = res.data.items;
        var routes = [];
        for (var i in items) {
          var item = items[i];
          routes.push(item.routes[0]);
        }
        self.routes = routes;
        self.setData({
          searchRoutes: routes.slice(0, foldCount),
          routeFold: routes.length > foldCount
        })
      }
    })

    wx.request({
      url: "https://publictransit.dtdream.com/v1/bus/findStopByName?city=330100&stopName=" + encodeURIComponent(word),
      success: function (res) {
        if (res.data.result != 0) {
          wx.showToast({
            title: res.data.message
          })
          return;
        }
        var items = res.data.items;
        var stops = [];
        for (var i in items) {
          var item = items[i];
          stops.push(item.stops[0]);
        }
        self.stops = stops;
        self.setData({
          searchStops: stops.slice(0, foldCount),
          stopFold: stops.length > foldCount
        })
      }
    })
  },
  routeMore: function () {
    this.setData({
      searchRoutes: this.routes,
      routeFold: false
    })
  },
  stopMore: function () {
    this.setData({
      searchStops: this.stops,
      stopFold: false
    })
  },
  tapSearchRoute: function (e) {
    var ds = e.currentTarget.dataset;
    util.saveHistory({
      type: "route",
      routeId: ds.routeid,
      routeName: ds.routename
    })
  },
  tapSearchStop: function (e) {
    var ds = e.currentTarget.dataset;
    util.saveHistory({
      type: "stop",
      stopId: ds.stopid,
      stopName: ds.stopname
    })
  }
})
