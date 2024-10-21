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

const path = require('path');
const fs = require('fs');
const YAML = require('yaml');
const parser = require('./parser');

const sourceFileName = path.resolve(process.env.INIT_CWD, process.argv[2]);
const distanationFileName = path.resolve(process.env.INIT_CWD, 'manifest.yaml');

// eslint-disable-next-line no-console
console.log('Import file: ', sourceFileName);

fs.readFile(sourceFileName, 'utf8' , (err, yaml) => {
	if (err) {
		// eslint-disable-next-line no-console
		console.error(err);
		return;
	}

	parser.parse(YAML.parse(yaml));
	fs.writeFileSync(distanationFileName, YAML.stringify(parser.context));
	for (const filename in parser.files) {
		fs.writeFileSync(path.resolve(process.env.INIT_CWD, filename), parser.files[filename]);
	}
});
