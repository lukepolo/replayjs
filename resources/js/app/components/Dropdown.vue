<template>
  <div class="nav-dropdown" @click="showDropDownMenu = !showDropDownMenu">
    <div class="dropdown" :class="{ open: showDropDownMenu }">
      <slot></slot>&nbsp;
      <i class="arrow"></i>
      <div class="dropdown--menu" v-show="showDropDownMenu">
        <template v-for="option in options">
          <div
            @click="$emit('select', option.value)"
            class="dropdown--menu-item"
          >
            {{ option.display }}
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    options: {
      required: true,
    },
  },
  data() {
    return {
      showDropDownMenu: false,
    };
  },
};
</script>
