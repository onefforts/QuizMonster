<template>
  <b-tabs>
    <b-tab title="編集" active>
      {{formName}}<InputHelpText />
      <b-form-textarea
        :rows="textRows"
        :value="value"
        :state="isRequired ? value.length > 0 : null"
        @input="$emit('input', $event)"
        required
        placeholder="内容を入力してください (katex形式は`$`で囲んで使います。例: $x = \frac{a}{b}$"
      ></b-form-textarea>
      <div class="mt-2">
        画像アップロード
        <input @change="$emit('imageSelected', {event: $event, targetType: targetType})" accept=".jpg, .jpeg, .png, .svg" type="file"/>
      </div>
    </b-tab>

    <b-tab title="プレビュー">
      <b-card class="mt-3 mb-4" :header="`${formName}プレビュー`" >
        <div class="m-0 text-preview quiz-show__text" v-html="$md.render(value || '')"></div>
      </b-card>
    </b-tab>
  </b-tabs>
</template>

<script>
import InputHelpText from "~/components/InputHelpText.vue";

export default {
  name: "ContentEditForm",
  components: {
    InputHelpText
  },
  props: {
    formName: {
      value: String,
      default: ''
    },
    value: {
      type: String
    },
    textRows:{
      type: Number,
      default: 5
    },
    targetType:{
      type: String,
      required: true
    },
    isRequired:{
      type: Boolean,
      default: false
    }
  },
  methods: {}
}
</script>

<style scoped>
.quiz-show__text >>> img {
  max-width: 100%;
  height: auto;
}

</style>
