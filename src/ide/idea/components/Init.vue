<template>
  <div
    style="width: 400px; height: 300px; left: 50%; top: 50%; position: absolute; margin-left: -150px; margin-top: -150px; text-align:center;">
    Корневой манифест архитектуры <strong>dochub.yaml</strong> не обнаружен или не может быть загружен.<br><br>
    Если файл существует, пожалуйста, проверьте его содержимое на наличие ошибок. Если манифест отсутствует, воспользуйтесь помощником для его создания.
    <br><br>
    <v-btn depressed color="primary" v-on:click="initEmptyProject">Создать пустой файл</v-btn>
    <br><br>
    <v-btn depressed color="primary" v-on:click="initExampleProject">Создать пример</v-btn>
  </div>
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
  */

  export default {
    name: 'Empty',
    data() {
      return {};
    },
    methods: {
      initEmptyProject() {
        window.$PAPI.initProject();
      },
      initExampleProject() {
        window.$PAPI.initProject('example');
      }
    }
  };
</script>

<style scoped>


</style>
