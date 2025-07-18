const CardPool = {

    main: null,
    cards: [],

    init: async function () {
        this.main = query('main');

        Brainstorm.getCards().then(result => {
            if(result.success) {
                this.cards = result.rows;
                this.container = create('article');
                this.container.replaceChildren(this.renderCards());
                this.main.replaceChildren(this.container);
            } else {
                MessageModal.alert(result.errmsg, () => {
                    document.location.href = root;
                });
            }
        });
    },


    renderCards: function() {
        const thumbnail_path = root + 'assets/images/cartes/thumbnails/';
        const grid = create('div', 'card-grid');
        this.cards.forEach(info => {
            // console.log(info);
            
            const card = create('div', 'card-grid__item');
            card.create('div', 'card-grid__item__icon').style.setProperty('background-image', 'url(' + thumbnail_path + info.image.webp_small + ')');
            const details = card.create('div', 'card-grid__item__details');
            details.create('div', 'card-grid__item__details__name', info.name);
            const description = details.create('div', 'card-grid__item__details__description');

            description.create('div', 'card-grid__item__details__description__legend', info.supertype + ' ' + info.type + ' - ' + info.subtype);

            description.create('div', 'card-grid__item__details__description__power_toughness', info.power + '/' + info.toughness);
            description.create('div', 'card-grid__item__details__description__cost', this.renderSymbols(info.cost))

            grid.append(card);
        });
        return grid;
        
        
    },


    renderSymbols: function(value) {
        // if(!value) return value;
        // value = ;
        let htmlRender = '';
        const matches = [...String(value).matchAll(/\{(.*?)\}/g)].map(m => m[1]);
        matches.forEach(v => { htmlRender += `<div class="symbol-1rem icon-${v}"></div>`; })
        return htmlRender;
    },

}