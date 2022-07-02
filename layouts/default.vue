<template>
  <div>
    <Header/>
    <div class="container">
      <nuxt />
    </div>
  </div>
</template>


<script>
import Vue from "vue";
import Header from "~/components/Header.vue";
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.use(BootstrapVue)
export default {
  name: "login",
  components: {
    Header
  }
}
</script>

<style lang="scss">

$main-color: #000;
$main-color-light: #555;
$border-color: #cd8447;

html {
  font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
  body {
    background-image: url(/img/sitepage_back.png);
    background-size: cover;
    background-attachment: fixed;
  }
}

*,
*:before,
*:after {
  box-sizing: border-box;
  margin: 0;
}

.button--green {
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #3b8070;
  color: #3b8070;
  text-decoration: none;
  padding: 10px 30px;
}

.button--green:hover {
  color: #fff;
  background-color: #3b8070;
}

.button--grey {
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #35495e;
  color: #35495e;
  text-decoration: none;
  padding: 10px 30px;
  margin-left: 15px;
}

.button--grey:hover {
  color: #fff;
  background-color: #35495e;
}

.nav-sp {
  padding: 10px;

  & a {
    color: #ffffff;
    font-weight: 700;
  }
}

.nav-login {
  margin: 0 0 0 auto !important;

  @media screen and (max-width: 991px) {
    margin: 10px 0 0 auto !important;
  }
}

.content-link:hover {
  text-decoration: none;
}

.index-title {
  border-bottom: 1px solid #707070;
  font-size: 1.5em;
  font-weight: 700;
  margin-bottom: 30px;
  padding: 10px 0;
}

.quiz-content {
  border: none;
  color: #0F0F0F;
}

.quiz-content__tag {
  padding: 5px 0;
}

.quiz-content__title,
.quiz-show__title,
.index-sub-title {
  font-size: 20px;
  font-weight: 700;
  margin-top: 10px;
  margin-bottom: 5px;
  line-height: 1.5em;
}

.quiztype-label {
  background-color: #F0F0F0;
  font-size: 14px;
  padding: 5px;
}

.quiz-content__text {
  margin: 10px 0;
}

.quiz-content__user {
  img {
    border-radius: 30px;
    width: 30px;
  }

  span {
    color: #626262;
    margin: 10px;
  }
}

.quiz-content__create {
  color: #626262;
  display: block;
  margin-top: -27px;
  margin-bottom: 15px;
  text-align: right;
}

@media screen and (max-width: 991px) {
  .quiz-content__create {
    margin: 10px 0;
    text-align: left;
  }
}

.quiz-content__useraction {
  color: #585858;
  margin: 0 5px;
}

.quiz-show-action__date {
  bottom: 25px;
  position: absolute;
  right: 25px;
}

@media screen and (max-width: 991px) {
  .quiz-show-action__date {
    display: block;
    margin-top: 10px;
    position: inherit;
  }
}

.useraction-icon {
  margin: 0 2px;
  color: $main-color-light;
}

.icon-color {
  color: $main-color-light;
}

.content-border {
  border-color:#b7b7b7 ;
}

.btn-main {
  background-color: #000;
  border: 3px #fff solid;
  box-shadow: 0 0 4px #797d7d;
  color: white;
  padding: 0.5rem 3rem;

  &:active,
  &:hover,
  &:focus {
    background-color: #fff;
    color: #000;
  }
}

.btn-sub {
  background-color: white;
  border: #fff 1px solid;
  box-shadow: 0 0 4px #797d7d;
  color: #fff;
  
  &:active,
  &:hover,
  &:focus {
    background-color: #fff;
    border: #fff 1px solid;
  }
}

.btn-main,
.btn-sub {
  margin: 10px 0;
}

@media screen and (max-width: 991px) {
  .btn-main,
  .btn-sub{
    width: 100%;
  }  
}

.btn-like {
  background-color: #000;
  border: #fff 3px solid;
  color: #fff;
  margin: 0 5px 0 -2px;

  &:active,
  &:hover,
  &:focus {
    background-color: #fff;
    border: #fff 3px solid;
    color: #000;
  }
}

.btn-like-active {
  background-color: white;
  border: #fff  3px solid;
  color: #fff;
  margin: 0 5px 0 -2px;

  &:active,
  &:hover,
  &:focus {
    background-color: #fff;
    border: #000 3px solid;
    color: #000;
    opacity: 0.8;
  }

}

.btn-nav,
.btn-login {
  border: $border-color 1px solid;
  color: $border-color;
  background-color: #000;
  font-weight: 700;
  margin: 5px 20px;

  &:active,
  &:hover {
    background-color: white;
    border: $border-color 1px solid;
    color: $border-color;
  }
}

.btn-nav a.nav-link {
  color: $border-color!important;
  padding: 0;

  &:active,
  &:hover {
    color: $border-color!important;
  }
}

@media screen and (max-width: 991px) {
  .btn-login {
    width: 100%;
  }
}

.btn-twitter {
  background-color: #00acee;
  border: none;
  box-shadow: 0 0 4px #797d7d;
  color: #fff;

  &:active,
  &:hover,
  &:focus {
    background-color: #47c6f7;
  }
}
.btn .b-icon.bi{
  vertical-align: middle;
}


.profile-base {
  display: inline;
}

.profile__img,
.profile__name {
  display: inline-block;
}

.profile__img {
  border-radius: 100px;
  height: 100px;
  object-fit: cover;
  width: 100px;
}

.profile__img--sm {
  border-radius: 30px;
  height: 30px;
  -o-object-fit: cover;
  object-fit: cover;
  width: 30px;
}

.profile__name {
  font-size: 1.2em;
  font-weight: 700;
  padding-left: 10px;
}

@media screen and (max-width: 991px) {
  .profile-base {
    text-align: center;
  }

  .profile__img,
  .profile__name {
      display: block;
  }

  .profile__img {
    margin: 0 auto;
  }

  .profile__name {
    margin-top: 10px;
  }
}

.quiz-create__item-head {
  text-align: right;
}

.quiz-create__label {
  font-weight: 700;
  margin-bottom: 0;
}

@media screen and (max-width: 991px) {
  .quiz-create__item-head {
    text-align: left;
  }

  .quiz-create__label {
    display: inline-block;
    margin-bottom: 10px;
  }
}

.required-item,
.any-item {
  color: #fff;
  display: inline-block;
  margin: 3px;
  padding: 0 5px;
}

.required-item {
  background-color: #da3a3a;
}

.any-item {
  background-color: #6f6f6f;
}

.label-description {
  font-size: 0.9em;
  font-weight: 500;
  display: block;
  margin: 10px;
}

.modal-contents__group {
  border: 1px solid #fff;
}

.modal-contents__group__header {
  padding: 0.5em 1em;
}

.modal-contents__footer {
  border: none;
  margin: 0 auto;
  padding-bottom: 20px;
}

.container {
  background: rgba(255, 255, 255, 0.8);
  margin: 20px auto auto auto;
  border-radius: 10px;
}
.card-text{
  padding: 15px;
}
.search-input {
  background-color: #000;
  border-color: #fff;
}
</style>
