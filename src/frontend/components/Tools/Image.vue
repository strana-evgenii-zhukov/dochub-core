<template>
  <div>
    <v-alert v-if="error" color="warning">
      Здесь должна быть картинка, но что-то пошло не так.<br>
      Проверьте, что ресурс доступен, а CORS политики настроены верно.<br>
      URL: {{ url.toString() }}<br>
      Ошибка: {{ error }}
    </v-alert>
    <img v-else v-bind:src="data" style="max-width:100%">
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

  Maintainers:
      R.Piontik <r.piontik@mail.ru>

  Contributors:
      R.Piontik <r.piontik@mail.ru>
      Rostislav Kabalin <kabalin2009@yandex.ru>
  */

  import requests from '@front/helpers/requests';
  import uriTool from '@front/helpers/uri';

  export default {
    name: 'DHImage',
    props: {
      src: { type: String, default: '' },
      baseURI: { type: String, default: '' }
    },
    data() {
      return {
        error: null,
        data: null
      };
    },
    computed: {
      url() {
        return uriTool.makeURL(this.src, this.baseURI).url;
      }
    },
    mounted() {
      this.reloadImage();
    },
    methods: {
      reloadImage() {
        requests.request(this.src, this.baseURI, { responseType: 'arraybuffer' })
          .then((response) => {
            this.data = URL.createObjectURL(new Blob([response.data], { type: response.headers['content-type']}));
          })
          .catch((e) => {
            this.error = e;
          });
      }
    }
  };
</script>

<style scoped>
</style>
