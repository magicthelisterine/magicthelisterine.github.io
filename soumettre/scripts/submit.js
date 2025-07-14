const SubmitForm = {
    data: null,
    serie: null,
    supertype: null,
    type: null,
    dnd: null,


    init: function (data) {
        this.data = data;
        this.dnd = document.getElementById('dnd');
        this.serie = document.getElementById('serie');
        this.supertype = document.getElementById('supertype');
        this.type = document.getElementById('type');
        this.fillSerie(data.series);
        this.fillSuperType(data.supertypes);
        this.fillType(data.types);




        DropImage.init(this.dnd);
        HintSymbols.init();
    },


    fillSerie: function (series) {
        series.forEach(v => {
            const option = create('option');
            option.innerText = v;
            option.value = v;
            this.serie.append(option);
        });
    },

    fillSuperType: function (supertypes) {
        supertypes.forEach(v => {
            const option = create('option');
            option.innerText = v;
            option.value = v;
            this.supertype.append(option);
        });
    },

    fillType: function (types) {
        types.forEach(v => {
            const option = create('option');
            option.innerText = v;
            option.value = v;
            this.type.append(option);
        });
    },
}






const HintSymbols = {

    symbols: ["U", "G", "B", "W", "R", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "2B", "2G", "2R", "2U", "2W", "BG", "BR", "GU", "GW", "RG", "RW", "UB", "UR", "WB", "WU", "X", "Y", "Z"],
    hintBox: null,
    input: null,
    cost: null,

    init: function () {

        this.hintBox = document.body.create('div', 'card-submit-cost-symbols');
        this.input = document.getElementById('costInput');
        this.cost = document.getElementById('costRender');

        this.symbols.forEach(v => {
            const btn = this.hintBox.create('div', 'symbol24 icon-' + v);
            btn.bind('click', evt => {
                this.input.value += '{' + v + '}';
                this.renderCost();
            });
        });
        this.input.bind('input', evt => {
            this.renderCost();
        });

        let blockBlur = false;
        this.input.addEventListener('focus', () => {
            this.hintBox.style.display = 'block';
            this.hintBox.style.visibility = 'hidden';
            const rect = this.input.getBoundingClientRect();
            const hintHeight = this.hintBox.offsetHeight;
            this.hintBox.style.left = rect.left + window.scrollX + 'px';
            this.hintBox.style.top = (rect.top + window.scrollY - hintHeight - 8) + 'px';
            this.hintBox.style.visibility = 'visible';
        });
        this.input.addEventListener('blur', () => {
            if (!blockBlur) {
                this.hintBox.style.display = 'none';
            }
        });
        this.hintBox.addEventListener('mousedown', () => {
            blockBlur = true;
        });
        this.hintBox.addEventListener('mouseup', () => {
            setTimeout(() => {
                blockBlur = false;
                this.input.focus();
            }, 0);
        });
    },


    renderCost: function () {
        let htmlRender = '';
        const matches = [...this.input.value.matchAll(/\{(.*?)\}/g)].map(m => m[1]);
        matches.forEach(v => { htmlRender += `<div class="symbol24 icon-${v}"></div>`; })
        this.cost.innerHTML = htmlRender;
    },

}




const DropImage = {

    div: null,

    init: function (div) {
        this.div = div;

        this.div.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.div.classList.add('dragover');
        });

        this.div.addEventListener('dragleave', () => {
            this.div.classList.remove('dragover');
        });


        this.div.addEventListener('drop', (e) => {
            e.preventDefault();
            this.div.classList.remove('dragover');
          
            const files = e.dataTransfer.files;
            if (files.length > 0) {
              this.handleFile(files[0]);
            }
          });
          





    },



    handleFile: function(file) {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            this.div.style.setProperty('--bg-image', `url("${e.target.result}")`);
          };
          reader.readAsDataURL(file);
        } else {
            console.log('Fichier non supporté');
        }
      }



}