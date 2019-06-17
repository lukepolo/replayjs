<style lang="scss">
.auth-area {
  width: 100%;
  margin: 20px auto;
  max-width: 400px;

  a {
    color: lighten(#636b6f, 20%);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.1rem;
    text-transform: uppercase;
  }

  h1 {
    margin-bottom: 0;
  }

  &__container {
    padding: 20px;
    box-shadow: 0 1px 10px rgba(0, 0, 0, 0.2);
  }

  .form-group {
    margin: 1rem 0;

    label {
      display: block;
      font-weight: bold;
    }

    input {
      width: 100%;
      height: 30px;
      border-radius: 3px;
      border: 1px solid #ccc;
    }
  }

  .btn {
    width: 100%;
    height: 30px;
    font-size: 1rem;
    text-align: center;
    border-radius: 3px;
    text-decoration: none;
    font-family: "Montserrat", sans-serif;
    font-weight: 700;

    -moz-box-sizing: border-box;
    display: flex; /*CSS3*/
    align-items: center; /*Vertical align*/
    justify-content: center; /*horizontal align*/

    &--grey {
      color: #ffffff;
      background-color: gray;
    }

    &--blue {
      color: #ffffff;
      background-color: #4281a4;
    }
  }
}
</style>

<template>
  <div class="auth-area">
    <div class="auth-area__container"><router-view></router-view></div>
  </div>
</template>

<script>
import Vue from "vue";

export default Vue.extend({});
</script>
