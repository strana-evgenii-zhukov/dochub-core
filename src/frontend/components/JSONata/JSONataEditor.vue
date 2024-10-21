<template>
  <div />
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

  import * as monaco from 'monaco-editor';
  import env from '@front/helpers/env';

  monaco.languages.register({id: 'jsonata'});
  monaco.languages.setMonarchTokensProvider('jsonata', {
    keywords: ['function'],
    functions: ['$spread'],
    special: env.isBackendMode() ? [] : ['$log('],
    tokenizer: {
      root: [
        [/@?\$[a-zA-Z][\w$]*\(/, {
          cases: {
            '@special': 'special',
            '@default': 'function'
          }
        }],
        [/@?[a-zA-Z][\w$]*/, {
          cases: {
            '@keywords': 'keyword',
            '@default': 'data'
          }
        }],
        [/@?\$[a-zA-Z][\w$]*/, 'variable'],
        [/".*?"/, 'string'],
        [/\/\*(.|\W)*?\*\//, 'comment']
      ]
    }
  });

  monaco.editor.defineTheme('jsonata-theme', {
    base: 'vs',
    rules: [
      { token : 'comment', foreground: '#008000' },
      { token: 'keyword', foreground: '#000000', fontStyle: 'bold' },
      { token: 'special', foreground: '#ff0000', fontStyle: 'bold' },
      { token: 'variable', foreground: '#2233ee' },
      { token: 'function', foreground: '#2233ee', fontStyle: 'bold'},
      { token : 'string', foreground: '#990055' }
    ],
    colors: {
      'editor.foreground': '#000000'
    }
  });

  monaco.editor.setTheme('jsonata-theme');

  // https://ohdarling88.medium.com/4-steps-to-add-custom-language-support-to-monaco-editor-5075eafa156d
  // https://blog.expo.dev/building-a-code-editor-with-monaco-f84b3a06deaf

  export default {
    name: 'JSONataEditor',
    props: {
      value: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        model: null,
        editor: null
      };
    },
    mounted() {
      this.model = monaco.editor.createModel(this.value, 'jsonata');
      this.model.onDidChangeContent(() => {
        this.$emit('input', this.editor.getValue());
      });
      this.editor = monaco.editor.create(this.$el, {
        automaticLayout: true
      });
      this.editor.setModel(this.model);
    },
    unmounted() {
      this.editor.dispose();
    }
  };
</script>

<style scoped>

</style>
