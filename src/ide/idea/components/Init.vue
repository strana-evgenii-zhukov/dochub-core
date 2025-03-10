<template>
  <div style="margin-top: 64px; padding: 16px;">
    <v-icon large color="red darken-2" style="float: left; margin-right: 12px; margin-top: 6px;">mdi-alert-circle-outline</v-icon>
    <h1>Возникли проблемы при загрузки корневого манифеста архитектуры <strong>dochub.yaml</strong>!<br><br></h1>
    <div style="text-align:left">
      Наиболее распространенные причины данной ошибки:<br><br>
      <ul>
        <li>Корневой манифест отсутствует. Проверьте, что в корне проекта есть файл dochub.yaml. Если его нет - создайте.</li>
        <li>В корневом манифесте есть ошибка синтаксиса YAML. Проверьте, что IDE не сообщает о проблемах в файле dochub.yaml.</li>
        <li>Импортируются несуществующие ресурсы или ссылка на них имеет ошибку. Проверьте секцию imports.</li>
        <li>Доступ к фалу dochub.yaml или к указанным ресурсам в imports ограничен. Это возможно из-за отсутствия у вас прав доступа или есть проблема CORS. За решением этой проблемы обратитесь к вашему системному администратору.</li>
      </ul>
    </div>
    <br><br>
    <strong>Если манифест отсутствует, воспользуйтесь помощником для его создания:</strong>
    <br><br>
    <v-btn depressed color="primary" v-on:click="initEmptyProject">Создать пустой файл</v-btn>  <v-btn depressed color="primary" v-on:click="initExampleProject">Создать пример</v-btn>
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
