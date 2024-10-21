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

// Модуль реализует наследование
export default {
    // Создает связь потомка и родителя
    makePrototype(parent, child) {
        return (() => {
            let cache = null;

            const allProps = () => {
                if (cache) return cache;
                const result = {};
                for (const propId in child) result[propId] = child;
                for (const propId in parent || {})
                    !result[propId] && (result[propId] = parent);
                return cache = result;
            };
    
            return new Proxy(child, {
                get: (target, propId) => {
                    if (propId === '__parent__') return parent;
                    return allProps()[propId]?.[propId];
                },
                enumerate: () => Object.keys(allProps()),
                iterate: () => Object.keys(allProps()),
                ownKeys: () => Object.keys(allProps()),
                getPropertyNames: () => Object.keys(allProps()),
                getOwnPropertyNames: () => Object.keys(allProps()),
                getOwnPropertyDescriptor: () => ({
                    enumerable: true,
                    configurable: true
                })
            });
        })();
    },

    // section - секция объектов требующих обработки
    expandSection(manifest, sectionId) {
        const section = manifest?.[sectionId] || {};
        for (const key in section) {
            const protoPath = section[key].$prototype;
            if (protoPath) {
                if (section[key].__setPrototype__) section[key].__setPrototype__(sectionId, protoPath);
                else section[key] = this.makePrototype(section[protoPath], section[key]);
            }
        }
    },

    // manifest - манифест
    expandAll(manifest) {
        const sections = Object.keys(manifest?.entities || {});
        sections.push('entities');
        sections.map((sectionId) => this.expandSection(manifest, sectionId));
        return manifest;
    }
};
