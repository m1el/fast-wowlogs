let sortConfig = {
    field: 'rank',
    ascending: true,
};

const getters = {
    rank: (x) => x.rank,
    name: (x) => x.player.name,
    ilvl: (x) => x.ilvl,
    hps: (x) => x.primary,
    size: (x) => x.size,
    date: (x) => x.timestamp,
    duration: (x) => x.duration,
};

const makeOpenRange = (start, end) => {
    const range = [];
    for (let ii = start; ii < end; ii++) {
        range.push(ii);
    }
    return range;
};

const handleSort = (field) => {
    const tableData = window.tableData;
    const ascending = sortConfig.field === field ? !sortConfig.ascending : true;
    sortConfig = { field, ascending };
    const table = document.querySelector('#target>table');
    const tbody = table.querySelector(':scope>tbody');
    const rows = new Array(tableData.length);
    table.removeChild(tbody);
    while (tbody.lastChild) {
        const row = tbody.lastChild;
        tbody.removeChild(row);
        rows[row.dataset.index] = row;
    }
    const indices = makeOpenRange(0, tableData.length);
    const getter = getters[field];
    const direction = ascending ? 1 : -1;
    const cmp = (a, b) => (a > b) - (a < b);
    indices.sort((a, b) => {
        a = getter(tableData[a]);
        b = getter(tableData[b]);
        return cmp(a, b) * direction;
    });
    for (let ii = 0; ii < indices.length; ii++) {
        tbody.appendChild(rows[indices[ii]]);
    }
    table.appendChild(tbody);
};

export const addSorting = (target) => {
    const listener = (event) => {
        const target = event.target;
        if (!target || !target.matches('table>thead>tr>th')) {
            return;
        }
        const column = target.dataset.column;
        if (column) {
            event.preventDefault();
            event.stopPropagation();
            handleSort(column);
        }
    };
    console.log('ad')
    target.addEventListener('mousedown', listener);
    return () => {
        target.removeEventListener('mousedown', listener);
    };
};
