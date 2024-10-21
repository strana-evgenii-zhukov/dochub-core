<template>
  <v-menu
    v-model="isShow"
    v-bind:position-x="x"
    v-bind:position-y="y"
    style="z-index: 1000"
    absolute
    offset-y>
    <v-list>
      <v-list-item
        v-for="item in items"
        v-bind:key="item.id"
        link
        v-on:click="item.on(item)">
        <v-list-item-title>
          {{ item.title }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
  /*
  Copyright (C) 2021 owner Roman Piontik R.Piontik@mail.ru

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

          http://www.apache.org/licenses/LICENSE-2.0

  In any derivative products, you must retain the information of
  owner of the original code and provide clear attribution to the project

          https://dochub.info

  The use of this product or its derivatives for any purpose cannot be a secret.

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.

  Maintainers:
      R.Piontik <r.piontik@mail.ru>

  Contributors:
      R.Piontik <r.piontik@mail.ru>
  */

  export default {
    name: 'DocContextMenu',
    props: {
      items: {
        type: Array,
        default: null
      },
      x: {
        type: Number,
        default: 0
      },
      y: {
        type: Number,
        default: 0
      },
      value: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {};
    },
    computed: {
      isShow: {
        get() { return this.value; },
        set(value) { this.$emit('input', value); }
      }
    }
  };
</script>
