<template>
   <span v-if="time"  class="">{{ (time && time.seconds) | format-datetime-from-unixtime }}</span>
</template>
<script>
export default{
  props:{
    time:{
      type: Object,
      required: true
    }
  }
}
</script>
<style>
</style>

