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
    R.Piontik <R.Piontik@mail.ru>

Contributors:
    R.Piontik <R.Piontik@mail.ru>
*/

// Обеспечивает подключение к Redis
import logger from '../utils/logger.mjs';
import { createClient } from 'redis';

const LOG_TAG = 'redis-driver';

let client = null;

export default async function() {
    if (client) return client;
    const url = process.env.VUE_APP_DOCHUB_REDIS_URL;
    client = url ? createClient({url}) : createClient();
    client.on('error', err => logger.error(`Error of redis client: ${err.toString()}`, LOG_TAG));
    try {
        await client.connect();
        logger.log('Redis client is enabled', LOG_TAG);
        return client;
    } catch (error) {
        logger.error(`Failed to connect to Redis: ${error.message}`, LOG_TAG);
        throw error;
    }
}
