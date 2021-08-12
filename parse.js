const domParser = new DOMParser();

export const parseResponse = (response) => {
    let marks = -1;
    //performance.mark(++marks);
    const doc = domParser.parseFromString(response, 'text/html');
    //performance.mark(++marks);
    const table = doc.querySelector(':scope>body>table');
    //performance.mark(++marks);
    if (!table) { throw new Error('expected table in response!'); }
    const rows = table.querySelectorAll(':scope>tbody>tr');
    //performance.mark(++marks)
    const data = Array.prototype.map.call(rows, parseRow);
    //performance.mark(++marks)
    // for (let i = 0; i < marks; i++) {
    //     console.log(`part ${i}`, performance.measure(i, i, i + 1).duration);
    // }
    // console.log('total parse time', performance.measure('total', 0, marks).duration);
    // performance.clearMarks();
    return data;
    // console.log(rows);
    // console.log(table);
};

const unpackElements = (parent, specifiers) => {
    const elements = {};
    let node = parent.firstElementChild;
    for (const {key, selector} of specifiers) {
        if (!node || !node.matches(selector)) {
            console.error('selector mismatch', node, selector);
            throw new Error('epxected node to match selector');
        }
        elements[key] = node;
        node = node.nextElementSibling;
    }
    return elements;
};

const extractDate = (script) => {
    const match = /new Date\((\d+)\)/.exec(script.firstChild.data);
    return match ? +match[1] : null;
}

const htmlUnescape = (str) =>
    str.replace(/&#(\d+);/g, (_, x) => String.fromCharCode(x));

const extractGear = (script) => {
    const text = script.firstChild.data;
    const gear = [];
    const gearMap = new Map();
    for (const part of text.matchAll(/gear\.push\(([^)]+)\);/g)) {
        const json = part[1].replace(/(name|icon|quality|id|itemLevel):/g, '"$1":');
        const data = JSON.parse(json);
        data.name = htmlUnescape(data.name);
        gear.push(data);
        gearMap.set(data.id, data);
    }

    const worldBuffs = [];
    for (const part of text.matchAll(/worldBuffs\.push\(([^)]+)\);/g)) {
        const json = part[1].replace(/(name|icon|id):/g, '"$1":');
        const data = JSON.parse(json);
        data.name = htmlUnescape(data.name);
        worldBuffs.push(data);
    }
    const trinkets = [];
    const trinketsCell = /trinketsCell: '([^']+)'/.exec(text);
    if (trinketsCell) {
        for (const part of trinketsCell[1].matchAll(/item=(\d+)/g)) {
            const id = Number(part[1])
            trinkets.push(gearMap.get(id));
        }
    }

    return { gear, worldBuffs, trinkets };
};

const parseRow = (row) => {
    const data = {};
    const elements = unpackElements(row, [
        {key: 'rank', selector: 'td.rank'},
        {key: 'name', selector: 'td.main-table-name'},
        {key: 'video', selector: 'td.video-cell'},
        {key: 'ilvl', selector: 'td.ilvl-cell'},
        {key: 'primary', selector: 'td.main-table-number.primary'},
        {key: 'size', selector: 'td.players-table-size'},
        {key: 'date', selector: 'td.players-table-date'},
        {key: 'script', selector: 'script'},
        {key: 'duration', selector: 'td.players-table-duration'},
        {key: 'trinkets', selector: 'td.trinkets-cell'},
        {key: 'worldBuffs', selector: 'td.world-buffs-cell'},
        {key: 'restricted', selector: 'td.players-table-restricted'},
        {key: 'flag', selector: 'td.zmdi-flag'},
    ]);

    data.rank = Number(elements.rank.innerText.trim());
    data.rankName = elements.rank.classList[1];

    const nameColElements = unpackElements(elements.name.firstElementChild, [
        {key: 'name', selector: 'div.players-table-name'},
        {key: 'guildRealm', selector: 'div.players-table-guild-and-realm'},
        {key: 'charLink', selector: 'a[href]'},
    ]);

    const nameElements = unpackElements(nameColElements.name, [
        {key: 'icon', selector: 'img.sprite'},
        {key: 'name', selector: 'a.main-table-player'},
    ]);

    const guild = nameColElements.guildRealm.querySelector(':scope>a.players-table-guild');
    const realm = nameColElements.guildRealm.querySelector(':scope>a.players-table-realm');

    data.player = {
        iconClass: nameElements.icon.classList[2],
        name: nameElements.name.innerText.trim(),
        guild: guild && guild.innerText.trim(),
        realm: realm && realm.innerText.trim(),
        guildLink: guild && guild.getAttribute('href'),
        realmLink: realm && realm.getAttribute('href'),
        characterLink: nameColElements.charLink.getAttribute('href'),
    };

    data.battleLink = nameElements.name.getAttribute('href'),
    data.ilvl = Number(elements.ilvl.innerText.trim());
    data.primary = Number(elements.primary.innerText.trim());
    data.size = Number(elements.size.innerText.trim());
    data.timestamp = extractDate(elements.script);
    data.duration = elements.duration.innerText.trim();
    data.video = !elements.video.classList.contains('off')
            && elements.video.firstElementChild.getAttribute('href');

    const restricted = unpackElements(elements.restricted, [
        {key: 'restricted', selector: 'span'},
        {key: 'script', selector: 'script'},
    ]);
    Object.assign(data, extractGear(restricted.script));
    data.restricted = restricted.restricted.innerText.trim();
    //console.log(data);
    return data;
};
