const thumbnail_path = root + 'assets/images/cartes/thumbnails/';

const WHITE = 1;
const RED   = 2;
const BLUE  = 4;
const GREEN = 8;
const BLACK = 16;



const CardPool = {
    data: null,
    main: null,
    modal: null,
    toolbar: null,
    cards: [],
    filters: {
        sortby: 'added_desc',
        type: '',
        colorless: false,
        blue: false,
        green: false,
        red: false,
        black: false,
        white: false
    },


    init: async function (data) {
        this.data = data;
        this.modal = new CardModal;
        this.main = query('main');

        this.getCards().then(cards => {
            this.cards = cards;
            this.setFilters();

            this.container = create('article');
            this.toolbar = this.renderToolbar();

            this.container.append(this.renderCards(this.cards));
            this.main.replaceChildren(this.toolbar, this.container);
        }).catch((err) => {
            MessageModal.alert(err, () => {
                document.location.href = root;
            });
        });
    },


    getCards: async function() {
        try {
            const result = await Brainstorm.getCards();
            if (result.success) {
                result.rows.forEach(info => {
                    let legend = info.type;
                    if (info.supertype) legend = info.supertype + ' ' + legend;
                    if (info.subtype) legend = legend + ' - ' + info.subtype;
            
                    let desctext = this.renderTextSymbols(info.description);
                    if(info.flavor) desctext += `<hr><i>${info.flavor}</i>`;
            
                    let thumb_small = null;
                    let thumb_medium = null;
                    let thumb_large = null;
                    if (info.image) {
                        if (info.image.webp_small) thumb_small = thumbnail_path + info.image.webp_small;
                        if (info.image.webp_medium) thumb_medium = thumbnail_path + info.image.webp_medium;
                        if (info.image.webp_large) thumb_large = thumbnail_path + info.image.webp_large;
                    }
            
                    let power_toughness = null;
                    if (["Creature", "Artifact Creature"].includes(info.type)) power_toughness = info.power + '/' + info.toughness;

                    let costrender = this.trimBraces(info.cost);
                    let realcost = 0;

                    let colors = { blue: 0, red: 0, green: 0, white: 0, black: 0, colorless: 0 };
                    const matches = [...costrender.matchAll(/\{(.*?)\}/g)].map(m => m[1]);
                    matches.forEach(v => {
                        v = v.toUpperCase();
                        realcost += isNaN(v) ? 1 : parseInt(v);
                        if(!isNaN(v)) colors.colorless = true;
                        else {
                            if(v.includes('R')) colors.red = RED;
                            if(v.includes('G')) colors.green = GREEN;
                            if(v.includes('U')) colors.blue = BLUE;
                            if(v.includes('W')) colors.white = WHITE;
                            if(v.includes('B')) colors.black = BLACK;
                        }
                    });

                    const colorsum = Object.entries(colors).reduce((t, [k,v]) => k === 'colorless' ? t : t | v, 0);

                    info.computed = {
                        name: info.name,
                        legend: legend,
                        thumb_small: thumb_small,
                        thumb_medium: thumb_medium,
                        thumb_large: thumb_large,
                        cost: costrender,
                        cost_real: realcost,
                        cost_render: this.renderSymbols(costrender),
                        power_toughness: power_toughness,
                        description: desctext,
                        colorsum: colorsum,
                        colors: colors,
                    };
                });

                return result.rows;
            } else {
                throw result.errmsg;
            }
        } catch (err) {
            return Promise.reject(err);
        }
    },

    setFilters: function(filters = {}) {
        this.filters = { ...this.filters, ...filters };

        const [name, order] = this.filters.sortby.split('_');
        switch(name) {
            case 'added': 
                this.cards.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'modified':
                this.cards.sort((a, b) => new Date(a.lastModifiedAt) - new Date(b.lastModifiedAt));
                break;
            case 'name':
                this.cards.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'cost':
                this.cards.sort((a, b) => { if (a.computed.cost_real === b.computed.cost_real) { return a.name.localeCompare(b.name); } return a.computed.cost_real - b.computed.cost_real; });
                break;
            case 'power':
                this.cards.sort((a, b) => { if (a.power === b.power) { return a.name.localeCompare(b.name); } return a.power - b.power; });
                break;
            case 'toughness':
                this.cards.sort((a, b) => { if (a.toughness === b.toughness) { return a.name.localeCompare(b.name); } return a.toughness - b.toughness; });
                break;
        }
        if(order == 'desc') this.cards.reverse();

        this.filters.inclusive_sum = Object.entries({ red: RED, green: GREEN, blue: BLUE, white: WHITE, black: BLACK })
            .reduce((sum, [color, bit]) => this.filters[color] ? sum | bit : sum, 0);

        this.cards.forEach(card => card.display = this.isCardDisplay(card));
    },


    isCardDisplay: function(info) {
        if(this.filters.type && this.filters.type != info.type.toLowerCase()) return false;
        if(this.filters.colorless) return info.computed.colorsum ? false : true;
        if(!this.filters.inclusive_sum) return true;
        if(!info.computed.colorsum  && this.filters.inclusive_sum) return false;
        return (info.computed.colorsum & this.filters.inclusive_sum) === info.computed.colorsum;
    },


    renderToolbar: function() {
        const toolbar = create('div', 'card-toolbar');
        const cell1 = toolbar.create('div', 'card-toolbar__column');
        
        const cell_sort = cell1.create('select');
        this.data.sortby.forEach((v, i) => {
            const val = v.name + '_' + v.order;
            cell_sort.create('option', '', v.title).value = val;
            if(this.filters.sortby == val) cell_sort.selectedIndex = i;
        });
        cell_sort.addEventListener('change', e => {
            this.sortBy(cell_sort.value);
        });
        
        const cell_type = cell1.create('select');
        cell_type.create('option', '', 'Tous les types').value = '';
        this.data.types.forEach(v => { cell_type.create('option', '', v.title).value = v.name; });
        cell_type.addEventListener('change', e => {
            this.sortType(cell_type.value)

        });

        const cell2 = toolbar.create('div', 'card-toolbar__column');

        ["white", "red", "blue", "green", "black", "colorless"].forEach(v => {
            const check = cell2.create('input', 'checkbox-' + v);
            check.type = 'checkbox';
            check.addEventListener('change', e => {
                if(v == 'colorless') {
                    cell2.querySelectorAll('input:not(.checkbox-colorless)').forEach(elm => {
                        elm.disabled = check.checked;
                    });
                }
                this.setFilters({[v]: check.checked});
                this.updateCardList();
            });

        });


        return toolbar;
    },


    renderCards: function (cards) {
        const grid = create('div', 'card-grid');
        cards.forEach(info => {
            if(info.display) grid.append(this.renderCard(info));
        });
        return grid;
    },


    renderCard: function (info) {
        const card = create('div', 'card-grid__item');
        const icon = card.create('div', 'card-grid__item__icon');
        if (info.computed.thumb_small) icon.style.backgroundImage = 'url(' + info.computed.thumb_small + ')';

        const details = card.create('div', 'card-grid__item__details');
        details.create('div', 'card-grid__item__details__name', info.computed.name);

        const description = details.create('div', 'card-grid__item__details__description');
        description.create('div', 'card-grid__item__details__description__legend', info.computed.legend);
        description.create('div', 'card-grid__item__details__description__power_toughness', info.computed.power_toughness);
        description.create('div', 'card-grid__item__details__description__cost', info.computed.cost_render)

        card.dataset.uuid = info.uuid;
        card.addEventListener('click', evt => {
            this.modal.show(info.computed);
        });
        return card;
    },

    updateCardList: async function() {
        this.container.replaceChildren(this.renderCards(this.cards));
    },


    sortBy: function(ord) {
        this.setFilters({ sortby: ord });
        this.updateCardList();
    },

    sortType: function(type) {
        this.setFilters({ type: type });
        this.updateCardList();
    },






    renderSymbols: function (value) {
        let htmlRender = '';
        const matches = [...String(value).matchAll(/\{(.*?)\}/g)].map(m => m[1]);
        matches.forEach(v => { htmlRender += `<div class="symbol-1em icon-${v}"></div>`; })
        return htmlRender;
    },

    renderTextSymbols: function (input) {
        return String(input)
            .replace(/\n/g, '<span class="line-break"></span>')
            .replace(/\{i\}(.*?)\{\/i\}/gi, '<em>$1</em>')
            .replace(/\{(?!\/?i\})(.*?)\}/gi, (match, p1) => { return `<div class="symbol-1em icon-${p1.toUpperCase()}"></div>`; });
    },

    trimBraces: function (str) {
        return (String(str).match(/{[^}]*}/g) || []).join('');
    },






}








class CardModal extends Modal {

    constructor() {
        super();
        this.cont.addEventListener('mousedown', evt => {
            this.hide();
        });
        document.addEventListener('keydown', evt => {
            if (this.opened && (evt.key === 'Escape' && !(evt.ctrlKey || evt.altKey || evt.shiftKey))) {
                this.hide();
            }
        });
    }

    show(computed) {
        const container = create('div', 'cardinfo');
        const thumb = container.create('div', 'cardinfo__thumb');

        if (computed.thumb_medium) {
            // const img = new Image();
            // img.addEventListener('load', e => { thumb.style.backgroundImage = 'url(' + computed.thumb_medium + ')'; });
            // img.src = computed.thumb_medium;
            thumb.style.backgroundImage = 'url(' + computed.thumb_medium + ')';
        }

        container.create('div', 'cardinfo__name', computed.name);
        container.create('div', 'cardinfo__legend', computed.legend);
        container.create('div', 'cardinfo__cost', '<strong>Coût:</strong> ' + computed.cost_render);
        container.create('div', 'cardinfo__power_toughness', '<strong>Force/Endurance:</strong> ' + (computed.power_toughness ? computed.power_toughness : ''));
        container.create('div', 'cardinfo__description', computed.description);

        super.show(container);
    }

    cancel() {
        this.hide();
    }

}

