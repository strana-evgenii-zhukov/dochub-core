<template>
  <box class="space">
    <context-menu v-model="menu.show" v-bind:x="menu.x" v-bind:y="menu.y" v-bind:items="contextMenu" />
    <dochub-anchor id="" />
    <div v-if="toc" class="toc" v-html="toc" />
    <markdown
      v-if="(markdown !== null)"
      toc
      v-bind:toc-first-level="0"
      v-bind:toc-last-level="100"
      v-bind:breaks="false"
      v-bind:html="isHTMLSupport"
      v-bind:postrender="rendered"
      v-on:toc-rendered="tocRendered">
      {{ markdown }}
    </markdown>
    <final-markdown
      v-if="showDocument"
      v-bind:template="outHTML"
      v-bind:base-u-r-i="currentURL"
      v-on:go-markdown="onGoMarkdown" />
    <spinner v-else />
  </box>
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

  import markdown from 'vue-markdown';
  import mustache from 'mustache';

  import requests from '@front/helpers/requests';
  import href from '@front/helpers/href';
  import uri from '@front/helpers/uri';

  import { DocTypes } from '@front/components/Docs/enums/doc-types.enum';
  import DocMarkdownObject from './DocHubObject';
  import DocMixin from './DocMixin';
  import ContextMenu from './DocContextMenu.vue';
  import Spinner from '@front/components/Controls/Spinner.vue';
  import env from '@front/helpers/env';

  export default {
    name: 'DocMarkdown',
    components: {
      markdown,
      ContextMenu,
      Spinner,
      finalMarkdown: {
        components: {
          'dochub-object': DocMarkdownObject
        },
        props: {
          template: { type: String, default: '' },
          baseURI: { type: String, default: '' }
        },
        created() {
          this.$options.template = `<div class="markdown-document">${this.template}</div>`;
        },
        methods: {
          // Ищем ссылки на markdown документы для переходов по ним
          sniffMarkdownLinks(el) {
            const refs = el?.querySelectorAll && el.querySelectorAll('[href]') || [];
            for (let i = 0; i < refs.length; i++) {
              const refItem = refs[i];
              if (refItem.href.slice(-3) === '.md') {
                refItem.onclick = (event) => {
                  this.$emit('go-markdown', event);
                  return false;
                };
              }
            }
          }
        },
        mounted() {
          href.elProcessing(this.$el);
          this.sniffMarkdownLinks(this.$el);
        }
      }
    },
    mixins: [DocMixin],
    props: {
      tocShow: {
        type: Boolean,
        default: true
      },
      inline: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
        showDocument: false,
        toc: '',
        markdown: null,
        outHTML: null,
        redirectURL: null
      };
    },
    computed: {
      // Определяет поддерживаются ли HTML тэги в markdown
      isHTMLSupport() {
        return (process.env.VUE_APP_DOCHUB_MARKDOWN_HTML || env.ideSettings?.env.DOCHUB_IDE_MARKDOWN_HTML || 'off').toLocaleLowerCase() === 'on';
      },
      // Возвращает URL документа с учетом истории переходов
      currentURL() {
        return this.redirectURL ? this.redirectURL : this.url;
      },
      // Доступные типы документов
      availableDocTypes() {
        const result = [];
        for (const key in DocTypes) result.push(DocTypes[key].toLowerCase());
        const extended = this.$store.state.plugins.documents;
        for (const key in extended) result.push(key.toLowerCase());
        return result;
      }
    },
    methods: {
      onGoMarkdown(event) {
        const ref = event.target.attributes.href.nodeValue;
        const route = Object.assign({}, this.$router.currentRoute);
        const query = Object.assign({}, this.$router.currentRoute.query);
        query.redirect =  uri.makeURIByBaseURI(ref, this.currentURL);
        // eslint-disable-next-line no-console
        console.info(route.query);
        this.$router.push({
          params: route.query,
          query
        });
        return false;
      },
      rendered(outHtml) {
        // Парсим ссылки на объекты DocHub
        const result = outHtml.replace(/<img /g, '<dochub-object :baseURI="baseURI" :inline="true" ')
          .replace(/\{\{/g, '<span v-pre>{{</span>')
          .replace(/\}\}/g, '<span v-pre>}}</span>');
        if (this.outHTML != result) {
          this.showDocument = false;
          this.outHTML = result;
          this.$nextTick(() => {
            this.showDocument = true;
            setTimeout(() => {
              this.loadState();
              window.location.hash && (window.location.href = window.location.hash);
            }, 50);
          });
        }
        // eslint-disable-next-line no-undef
        Prism.highlightAll();
        return '';
      },
      tocRendered(tocHTML) {
        // Не выводим оглавление, если в нем всего три раздела или меньше
        // eslint-disable-next-line no-useless-escape
        if (!this.inline && this.tocShow && ((tocHTML.match(/\<li\>.*\<\/li\>/g) || []).length > 3))
          this.toc = tocHTML;
      },
      prepareMarkdown(content) {
        // Преобразуем встроенный код в объекты документов
        return content.replace(/```(\w\w*)(\n|\r)([^`]*)```/gim, (segment, language, br, content) => {
          if (this.availableDocTypes.indexOf(language.toLowerCase()) < 0 ) return segment;
          // eslint-disable-next-line no-debugger
          const urlObject = URL.createObjectURL(new Blob([content], { type: `text/${language};charset=UTF-8` }));
          return `![](@document/${urlObject})`;
        });
      },
      refresh() {
        // Если есть параметр перенаправления, используем его
        this.redirectURL = this.$router.currentRoute?.query?.redirect;

        // Обновляем документ
        this.markdown = null;
        if (!this.currentURL) return;
        this.outHTML = null;
        this.showDocument = false;
        this.toc = '';
        this.sourceRefresh().then(() => {
          requests.request(this.currentURL).then(({ data }) => {
            let content = null;
            this.error = null;
            if (!data)
              content = 'Здесь пусто :(';
            else if (this.isTemplate) {
              content = mustache.render(data, this.source.dataset);
            } else
              content = data;
            this.markdown = this.prepareMarkdown(content);
          }).catch((e) => {
            this.error = e;
          });
        });
      }
    }
  };
</script>

<style>

.table-of-contents {
  list-style-type: none;
  padding-left: 0;
}

.theme--light.v-application code {
  background: none !important;
}

.dochub-object {
  margin-top: 12px 24px;
  margin-bottom: 24px;
}
.space {
  padding: 24px;
  position: relative;
  /* min-height: 100vh; */
  min-height: 60px;
}

.toc {
  margin-bottom: 24px;
}

.markdown-document {
    font-size: 1rem;
    line-height: 1.5rem;
}

.markdown-document pre {
  display: block;
  padding: 9.5px;
  margin: 0 0 10px;
  font-size: 13px;
  line-height: 1.42857143;
  color: #333;
  word-break: break-all;
  word-wrap: break-word;
  background-color: #f5f5f5;
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: auto;
}

.markdown-document code[class*="language-"]:first-child {
  margin-left: -12px;
}

.markdown-document code[class*="language-"],
.markdown-document pre[class*="language-"] {
  padding: 16px 13px;
  color: black;
  font-weight: 300;
  background: none;
  text-shadow: 0 1px white;
  font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
  text-align: left;
  white-space: pre;
  word-spacing: normal;
  word-break: normal;
  word-wrap: normal;
  line-height: 1.5;
  -moz-tab-size: 4;
  -o-tab-size: 4;
  tab-size: 4;
  -webkit-hyphens: none;
  -moz-hyphens: none;
  -ms-hyphens: none;
  hyphens: none;
  font-size: 13px;
  border-radius: 0;
}
.toc-anchor {
  display: none;
}
.markdown-document code[class*="language-"]::before, pre[class*="language-"]::before,
.markdown-document code[class*="language-"]::after, pre[class*="language-"]::after
{
  content: none !important;
}
.markdown-document table {
  border: solid #ccc 1px;
}
.markdown-document table.table td {
  padding-left: 6px;
  padding-right: 6px;
}
.markdown-document table thead th * {
  color: #fff !important;
}
.markdown-document table thead th  {
  background: rgb(52, 149, 219);
  color: #fff !important;
  height: 40px;
}
.markdown-document table.table thead th {
  padding: 6px;
}
.markdown-document h1 {
  font-size: 1.5rem;
  margin-bottom: 18px;
  margin-bottom: 24px;
  clear:both;
}

.markdown-document h2 {
  margin-bottom: 18px;
  font-size: 1.25rem;
  clear:both;
}

.markdown-document h1:not(:first-child),
.markdown-document h2:not(:first-child) {
  margin-top: 56px;
}

.markdown-document h3,
.markdown-document h4,
.markdown-document h5 {
  margin-bottom: 18px;
  font-size: 1.125rem;
  clear:both;
}

.markdown-document h3:not(:first-child),
.markdown-document h4:not(:first-child),
.markdown-document h5:not(:first-child) {
  margin-top: 32px;
}

.markdown-document ul,
.markdown-document ol
{
  margin-bottom: 18px;
}

.markdown-document code[class*="language-"]{
  font-family: Menlo,Monaco,Consolas,Courier New,Courier,monospace;
  line-height: 22.4px;
  /* margin: 16px 13px; */
  font-size: 14px;
  border-radius: 8px;
}

.markdown-document code[class*="language-"] .token{
  background: none;
}

.markdown-document pre[class*="language-"]{
  border-radius: 4px;
  border: none;
  background-color: #eee;
}

.markdown-document pre[class*="language-mustache"] .token.variable{
  color: #cd880c;
}

</style>
