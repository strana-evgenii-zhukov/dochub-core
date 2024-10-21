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

// Сервис кэширования.
// Должен реализовываться для каждого случая развертывания.
// По умолчанию является MOC
export default {
    // Резолвит URL
    // eslint-disable-next-line no-unused-vars
    makeURIByBaseURI(URL, BaseURL) {
        // eslint-disable-next-line no-console
        console.warn('makeURIByBaseURI method of cache service is not realized.');
        return URL;
    },
    // Вызывается при перед запуском процесса парсинга манифестов
    start() {
        // eslint-disable-next-line no-console
        console.warn('Start method of cache service is not realized.');
    },
    // Обработка запроса на файл манифеста
    // url - ссылка на файл манифеста
    // path - путь к свойству от корня манифеста
    // Результат - axios response, если null, то требует игнорирования
    async request(url, path) {
        // eslint-disable-next-line no-console
        throw `Request method of cache service is not realized. url=[${url}] path=[${path}]`;
    },
    // Вызывается после завершения процесса парсинга манифестов
    finish() {
        // eslint-disable-next-line no-console
        console.warn('Finish method of cache service is not realized.');
    }
};
