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

export default {
    methods: {
        // Генерируем контент для SVG
        exdMakeSVGDataURL(svg) {
            const svgEncoded = window.btoa(unescape(encodeURIComponent(svg)));
            return `data:image/svg+xml;base64,${svgEncoded}`;
        },
        // Генерируем контент для SVG
        exdMakeJSONDataURL(json) {
            const jsonEncoded = window.btoa(unescape(encodeURIComponent(json)));
            return `data:application/json;base64,${jsonEncoded}`;
        },
        // Добавляет связь
        exdAppendLink(context, track) {
            const box = {
                x: null,
                y: null,
                dx: null,
                dy: null
            };

            // Рассчитываем прямоугольник в который вмещается путь
            track.path.map((point) => {
                if ((box.x === null) || (box.x > point.x)) {
                    box.x = point.x;
                }
                if ((box.dx === null) || (box.dx < point.x)) {
                    box.dx = point.x;
                }
                if ((box.y === null) || (box.y > point.y)) {
                    box.y = point.y;
                }
                if ((box.dy === null) || (box.dy < point.y)) {
                    box.dy = point.y;
                }
            });

            // Приводим массив к относительным координатам
            const points = track.path.map((point) => [point.x - box.x, point.y - box.y]);

            // Применяем связь на элементы
            context.elements.map((element) => {
                if ((element.type === 'image') && ((element.id === track.link.from) || (element.id === track.link.to))) {
                    element.boundElements.push({
                        type: 'arrow',
                        id: track.id
                    });
                }
            });

            context.elements.push(    {
                'id': track.id,
                'type': 'arrow',
                'x': box.x,
                'y': box.y,
                'width': box.dx - box.x,
                'height': box.dy - box.y,
                'angle': 0,
                'strokeColor': '#3495DB',
                'backgroundColor': 'transparent',
                'fillStyle': 'solid',
                'strokeWidth': 1,
                'strokeStyle': 'solid',
                'roughness': 0,
                'opacity': 100,
                'groupIds': [],
                'roundness': null,
                'version': 1,
                'isDeleted': false,
                'boundElements': null,
                'updated': Date.now(),
                'link': null,
                'locked': false,
                'points': points,
                'lastCommittedPoint': null,
                'startBinding': {
                    elementId: track.link.to,
                    focus: 0,
                    gap: 12
                },
                'endBinding': {
                    elementId: track.link.from,
                    focus: 0,
                    gap: 12
                },
                'startArrowhead': (track.link.style || '-').slice(-1) === '>' ? 'arrow': null,
                'endArrowhead': (track.link.style || '-').slice(0, 1) === '>' ? 'arrow': null
              }
          );
        },
        // Добавляет все связи
        exdAppendLinks(context) {
            this.presentation.tracks.map((track) => this.exdAppendLink(context, track));
        },
        // Добавляет текст в элементы
        exdAppendText(context, text, id, x, y, width, height, fontSize, align, groups) {
            context.elements.push({
                id,
                type: 'text',
                x: x,
                y: y,
                width: width || 64,
                height: height || 35,
                angle: 0,
                strokeColor: '#000003',
                backgroundColor: 'transparent',
                fillStyle: 'solid',
                strokeWidth: 1,
                strokeStyle: 'solid',
                roughness: 0,
                opacity: 100,
                groupIds: groups || [],
                roundness: null,
                version: 1,
                isDeleted: false,
                boundElements: null,
                updated: Date.now(),
                link: null,
                locked: false,
                text: text,
                fontSize: fontSize || 12,
                fontFamily: 3,
                textAlign: align || 'left',
                verticalAlign: 'top',
                baseline: 25,
                containerId: null,
                originalText: text
              }
            );
        },
        // Выгружаем ноды
        exdExportNodes(context) {
            const now = Date.now();
            for (const id in this.presentation.map) {
                const box = this.presentation.map[id];
                const group = `group-${id}`;
                if (box.node.subitems && Object.keys(box.node.subitems).length) {
                    context.elements.push({
                        id,
                        type: 'rectangle',
                        x: box.absoluteX,
                        y: box.absoluteY,
                        width: box.width,
                        height: box.height,
                        angle: 0,
                        strokeColor: '#00000',
                        backgroundColor: 'transparent',
                        fillStyle: 'none',
                        strokeWidth: 1,
                        strokeStyle: 'solid',
                        roughness: 1,
                        opacity: 60,
                        groupIds: [group],
                        roundness: {
                            type: 3
                        },
                        version: 1,
                        isDeleted: false,
                        boundElements: null,
                        updated: now,
                        link: null,
                        locked: false
                    });
                    box.node.title && this.exdAppendText(
                        context,
                        box.node.title,
                        `text-${id}`,
                        box.absoluteX + 16,
                        box.absoluteY,
                        box.width - 16,
                        16,
                        14,
                        'left',
                        [group]
                    );
                } else {
                    context.elements.push({
                        id,
                        type: 'image',
                        x: box.absoluteX,
                        y: box.absoluteY,
                        width: box.width,
                        height: box.height,
                        angle: 0,
                        strokeColor: 'transparent',
                        backgroundColor: '#fa5252',
                        fillStyle: 'solid',
                        strokeWidth: 1,
                        strokeStyle: 'solid',
                        roughness: 2,
                        opacity: 100,
                        groupIds: [group],
                        roundness: null,
                        version: 1,
                        isDeleted: false,
                        boundElements: [],
                        updated: now,
                        link: null,
                        locked: false,
                        status: 'saved',
                        fileId: `dh_${box.node.symbol}`,
                        scale: [1, 1]
                    });

                    this.exdAppendText(
                        context,
                        box.node.title,
                        `text-${id}`,
                        box.absoluteX,
                        box.absoluteY + box.height - 4,
                        box.width,
                        16,
                        14,
                        'center',
                        [group]
                    );
                }
            }
        },
        // Выгружаем символы
        exdExportSymbols(context) {
            const files = {};
            const now = Date.now();
            this.symbols.map((symbol) => {
                const bbox = this.$el.getElementById(symbol.id)?.getBBox() || {width: 1, height: 1};
                const svg = `
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        xmlns:xlink="http://www.w3.org/1999/xlink"
                        viewBox="0 0 ${bbox.x + bbox.width} ${bbox.y + bbox.height}"
                        encoding="UTF-8"
                        version="1.1">
                        ${symbol.content}
                    </svg>
                    `;

                files[`dh_${symbol.id}`] = {
                    id: `dh_${symbol.id}`,
                    mimeType: 'image/svg+xml',
                    dataURL: this.exdMakeSVGDataURL(svg),
                    created: now,
                    lastRetrieved: now
                };
            });
            context.files = files;
        },
        // Скачиваем результат работы
        exdDownload(context, params) {
            const content = JSON.stringify(context, null, 2);
            if (params?.handler) {
                params?.handler(content);
            } else {
                const link = document.createElement('a');
                document.body.appendChild(link);
                link.href = this.exdMakeJSONDataURL(content);
                link.download = `${Date.now()}.excalidraw`;
                link.click();
                this.$nextTick(() => document.body.removeChild(link));
            }
        },
        // Генерируем файл
        exdExportToExcalidraw(params) {
            const context = {
                type: 'excalidraw',
                version: 2,
                source: 'https://excalidraw.com',
                elements : []
            };
            this.exdExportSymbols(context);
            this.exdExportNodes(context);
            this.exdAppendLinks(context);
            this.exdDownload(context, params);
        }
    },
    computed: {
    },
    watch: {
    },
    data() {
        return {
        };
    },
    mounted() {
        this.$on('exportToExcalidraw', (params) => this.exdExportToExcalidraw(params));
    }
};
