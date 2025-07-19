const thumbnail_path = root + 'assets/images/cartes/thumbnails/';


const CardPool = {

    main: null,
    modal: null,
    cards: [],
    

    init: async function () {
        this.modal = new CardModal;
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
        
        const grid = create('div', 'card-grid');
        this.cards.forEach((info, i) => {
            


            grid.append(this.renderCard(info));
        });
        return grid;
        
        
    },


    renderCard: function(info) {

        let legend = info.type;
        if(info.supertype) legend = info.supertype + ' ' + legend;
        if(info.subtype) legend = legend + ' - ' + info.subtype;

        let thumb_small = null;
        let thumb_medium = null;
        let thumb_large = null;
        if(info.image) {
            if(info.image.webp_small) thumb_small = thumbnail_path + info.image.webp_small;
            if(info.image.webp_medium) thumb_medium = thumbnail_path + info.image.webp_medium;
            if(info.image.webp_large) thumb_large = thumbnail_path + info.image.webp_large;
        }


        info.computed = {
            name: info.name,
            legend: legend,
            thumb_small: thumb_small,
            thumb_medium: thumb_medium,
            thumb_large: thumb_large,

            // thumb_small: 

        };




        const card = create('div', 'card-grid__item');
        const icon = card.create('div', 'card-grid__item__icon');
        if(info.computed.thumb_small) icon.style.backgroundImage = 'url(' + info.computed.thumb_small + ')';
        
        
        
        const details = card.create('div', 'card-grid__item__details');
        details.create('div', 'card-grid__item__details__name', info.name);

        const description = details.create('div', 'card-grid__item__details__description');
        description.create('div', 'card-grid__item__details__description__legend', info.computed.legend);
        description.create('div', 'card-grid__item__details__description__power_toughness', info.power + '/' + info.toughness);
        description.create('div', 'card-grid__item__details__description__cost', this.renderSymbols(info.cost))

        card.addEventListener('click', evt => {
            // console.log(card.dataset.key);
            console.log(info);
            // this.modal.show(info);

        });
        return card;
    },



    renderSymbols: function(value) {
        let htmlRender = '';
        const matches = [...String(value).matchAll(/\{(.*?)\}/g)].map(m => m[1]);
        matches.forEach(v => { htmlRender += `<div class="symbol-1rem icon-${v}"></div>`; })
        return htmlRender;
    },








}








class CardModal extends Modal {

    form = null;
    clb = null;

    constructor() {
        let form = create('form', 'email-modal');
        form.innerHTML = '';

        super(form);
        this.form = form;
    }


    show(clb=null) {
        this.clb = clb;
        super.show();
    }

    cancel() {
        this.hide();
    }

}

