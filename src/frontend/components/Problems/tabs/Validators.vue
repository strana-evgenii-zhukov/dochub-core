<template>
  <v-card class="card-item">
    <v-card-title>
      <v-icon left style="color:#f00">mdi-alert</v-icon>
      <span class="title">Валидаторы</span>
    </v-card-title>
    <v-card-text class="headline font-weight-bold">
      <v-btn-toggle v-model="filter" class="toggle-filter">
        <v-btn value="all">
          Все
        </v-btn>
        <v-btn value="error">
          Отклонения
        </v-btn>
        <v-btn value="warning">
          Исключения
        </v-btn>
      </v-btn-toggle>
      <tree v-model="subject" v-bind:items="items" class="tree" style="overflow-x: auto" />
    </v-card-text>
  </v-card>
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

  import Tree from '@front/components/Controls/Tree.vue';
  import Mixin from '../mixin';

  export default {
    name: 'Validators',
    components: {
      Tree
    },
    mixins: [Mixin],
    props: {
      subject: { type: String, default: '' }
    },
    data() {
      return {
        filter: 'error'
      };
    },
    computed: {
      items() {
        const result = [];
        // Строим дерево валидаторов
        const expandItem = (expitem) => {
          let node = result;
          const stack = [];
          // Разбираем ключ
          expitem.id.split('.').map((partKey, index, arr) => {
            const key = arr.slice(0, index + 1).join('.');
            let item = node.find((element) => element.key === key);
            if (!item) {
              node.push(
                item = {
                  title: partKey,
                  key,
                  icon: 'check',
                  iconStyle: 'color:#1B5E20',
                  items: [],
                  parent: node,
                  countProblems: 0,
                  countExceptions: 0,
                  count: 0
                }
              );
            }
            stack.push(item);
            if (arr.length - 1 === index) {
              item.link = expitem.link;
              item.title = expitem.title || partKey;
            }
            node = item.items;
          });
          // Разбираем отклонения
          let countProblems = 0;
          let countExceptions = 0;
          (expitem.items || []).map((item) => {
            const problem = {
              title: item.title || item.uid,
              key: item.uid,
              icon: 'error',
              iconStyle: 'color:#F00',
              items: [],
              link: `/problems/${item.uid}`,
              selected: this.subject === item.uid
            };

            if(item.exception) {
              problem.icon = 'warning';
              problem.iconStyle = 'color:#FF6F00';
              countExceptions++;
            } else countProblems++;

            if (
              (this.filter === 'error' && problem.icon !== 'error')
              || (this.filter === 'warning' && problem.icon !== 'warning')
            ) return;

            // Если отклонение выбрано (как параметр в URL) открываем дерево до него
            problem.selected && stack.forEach((item) => item.expand = true);

            node.push(problem);
          });
          // Всегда раскрываем первый уровень дерева
          stack[0].expand = true;
          // Обходим дерево до корня
          stack.forEach((item) => {
            // Если ошибка критическая, раскрываем все дерево
            expitem.critical && (item.expand = true);
            // Индексируем счетчики проблем
            item.countProblems += countProblems;
            item.countExceptions += countExceptions;
            switch (this.filter) {
              case 'error': item.count += countProblems; break;
              case 'warning': item.count += countExceptions; break;
              default: item.count += countProblems + countExceptions;
            }

            if (item.countProblems) {
              item.icon = 'error';
              item.iconStyle = 'color:#F00';
            } else if (item.countExceptions) {
              item.icon = 'warning';
              item.iconStyle = 'color:#FF6F00';
            }
          });
        };
        this.problems.map((item) => expandItem(item));

        // Сортируем дерево отклонений
        const sort = (items) => {
          items.sort((item1, item2) => {
            if (!item1.items.length && item2.items.length > 0) return 1;
            else if (item1.items.length > 0 && !item2.items.length) return -1;
            else if (item1.icon === 'error' && item2.icon === 'warning') return -1;
            else if (item2.icon === 'error' && item1.icon === 'warning') return 1;
            return 0;
          });
          items.map((item) => item.items.length && sort(item.items));
        };
        sort(result);

        return result;
      }
    }
  };
</script>

<style scoped>
  .card-item {
    width: 100%;
    margin-top: 12px;
  }

  .source-list-item {
    font-stretch: normal;
    font-size: 16px;
    font-weight: 300;
  }

  .toggle-filter * {
    height: 24px !important;
  }

  .tree {
    overflow: auto;
    white-space: nowrap !important;
  }

</style>
