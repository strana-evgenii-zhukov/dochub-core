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

/* Модуль работы с плагинами */
import Vue from 'vue';
import requests from '@front/helpers/requests';
import env from '@front/helpers/env';

const plugins = {
	documents: [],
	// Все ранее зарегистрированные плагины переносим в основной менеджер
	pull() {
		this.documents.forEach((el) => DocHub.registerDocuments(el.type, el.component));
	}
};

// Регистрируем временный менеджер регистрации плагинов
window.DocHub = {
	documents: {
		register(type, component) {
			plugins.documents.push({ type, component });
		},
		fetch() {
			return JSON.parse(JSON.stringify(plugins.documents));
		}
	}
};

export default {
	namespaced: true,
	state: {
		ready: false, // Признак готовности плагинов к использованию
		documents: {}
	},
	mutations: {
		setReady(state, value) {
			state.ready = value;
		},
		registerDocument(state, document) {
			state.documents[document.type] = document.component;
		}
	},
	actions: {
		// Загружаем плагины
		init(context) {
			// Регистрируем менеджер документов для плагинов
			window.DocHub.documents.register = function(type, component) {
				component.mixins = component.mixins || [];
				Vue.component(`plugin-doc-${type}`, component);
				context.commit('registerDocument', { type, component });
			};
			// Регистрируем функцию получения доступных типов документов
			window.DocHub.documents.fetch = () => {
				return JSON.parse(JSON.stringify(Object.keys(context.state.documents || {})));
			};
			plugins.pull();

			let counter = 0;

			// Получаем данные манифеста приложения
			!env.isPlugin() && requests.request('/manifest.json', new URL('/', window.location)).then((response) => {
				(response?.data?.plugins || []).map((url) => {
					counter++;

					const decCounter = () => !(--counter) && context.commit('setReady', true);

					const script = document.createElement('script');
					script.src = url;
					script.onload = function() {
						// eslint-disable-next-line no-console
						console.info(`Плагина [${url}] успешно подключен`);
						decCounter();
					};
					script.onerror = (e) => {
						// eslint-disable-next-line no-console
						console.error(`Ошибка загрузки плагина [${url}]`, e);
						decCounter();
					};
					document.head.appendChild(script);

					if (!counter) context.commit('setReady', true);
				});
			}).catch((e) => {
				// eslint-disable-next-line no-console
				console.error('Не удалось загрузить манифест приложения', e);
				context.commit('setReady', true);
			});
		}
	}
};
