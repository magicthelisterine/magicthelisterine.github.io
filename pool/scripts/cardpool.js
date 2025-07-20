const thumbnail_path = root + 'assets/images/cartes/thumbnails/';


const CardPool = {

    main: null,
    modal: null,
    cards: [],


    init: async function () {
        this.modal = new CardModal;
        this.main = query('main');

        Brainstorm.getCards().then(result => {
            if (result.success) {
                this.cards = result.rows;
                this.container = create('article');
                this.container.replaceChildren(this.renderCards());

                const toolbar = create('div', 'card-toolbar');
                const cell1 = toolbar.create('div', 'card-toolbar__column');
                
                const cell_sort = cell1.create('select');
                cell_sort.create('option', '', '--- Trier par ---');

                const cell_type = cell1.create('select');
                cell_type.create('option', '', '--- Type ---')




                toolbar.create('div', 'card-toolbar__column', 'asdf');

                this.main.replaceChildren(toolbar, this.container);
            } else {
                MessageModal.alert(result.errmsg, () => {
                    document.location.href = root;
                });
            }
        });
    },


    renderCards: function () {

        const grid = create('div', 'card-grid');
        this.cards.forEach(info => {
            grid.append(this.renderCard(info));
        });
        return grid;


    },


    renderCard: function (info) {

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



        info.computed = {
            name: info.name,
            legend: legend,
            thumb_small: thumb_small,
            thumb_medium: thumb_medium,
            thumb_large: thumb_large,
            cost: this.trimBraces(info.cost),
            cost_render: this.renderSymbols(this.trimBraces(info.cost)),
            power_toughness: power_toughness,
            description: desctext,

            // thumb_small: 

        };




        const card = create('div', 'card-grid__item');
        const icon = card.create('div', 'card-grid__item__icon');
        if (info.computed.thumb_small) icon.style.backgroundImage = 'url(' + info.computed.thumb_small + ')';

        const details = card.create('div', 'card-grid__item__details');
        details.create('div', 'card-grid__item__details__name', info.computed.name);

        const description = details.create('div', 'card-grid__item__details__description');
        description.create('div', 'card-grid__item__details__description__legend', info.computed.legend);
        description.create('div', 'card-grid__item__details__description__power_toughness', info.computed.power_toughness);
        description.create('div', 'card-grid__item__details__description__cost', info.computed.cost_render)

        card.addEventListener('click', evt => {
            // console.log(card.dataset.key);
            // console.log(info.computed);
            // console.log(info);
            this.modal.show(info.computed);

            // console.log(this.trimBraces('{u}4{dasd}3asdf'));

        });
        return card;
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

    // form = null;
    // clb = null;

    constructor() {
        // let form = create('form', 'email-modal');
        // form.innerHTML = '';

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
        // this.clb = clb;

        const container = create('div', 'cardinfo');
        const thumb = container.create('div', 'cardinfo__thumb');

        if (computed.thumb_medium) thumb.style.backgroundImage = 'url(' + computed.thumb_medium + ')';


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

