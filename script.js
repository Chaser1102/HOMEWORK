$(document).ready(function() {

  $(window).load(function() {
    // 淡入进入界面
    $(".se-pre-con").fadeOut("slow");
  });

  //从高德地图提供api从ip信息获取地理信息(因为是通过api 获取经纬度 所以定位城市可能会产生误差)
  $.ajax({
    type: 'GET',
    url: 'https://restapi.amap.com/v3/ip?output=json&key=34f09fa07ef8121f40f0ba669947d891',
    success: coordinates
  });
  
  //解析从api获取的json
  //示例：{"status":"1","info":"OK","infocode":"10000","province":"浙江省","city":"杭州市","adcode":"330800","rectangle":"118.6994648,28.80243177;119.1484666,29.11958668"}
  function coordinates(point) {
    var coords = point.rectangle.split(',');
    //经度
    var lat = parseFloat(coords[1]);
    //纬度
    var lon = parseFloat(coords[0]);
    //城市
    let city = point.city;
    //省份
    let province = point.province;
    let country = "中国";
    console.log(lat + " " + city + " " + province +" " + country);
    //在页面上显示地理信息
    $('.forecast_city').text(city + ', ' + province);
    $('.forecast_country').text(country);

    //调用获取天气信息函数
    let api = 'https://api.forecast.io/forecast/7c693e97458b09a53aa5f7e2cd0af4a0/' + lat + ',' + lon + '?units=si';
    getWeather(api);

  } //end coordinates

  //使用darksky提供的天气api查询天气
  //获取示例 https://api.forecast.io/forecast/7c693e97458b09a53aa5f7e2cd0af4a0/28.80243177,118.6994648?units=si
  function getWeather(url) {
    $.ajax({
      type: 'GET',
      url: url,
      dataType: 'jsonp',
      success: weather
    });

    function weather(data) {

      //解析当日天气信息
      let temp = Math.round(data.currently.temperature),
        conditions = data.currently.icon.split('-').join(' '),
        icon = data.currently.icon,
        low = Math.round(data.daily.data[0].temperatureMin),
        high = Math.round(data.daily.data[0].temperatureMax);

      //解析一周的信息
      for (let i = 1; i < 6; i++) {
        let day = moment.unix(data.daily.data[i].time).format('dddd'),
          weekIcon = data.daily.data[i].icon,
          weekCond = data.daily.data[i].icon.split('-').join(' '),
          weekLow = Math.round(data.daily.data[i].temperatureMin),
          weekHigh = Math.round(data.daily.data[i].temperatureMax);
          console.log(day, weekIcon, weekCond, weekLow, weekHigh);

        //显示天气信息函数
        displayWeekly(day, weekIcon, weekCond, weekLow.toFixed(0), weekHigh.toFixed(0));
      }

      //显示当日信息（包括图标，现在温度，天气情况，最高以及最低温度）
      displayWeather(icon, temp.toFixed(0), conditions, low, high);

      //切换华氏摄氏度和标准摄氏度
      $('#unit_fah').on('click', function() {
        displayWeather(icon, toFah(temp.toFixed(0)), conditions, toFah(low), toFah(high));
        $('#unit_fah').prop('disabled', true);
        $('#unit_cel').prop('disabled', false);

        $('#weekly_list').empty();
        for (let i = 1; i < 6; i++) {
          let day = moment.unix(data.daily.data[i].time).format('dddd'),
            weekIcon = data.daily.data[i].icon,
            weekCond = data.daily.data[i].icon.split('-').join(' '),
            weekLow = toFah(Math.round(data.daily.data[i].temperatureMin)),
            weekHigh = toFah(Math.round(data.daily.data[i].temperatureMax));

          
          displayWeekly(day, weekIcon, weekCond, weekLow.toFixed(0), weekHigh.toFixed(0));
        }
      });

      $('#unit_cel').on('click', function() {

        displayWeather(icon, temp.toFixed(0), conditions, low, high);
        $('#unit_cel').prop('disabled', true);
        $('#unit_fah').prop('disabled', false);

        $('#weekly_list').empty();
        for (let i = 1; i < 6; i++) {
          let day = moment.unix(data.daily.data[i].time).format('dddd'),
            weekIcon = data.daily.data[i].icon,
            weekCond = data.daily.data[i].icon.split('-').join(' '),
            weekLow = Math.round(data.daily.data[i].temperatureMin),
            weekHigh = Math.round(data.daily.data[i].temperatureMax);

          
          displayWeekly(day, weekIcon, weekCond, weekLow.toFixed(0), weekHigh.toFixed(0));
        }
      });

    } 

    //此为显示当日天气信息函数（包括图标，现在温度，天气情况，最高以及最低温度参数）
    function displayWeather(icon, temp, condition, low, high) {
      //plop to website

      /*$('.forecast_icon').addClass('wi wi-owm-'+ icon);*/
      $('.forecast_icon').addClass('wi wi-forecast-io-' + icon);
      $('.forecast_summary').text(condition);
      $('.high_temp').text(high + '\xB0');
      $('.low_temp').text(low + '\xB0');
      $('.forecast_temp').text(temp + '\xB0');

    } 

    //显示一周信息
    function displayWeekly(day, icon, condition, low, high) {

      //let list = '';

      let list = '<span class="day_name">' + day + '</span>';
      list += '<span class="day_icon wi wi-forecast-io-' + icon + '"></span>';
      list += '<span class="day_cond">' + condition + '</span>';
      list += '<span class="wi wi-direction-up"></span>';
      list += '<span class="day_high">' + high + '</span>';
      list += '<span class="wi wi-direction-down"></span>';
      list += '<span class="day_low">' + low + '</span>';

      $('#weekly_list').append('<li class="day">' + list + '</li>');

    } 

    function toFah(temp) {
      return parseInt(temp * (9 / 5) + 32);
    } 

  } 

});