import { parseResponse } from './parse.js';
import { hoverPopup } from './hover.js';
import { render, table } from './render.js';
import { addSorting } from './sort.js';

const isFFCombinedMetric = (metric) => 
    metric == "healercombineddps"
    || metric == "tankcombineddps"
    || metric == "healercombinedbossdps"
    || metric == "tankcombinedbossdps";

const params = {
    zoneID: 1500,
    metric: 'hps',
    boss: 1125,
    difficulty: 3,
    size: 40,
    partition: 5,
    class: 'Healers',
    spec: 'Any',
    specOne: 'Healers',
    specTwo: 'Any',
    bracket: 0,
    server: 0,
    region: 8,
    subregion: 0,
    leaderboards: 0,
    search: '',
    page: 1,
    affixes: 0,
    faction: 0,
    dpstype: 'wdps',
    restricted: 0,
    covenant: undefined,
    soulbind: undefined,
};

const buildUrl = (params) => {
    const ffCombined = isFFCombinedMetric(params.metric)

    const pathParams = [
        'zoneID', 'metric', 'boss', 'difficulty',
        'size', 'partition',
        ffCombined ? 'specOne' : 'class',
        ffCombined ? 'specTwo' : 'spec',
        'bracket', 'server', 'region', 'subregion',
        'leaderboards',
    ].map((key) => params[key]).join('/');

    const queryParams = [
        'search', 'page', 'affixes', 'faction', 'dpstype',
        'restricted', 'covenant', 'soulbind',
    ].map((key) => [key, params[key]]);
    const queryString = new URLSearchParams(queryParams).toString();

    return '/zone/rankings/table/' + pathParams + '/?' + queryString;
};

window.tableData = null
const update = () => {
    const vdom = table(window.tableData);
    const dom = render(vdom);
    while (target.lastChild) {
        target.removeChild(target.lastChild);
    }
    target.appendChild(dom);
};

const main = async() => {
    const response = await fetch(buildUrl(params));
    const text = await response.text();
    window.tableData = parseResponse(text);
    update();
};

const target = document.getElementById('target');
hoverPopup(target, '.hover');
addSorting(target);
main();
