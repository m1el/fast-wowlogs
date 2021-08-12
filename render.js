const has = Function.prototype.call.bind(Object.prototype.hasOwnProperty);

const abilityImages = 'https://assets.rpglogs.com/img/warcraft/abilities';

const zeroPad = (str, chars) => {
    str = String(str);
    const pad = chars - str.length;
    if (pad <= 0) {
        return str;
    }
    return '0000000000'.substr(0, pad) + str;
};

const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${zeroPad(month, 2)}-${zeroPad(day, 2)}`;
};

export const render = (node) => {
    if (typeof node === 'string' || typeof node === 'number') {
        return document.createTextNode(node);
    } else if (Array.isArray(node)) {
        const [tag, attrs] = node;
        const target = document.createElement(tag);
        for (const key in attrs) {
            if (!has(attrs, key)) { continue; }
            target.setAttribute(key, attrs[key])
        }
        for (let ii = 2; ii < node.length; ii++) {
            const child = node[ii];
            if (child == null) { continue; }
            target.appendChild(render(child));
        }
        return target;
    }
};
/*
        ['col', {class: 'col-rank', width: '40'}],
        ['col', {class: 'col-name', width: '180'}],
        ['col', {class: 'col-ilvl', width: '25'}],
        ['col', {class: 'col-hps', width: '75'}],
        ['col', {class: 'col-size', width: '50'}],
        ['col', {class: 'col-date', width: '85'}],
        ['col', {class: 'col-duration', width: '60'}],
        ['col', {class: 'col-trnk', width: '55'}],
        ['col', {class: 'col-worldbuffs', width: '195'}],
        ['col', {class: 'col-waited', width: '50'}],
*/

export const table = (data) =>
    ['table', 0,

        ['thead', 0,
            ['tr', 0,
                ['th', {class: 'col-rank', 'data-column': 'rank'}, 'rank'],
                ['th', {class: 'col-name', 'data-column': 'name'}, 'name'],
                ['th', {class: 'col-ilvl', 'data-column': 'ilvl'}, 'ilvl'],
                ['th', {class: 'col-hps', 'data-column': 'hps'}, 'hps'],
                ['th', {class: 'col-size', 'data-column': 'size'}, 'size'],
                ['th', {class: 'col-date', 'data-column': 'date'}, 'date'],
                ['th', {class: 'col-duration', 'data-column': 'duration'}, 'duration'],
                ['th', {class: 'col-trnk'}, 'trnk'],
                ['th', {class: 'col-worldbuffs'}, 'world buffs'],
                ['th', {class: 'col-waited'}, 'waited']]],
        ['tbody', 0, ...data.map(dataRow)]];

const dataRow = (row, index) =>
    ['tr', {'data-index': index},
        ['td', {class: 'col-rank'}, row.rank],
        ['td', {class: 'col-name'}, name(row)],
        ['td', {class: 'col-ilvl'}, row.ilvl],
        ['td', {class: 'col-hps'}, row.primary],
        ['td', {class: 'col-size'}, row.size],
        ['td', {class: 'col-date'}, row.timestamp && formatDate(row.timestamp)],
        ['td', {class: 'col-duration'}, row.duration],
        ['td', {class: 'col-trnk'}, ...row.trinkets.map(item)],
        ['td', {class: 'col-worldbuffs'}, ...row.worldBuffs.map(spell)],
        ['td', {class: 'col-waited'}, row.restricted]];

const name = (row) =>
    ['div', {class: 'name-block'},
        ['div', {class: 'name-part'},
            ['a', {href: row.battleLink}, row.player.name]],
        ['div', {class: 'guild-part'},
            ['a', {class: 'guild', href: row.player.guildLink}, row.player.guild],
            ['a', {class: 'realm', href: row.player.realmLink}, row.player.realm]]];

const spell = (info) =>
    ['a', {href: `https://tbc.wowhead.com/spell=${info.id}`},
        ['img', {
            class: 'icon hover',
            'data-id': `spell/${info.id}`,
            src: `${abilityImages}/${info.icon}`,
        }]];

const item = (info) =>
    ['a', {href: `https://tbc.wowhead.com/item=${info.id}`},
        ['img', {
            class: 'icon hover',
            'data-id': `item/${info.id}`,
            src: `${abilityImages}/${info.icon}`,
        }]];
