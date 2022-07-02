<template>
  <nuxt-link :to="`/users/${user.uid}`" class="quiz-content__user" v-if="user">
    <img :src="user.photoURL | userIcon"><span>{{ user.displayName }}</span>
  </nuxt-link>
</template>
<script>
export default{
  props:{
    user:{
      type: Object,
      required: false
    }
  }
}
</script>
<style>
</style>

