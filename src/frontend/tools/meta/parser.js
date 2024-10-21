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

module.exports = {
	files: {},
	idmap: {}, // Карта связей идентификаторов из данных в код
	data: [],
	context: {},
	// Определяет идентификатор контекста по идентификатору компонента
	getContextIDByComponentID(id) {
		const structID = id.split('.');
		return structID.slice(0, structID.length - 1).join('.');
	},
	// Преобразование GUID в ключ
	guidToKey(guid) {
		return guid.replace(/-/g, '_');
	},
	// Преобразование earepoCode в ключ
	earepoCodeToKey(earepoCode) {
		return earepoCode.replace(/\./g, '_');
	},
	// Создает строку размещения контекста
	makeContextLocation(id) {
		const currID = [];
		const location = [];
		id.split('.').map((part) => {
			currID.push(part);
			const context = this.context.contexts[currID.join('.')];
			location.push((context && context.title) || part);
		});
		return location.join('/');
	},
	// Поиск идентификатора по GUID
	searchElement(guid) {
		let result = null;
		for (const index in this.data.digitalArchitecture) {
			const element = this.data.digitalArchitecture[index];
			if ((element.guid === guid) || (element.yamlId === guid)) {
				result = element;
				break;
			}
		}
		return result;
	},
	// Создать структурированный идентификатор
	makeDeepID(id, prefix) {
		if (this.idmap[id]) return this.idmap[id];
		const element = this.searchElement(id);
		let deepid = (element && this.idmap[element.parentGuid]) || 'SBER';
		prefix && (deepid = `${deepid}.${prefix}`);
		deepid = `${deepid}.${this.guidToKey(id)}`;
		this.idmap[id] = deepid;
		// eslint-disable-next-line no-console
		console.info('deepid=', deepid);
		return deepid;
	},
	parseDefaultSystemFields(element) {
		const result = {
			title: element.name,
			guid: element.guid,
			type: 'type: Целевая, внедрено полностью',
			status: element.status,
			statusC3: element.statusC3,
			criticality: element.criticality,
			targetStatus: element.targetStatus,
			targetReadiness: element.targetReadiness,
			systemType: element.systemType,
			nicknameEng: element.nicknameEng,
			shortDescription: element.shortDescription,
			dateLastChange: element.dateLastChange,
			receivedDataConfLevel: element.receivedDataConfLevel,
			receivedDataIntegrityLevel: element.receivedDataIntegrityLevel,
			ciiCategory: element.ciiCategory
		};
		element.fullName && (result.fullname = element.fullName);
		return result;
	},
	parseSystem(element) {
		const system = this.parseDefaultSystemFields(element);
		system.entity = 'system';

		// eslint-disable-next-line no-console
		console.log('Detected system ', system.title);

		const deepID = this.makeDeepID(element.guid, element.centralizationLevel);
		const deepIDStruct = deepID.split('.');

		// Строим контекст уровня централизации
		const cLevel = `${deepIDStruct[0]}.${deepIDStruct[1]}`;
		const cLevelContext = this.context.contexts[cLevel] || (
			this.context.contexts[cLevel] = {
				title: deepIDStruct[1],
				uml: {
					$notation: 'Sber',
					$version: 'v1.0'
				},
				components: []
			}
		);
		cLevelContext.location = this.makeContextLocation(cLevel);
		cLevelContext.components.push(deepID);

		// Создаем компонент
		this.context.components[deepID] = system;
		this.context.contexts[deepID] = {
			title: system.title,
			components: []
		};
		// Генерируем предопределенные контексты
		[
			{ key: 'subsystems', title: 'Подсистемы'},
			{ key: 'tc', title: 'Техкомпоненты'},
			{ key: 'ip', title: 'Точки интеграции'}
		].map((element) => {
			const contextID = `${deepID}.${element.key}`;
			this.context.contexts[contextID] = {
				title: element.title,
				components: []
			};
			this.context.contexts[contextID].location = this.makeContextLocation(contextID);
			this.context.namespaces[contextID] = {
				title: element.title
			};
		});

		this.context.contexts[deepID].location = this.makeContextLocation(deepID);

		// Строим контекст уровня Сбер
		if (!this.context.components[cLevel]) {
			this.context.components[cLevel] = {
				title: deepIDStruct[1],
				entity: 'system'
			};
			this.context.contexts.SBER.components.push(cLevel);
			this.context.namespaces[cLevel] = {
				title: deepIDStruct[1]
			};
		}

		this.context.namespaces[deepID] = {
			title: system.title
		};
	},
	parseSubSystem(element) {
		const subSystem = this.parseDefaultSystemFields(element);
		subSystem.entity = 'component';

		// eslint-disable-next-line no-console
		console.log('Detected subsystem ', subSystem.title);

		const deepID = this.makeDeepID(element.guid, 'subsystems');

		this.context.components[deepID] = subSystem;
		this.context.contexts[deepID] = {
			title: subSystem.title,
			components: []
		};
		this.context.contexts[deepID].location = this.makeContextLocation(deepID);

		const subsystemsContextID = this.getContextIDByComponentID(deepID);
		this.context.contexts[subsystemsContextID].components.push(deepID);
		const systemContextID = subsystemsContextID.split('.').slice(0, -1).join('.');
		this.context.contexts[systemContextID].components.push(deepID);
		this.context.namespaces[deepID] = {
			title: subSystem.title
		};
	},

	parseModule(element) {
		const module = {
			title: element.name,
			entity: 'component'
		};

		// eslint-disable-next-line no-console
		console.log('Detected module ', module.title);

		const deepID = this.makeDeepID(element.guid);

		this.context.contexts[deepID] = {
			title: module.title,
			components: []
		};
		this.context.contexts[deepID].location = this.makeContextLocation(deepID);

		this.context.contexts[this.getContextIDByComponentID(deepID)].components.push(deepID);
		this.context.components[this.makeDeepID(element.guid)] = module;
		this.context.namespaces[deepID] = {
			title: module.title
		};
	},
	parseSubModule(element) {
		const submodule = {
			title: element.name,
			entity: 'component'
		};

		// eslint-disable-next-line no-console
		console.log('Detected submodule ', submodule.title);

		const deepID = this.makeDeepID(element.guid);
		this.context.contexts[this.getContextIDByComponentID(deepID)].components.push(deepID);
		this.context.components[this.makeDeepID(element.guid)] = submodule;
	},
	// Парсинг интеграций
	parseIntegrationInteraction(element) {
		const deepID =  this.makeDeepID(element.parentYamlId);
		const subject = this.context.components[deepID];
		subject.links = subject.links || [];
		const externDeepID = `SBER.SBERBANK.${this.guidToKey(element.externalSystem.yamlId)}`;
		this.context.components[externDeepID] || (
			this.context.components[externDeepID] = {
				title: element.externalSystem.name,
				entity: 'system'
			}
		);
		subject.links.push({
			id: externDeepID,
			title: element.name,
			direction: '<--d-->'
		});
	},
	// Парсинг точек взаимодействия
	IntegrationPoint(element) {
		// eslint-disable-next-line no-console
		console.log('Detected integration point ', element.name);

		const ownerDeepID = this.idmap[element.parentYamlId];
		const contextDeepID = `${ownerDeepID}.ip`;
		const deepID = `${contextDeepID}.${this.earepoCodeToKey(element.earepoCode)}`;

		const component = (this.context.components[deepID] = {
			title: `${element.name}\\n${element.type}`,
			entity: 'interface',
			approvalStatus: element.approvalStatus
		});

		switch (element.type.toLowerCase()) {
		case 'queue': component.entity = 'queue'; break;
		case 'mail': component.entity = 'artifact'; break;
		case 'http': component.entity = 'cloud'; break;
		default: component.entity = 'interface';
		}

		this.context.contexts[contextDeepID].components.push(deepID);
		this.context.contexts[contextDeepID.split('.').slice(0, -1).join('.')].components.push(deepID);

		const links = [];
		element.externalSystems && element.externalSystems.map((system) => {
			let deepID = this.idmap[system.yamlId];
			if (!deepID) {
				deepID = `SBER.SBERBANK.${this.guidToKey(system.yamlId)}`;
				this.context.components[deepID] = {
					entity: 'system',
					title: system.name
				};
				this.context.contexts['SBER.SBERBANK'].components.push(deepID);
				const ownerLinks = this.context.components[ownerDeepID].links || [];
				// eslint-disable-next-line no-console
				console.info('ownerDeepID=', ownerDeepID);
				ownerLinks.push({
					id: deepID,
					title : element.name,
					direction: '<-->'
				});
				this.context.components[ownerDeepID].links = ownerLinks;
				this.context.contexts[ownerDeepID].components.push(deepID);
			}
			links.push({
				id: deepID,
				title: system.name,
				direction: '--'
			});
		});
		links.length && (this.context.components[deepID].links = links);
	},
	// Парсинг технических компонентов
	parseTechnologicalComponent(element) {
		// eslint-disable-next-line no-console
		console.log('Detected technological component ', element.name);

		const ownerDeepID = this.makeDeepID(element.parentYamlId);
		const zoneDeepID = `${ownerDeepID}.tc.${element.networkSecurityZoneSegment.toLowerCase()}`;
		this.context.namespaces[zoneDeepID] = {
			title: element.networkSecurityZoneSegment
		};

		const deepID = `${zoneDeepID}.${this.earepoCodeToKey(element.earepoCode)}`;
		this.idmap[element.yamlId] = deepID;

		this.context.components[deepID] = {
			title: element.name,
			entity: 'node',
			earepoCode: element.earepoCode,
			technologyGroupLabel: element.technologyGroupLabel,
			technologyTypeLabel: element.technologyTypeLabel,
			technologyLabel: element.technologyLabel,
			technologies: [
				element.technologyCode.toLowerCase()
			]
		};

		this.context.technologies.sections[element.technologyGroupCode] = {
			title: element.technologyGroupLabel
		};

		this.context.technologies.items[element.technologyCode.toLowerCase()] = {
			title: element.technologyGroupLabel,
			section: element.technologyGroupCode,
			status: 'adopt'
		};

		this.context.contexts[`${ownerDeepID}.tc`].components.push(deepID);
		this.context.contexts[ownerDeepID].components.push(deepID);

	},
	// Взаимодействие технологических компонентов
	TechnologicalInteraction(element) {
		// eslint-disable-next-line no-console
		console.log('Detected technological component ', element.name);

		const consumerDeepID = this.idmap[element.consumerTechnologicalComponentYamlId];
		const producerDeepID = this.idmap[element.producerTechnologicalComponentYamlId];

		const links = this.context.components[consumerDeepID].links || [];
		links.push({
			id: producerDeepID,
			title: element.description,
			direction: '<--'
		});
		this.context.components[consumerDeepID].links = links;
	},
	// Сценарий взаимодействия
	InteractionScenario(element) {
		// eslint-disable-next-line no-console
		console.log('Detected interaction scenario ', element.name);
		const ownerDeepID = this.idmap[element.parentYamlId];
		const owner = this.context.components[ownerDeepID];
		const deepID = `IS.${this.earepoCodeToKey(element.earepoCode)}`;
		this.context.docs[deepID] = {
			location: `${owner.title}/Взаимодействия/${element.name}`,
			description: element.name,
			type: 'plantuml',
			source: `${deepID}.puml`,
			subjects: [ownerDeepID]
		};

		const aliases = {};
		const content = [];
		(element.steps || []).map((step) => {
			const element = this.searchElement(step.technologicalInteractionYamlId);
			const consumerDeepID = this.idmap[element.consumerTechnologicalComponentYamlId];
			const consumer = this.context.components[consumerDeepID];
			aliases[consumerDeepID] = `participant "[[/architect/components/${consumerDeepID} ${consumer.title}]]" as ${consumerDeepID}`;

			const producerDeepID = this.idmap[element.producerTechnologicalComponentYamlId];
			const producer = this.context.components[producerDeepID];
			aliases[producerDeepID] = `participant "[[/architect/components/${producerDeepID} ${producer.title}]]" as ${producerDeepID}`;

			content.push(`${producerDeepID} -> ${consumerDeepID}: ${element.description}`);
		});

		let uml = `@startuml\ntitle [[/architect/components/${ownerDeepID} ${owner.title}]]\ngroup ${element.name}\n`;
		for (const key in aliases) {
			uml += `${aliases[key]}\n`;
		}
		uml += content.join('\n');
		uml += '\nend\n@enduml';

		// eslint-disable-next-line no-console
		console.info(uml.split('\n'));

		this.files[`${deepID}.puml`] = uml;
	},
	// Парсинг выгрузки из Meta
	parse(data) {
		this.files = {};
		this.data = data;
		this.idmap = {};
		this.context = {
			components: {
				SBER : {
					title: 'Сбер',
					entity: 'system'
				}
			},
			contexts: {
				SBER: {
					title: 'Сбер',
					location: 'Сбер',
					components: [],
					uml: {
						$notation: 'Sber',
						$version: 'v1.0'
					}
				}
			},
			namespaces: {
				SBER: {
					title: 'Сбер'
				}
			},
			technologies: {
				sections: {
					storages : {
						title: 'Хранилища'
					}
				},
				items: {

				}
			},
			docs: {

			}
		};
		data.digitalArchitecture && data.digitalArchitecture.map((element) => {
			switch (element.kind.toLowerCase()) {
			case 'system': this.parseSystem(element); break;
			case 'subsystem': this.parseSubSystem(element); break;
			case 'module': this.parseModule(element); break;
			case 'submodule': this.parseSubModule(element); break;
			case 'integrationinteraction': this.parseIntegrationInteraction(element); break;
			case 'technologicalcomponent': this.parseTechnologicalComponent(element); break;
			case 'technologicalinteraction': this.TechnologicalInteraction(element); break;
			case 'integrationpoint': this.IntegrationPoint(element); break;
			case 'interactionscenario': this.InteractionScenario(element); break;
			default:
				// eslint-disable-next-line no-console
				console.error(`Неопределенный тип компонента [${element.kind}]`);
			}
		});

		return this.context;
	}
};
