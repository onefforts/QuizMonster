import Vue from 'vue'
import moment from 'moment'

Vue.filter('format-datetime-from-unixtime', function (value) {
  if(value){
    const datetime = moment.unix(value);
    return datetime.format("YYYY/MM/DD(ddd) HH:mm");
  }else{
    return
  }
})

Vue.filter('format-date-from-unixtime', function (value) {
  if(value){
    const datetime = moment.unix(value);
    return datetime.format("YYYY/MM/DD(ddd)");
  }else{
    return
  }
})

Vue.filter('userIcon', function (value) {
  return value || '/default-user-icon.png'
})
