const SubmitForm = {
    data: null,
    name: null,
    serie: null,
    supertype: null,
    type: null,
    dnd: null,
    desc: null,
    submitbtn: null,

    loadingModal: null,
    emailModal: null,


    init: function (data) {
        this.data = data;
        this.dnd = document.getElementById('dnd');
        this.name = document.getElementById('name');
        this.serie = document.getElementById('serie');
        this.supertype = document.getElementById('supertype');
        this.type = document.getElementById('type');
        this.desc = document.getElementById('desc');
        this.submitbtn = document.getElementById('submit-btn');
        this.fillSerie(data.series);
        this.fillSuperType(data.supertypes);
        this.fillType(data.types);

        


        DropImage.init(this.dnd);
        HintSymbols.init();
        MTGEditor.init(this.desc);

        this.loadingModal = new LoadingModal();
        this.emailModal = new EmailModal();

        bind('.card-submit-container form', 'submit', (evt) => { evt.preventDefault(); this.submit(); });
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


    progress: function(progress) {
        this.submitbtn.disabled = progress < 1 ? true : false;
    },


    submit: function() {

        if(!DropImage.value) {
            DropImage.div.classList.add('dragover');
            scrollTo(DropImage.div);
            return;
        }




        // return;
        
        this.emailModal.show((name, email) => {
            const values = {
                author: name,
                email: email,
                name: document.getElementById('name').value,
                serie: document.getElementById('serie').value,
                supertype: document.getElementById('supertype').value,
                type: document.getElementById('type').value,
                subtype: document.getElementById('subtype').value,
                power: document.getElementById('power').value,
                toughness: document.getElementById('toughness').value,
                cost: document.getElementById('costInput').value,
                description: document.getElementById('desc').value,
                flavor: document.getElementById('flavor').value,
                image: {
                    filename: DropImage.value.name,
                    image: DropImage.value.contents
                }
            };
            this.loadingModal.show();
            Brainstorm.addCard(values).then(data => {
                this.loadingModal.hide();
                if(data.success) {
                    MessageModal.thumbsup('Bravo! Votre carte vient d’être envoyée dans le Plan Astral du comité éditorial. Si elle survit au sort de Contrebullshit, elle sera publiée bientôt.', () => {
                        document.location.href = '../';
                    });
                } else {
                    MessageModal.alert(`Une erreur s'est produite.<br>${data.errmsg}`);
                }
            });

        });
        
    },
}
window.SubmitForm = SubmitForm;





const HintSymbols = {

    symbols: ["U", "G", "B", "W", "R", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "2B", "2G", "2R", "2U", "2W", "BG", "BR", "GU", "GW", "RG", "RW", "UB", "UR", "WB", "WU", "X", "Y", "Z", "C"],
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
    value: null,

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

        this.div.addEventListener('click', evt => {
            browse('image/*', (evt) => {
                if (evt.target.files.length > 0) {
                    this.handleFile(evt.target.files[0]);
                }
            });
            this.div.classList.remove('dragover');
        });

    },

    handleFile: function (file) {
        if (file.type.startsWith('image/') && file.size <= 5242880) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.value = {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    contents: e.target.result
                };
                this.div.style.setProperty('--bg-image', `url("${e.target.result}")`);
            };
            reader.readAsDataURL(file);
        }
    }

}


const MTGEditor = {
    symbols: ["I", "U", "G", "B", "W", "R", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "2B", "2G", "2R", "2U", "2W", "BG", "BR", "GU", "GW", "RG", "RW", "UB", "UR", "WB", "WU", "X", "Y", "Z", "T", "T1", "T2"],
    toolbar: null,
    elm: null,


    init: function (elm) {
        this.elm = elm;
        this.toolbar = create('div', 'MTGEditor-toolbar');


        this.elm.parentElement.insertBefore(this.toolbar, this.elm);

        this.symbols.forEach(v => {
            const btn = this.toolbar.create('div', 'symbol24 icon-' + v);
            btn.bind('click', evt => {
                if (v == 'I') this.wrapItalic();
                else this.insert('{' + v + '}');
            });
        });


    },

    insert: function (text) {
        const start = this.elm.selectionStart;
        const end = this.elm.selectionEnd;
        const before = this.elm.value.substring(0, start);
        const after = this.elm.value.substring(end);
        this.elm.value = before + text + after;
        const nouvellePosition = start + text.length;
        this.elm.selectionStart = this.elm.selectionEnd = nouvellePosition;
        this.elm.focus();
    },


    wrapItalic: function () {
        const start = this.elm.selectionStart;
        const end = this.elm.selectionEnd;
        const selectedText = this.elm.value.substring(start, end);
        let insertedText;
        let newCursorPosition;
        if (selectedText.length > 0) {
            insertedText = `{I}${selectedText}{/I}`;
            newCursorPosition = start + insertedText.length;
        } else {
            insertedText = `{I}{/I}`;
            newCursorPosition = start + 3; // cursor between the tags
        }
        const before = this.elm.value.slice(0, start);
        const after = this.elm.value.slice(end);
        this.elm.value = before + insertedText + after;
        this.elm.selectionStart = this.elm.selectionEnd = newCursorPosition;
        this.elm.focus();
    }


}




class EmailModal extends Modal {

    form = null;
    clb = null;

    constructor() {
        let form = create('form', 'email-modal');
        form.innerHTML =
            `<table>` +
                `<thead>` +
                    `<tr>` +
                        `<th colspan="2">Auteur</th>` +
                    `</tr>` +
                `</thead>` +
                `<tbody>` +
                    `<tr>` +
                        `<td colspan="2"><input type="text" name="name" autocomplete="off" placeholder="Nom" required></td>` +
                    `</tr>` +
                    `<tr>` +
                        `<td colspan="2"><input type="email" name="email" autocomplete="off" placeholder="Courriel" required></td>` +
                    `</tr>` +
                `</tbody>` +
                `<tfoot>` +
                    `<tr>` +
                        `<td class="cell-half-width">` +
                            `<input type="submit" name="save" value="Confirmer">` +
                        `</td>` +
                        `<td class="cell-half-width">` +
                            `<input type="button" name="cancel" value="Annuler">` +
                        `</td>` +
                    `</tr>` +
                `</tfoot>` +
            `</table>`;
        super(form);
        this.form = form;
        bind(this.form, 'submit', (evt) => { evt.preventDefault(); this.save(); });
        this.form.querySelector('input[name="cancel"]').addEventListener('click', evt => { this.cancel(); });
    }


    show(clb=null) {
        this.clb = clb;
        this.form.querySelector('input[name="name"]').value = localStorage.getItem('submit-author_name');
        this.form.querySelector('input[name="email"]').value = localStorage.getItem('submit-author_email');

        super.show();
        setTimeout(() => {
            this.form.querySelector('input[name="name"]').focus();
        }, 200);
        
    }


    save() {
        const name = this.form.querySelector('input[name="name"]').value;
        const email = this.form.querySelector('input[name="email"]').value;
        localStorage.setItem('submit-author_name', name);
        localStorage.setItem('submit-author_email', email);
        this.hide();
        if(this.clb) this.clb(name, email);
    }

    cancel() {
        this.hide();
    }

}




class LoadingModal extends Modal {
    
    loading = null;
    
    constructor() {
        let loading = create('div', 'loading-tri-circular center');
        super(loading);
        this.loading = loading;
    }
    
    show() {
        this.loading.style.setProperty('--state', 'running');
        super.show();
    }

    hide() {
        super.hide();
        this.loading.style.setProperty('--state', 'paused');
    }

}