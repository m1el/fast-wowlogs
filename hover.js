let currentPopup = null;

const tooltip = 'https://tbc.wowhead.com/tooltip';
const images = 'https://assets.rpglogs.com/img/warcraft/abilities';
const tooltipCls = 'wowhead-tooltip wowhead-tooltip-width-restriction wowhead-tooltip-width-320';

const cache = new Map();
const getTooltip = async (id) => {
    if (cache.has(id)) {
        return cache.get(id);
    } else {
        const dataPromise = fetch(`${tooltip}/${id}`)
            .then(response => response.json());
        cache.set(id, dataPromise);
        try {
            return await dataPromise;
        } catch(e) {
            cache.delete(id);
            throw e;
        }
    }
};

const loadData = async (popup) => {
    if (popup.requested) { return; }
    popup.requested = true;
    const data = await getTooltip(popup.id);
    if (popup !== currentPopup) { return; }
    // ew, but not much we can do about this
    popup.element.innerHTML = [
        '<table><tr><td>',
        `<img class="popup-image" src="${images}/${data.icon}.jpg">`,
        data.tooltip,
        '</td></tr></table>',
    ].join('');
    popup.w = popup.element.offsetWidth;
    popup.h = popup.element.offsetHeight;
    layoutPopup(popup);
};

const pad = {
    left: 80,
    right: 25,
    top: 10,
    bottom: 10,
};

const clamp = (x, min, max) => Math.max(min, Math.min(max, x));
const layoutPopup = (popup) => {
    const { x, y, w, h } = popup;
    popup.x = clamp(x, pad.left, window.innerWidth - w - pad.right);
    popup.y = clamp(y, pad.top, window.innerHeight - h - pad.bottom);
    popup.element.style.left = `${popup.x}px`;
    popup.element.style.top = `${popup.y}px`;
};

export const hoverPopup = (element, selector) => {
    const clearPopup = () => {
        const element = currentPopup && currentPopup.element
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
        currentPopup = null;
    };

    const setPopup = (id, x, y) => {
        if (!currentPopup || currentPopup.id !== id) {
            clearPopup();
            const element = document.createElement('div')
            element.className = tooltipCls;
            element.dataset.visible = 'yes';
            element.appendChild(document.createTextNode('Loading...'));
            document.body.appendChild(element);
            const w = element.offsetWidth;
            const h = element.offsetHeight;
            currentPopup = { id, element, w, h };
            loadData(currentPopup);
        };
        currentPopup.x = x;
        currentPopup.y = y + 10;
        layoutPopup(currentPopup);
    };

    const onHover = (event) => {
        const target = event.target;
        if (!target || !target.matches(selector)) {
            clearPopup();
            return;
        }
        const nextId = target.getAttribute('data-id');
        setPopup(nextId, event.clientX, event.clientY);
    };

    element.addEventListener('mousemove', onHover);

    return () => {
        event.removeEventListener('mousemove', onHover);
    };
};
