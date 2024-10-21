<template>
  <v-container grid-list-xl fluid>
    <v-layout wrap>
      <v-flex xs12 md5 d-flex>
        <validators v-bind:subject="subject" />
      </v-flex>
      <v-flex xs12 md7 d-flex>
        <problem-blank v-if="subject" v-bind:subject="subject" />
      </v-flex>
    </v-layout>
  </v-container>
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
      Rostislav Kabalin <kabalin2009@yandex.ru>
  */

  import Validators from './tabs/Validators.vue';
  import ProblemBlank from './tabs/ProblemBlank.vue';

  export default {
    name: 'Problems',
    components: {
      Validators,
      ProblemBlank
    },
    props: {
      subject: { type: String, default: '' }
    },
    data() {
      return {
      };
    },
    methods: {
      onGoto(route) {
        window.$PAPI.goto(route);
      }
    }
  };
</script>

<style scoped>
</style>
