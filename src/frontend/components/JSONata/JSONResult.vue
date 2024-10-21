<template>
  <pre class="language-json" tabindex="0">
    <code v-if="!isReload" class="language-json">{{ jsoncode }}</code>
  </pre>
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
    name: 'JSONResult',
    props: {
      jsoncode: {
        type: [String],
        default: ''
      }
    },
    data() {
      return {
        isReload: true
      };
    },
    watch: {
      jsoncode() {
        this.reload();
      }
    },
    mounted() {
      this.reload();
    },
    methods: {
      reload() {
        this.isReload = true;
        this.$nextTick(() => {
          this.isReload = false;
          if (this.jsoncode.length < 5000) {
            // eslint-disable-next-line no-undef
            this.$nextTick(() => Prism.highlightAll());
          }
        });
      }
    }
  };
</script>

<style scoped>

</style>
