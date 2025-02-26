<template>
  <box v-bind:id="dom_id" v-bind:class="getClass" />
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


  import SwaggerUI from 'swagger-ui';

  import DocMixin from './DocMixin';
  import { getAsyncApiContext } from '@front/helpers/misc';
  import env from '@front/helpers/env';

  export default {
    name: 'DocSwagger',
    mixins: [DocMixin],
    data() {
      return {
        dom_id : `swagger-${Date.now()}-${Math.round(Math.random() * 10000)}`,
        data: null
      };
    },
    computed: {
      getClass() {
        return this.inline ? 'sgr-inline' : 'sgr-not-inline';
      }
    },
    watch: {
      isPrintVersion() {
        const el = document.getElementById(this.dom_id);
        el.innerHTML = '';
        this.$nextTick(this.swaggerRender);
      }
    },
    methods: {
      refresh() {
        getAsyncApiContext.call(this, true);
      },

      swaggerRender() {
        if (this.url) {
          SwaggerUI({
            dom_id: `#${this.dom_id}`,
            spec: this.data,
            deepLinking: !env.isPlugin(),
            docExpansion: this.isPrintVersion ? 'full' : 'list',
            presets: [
              SwaggerUI.presets.apis
            ]
          });
        }
      }
    }
  };
</script>

<style>
.sgr-not-inline {
  padding: 16px;
  width: 100%;
}

.swagger-ui .opblock .opblock-summary-path {
    min-width: 100px;
}

</style>
