<template>
  <div v-if="user && time"  class="quiz-show-action__date">
    <UserWithIcon :user="user"></UserWithIcon>
    <TimeInfo :time="time"></TimeInfo>
  </div>
</template>
<script>
import UserWithIcon from "~/components/atoms/UserWithIcon"
import TimeInfo from "~/components/atoms/Time"
export default{
  components: {
    UserWithIcon,TimeInfo
  },
  props:{
    user:{
      type: Object,
      required: false
    },
    time:{
      type: Object,
      required: true
    }
  },
}
</script>
<style>
</style>

