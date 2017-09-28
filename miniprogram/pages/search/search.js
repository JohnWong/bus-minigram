// pages/search.js
const util = require('../../utils/util.js')

Page({
  data: {
    focused: true
  },
  onLoad: function () {
    wx.setNavigationBarTitle({
      title: '搜索'
    })
    this.searchFocus();
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