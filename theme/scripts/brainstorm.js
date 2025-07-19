const BRAINSTORM_API = 'AKfycbxlWyJ4IWnIONnh9tBgkHi8fmSkHjjNqQ7sfiHdmrYQwbK2rgFmKBdi6YtoXdDf4HXG';

const Brainstorm = {


    getCards: function() {
        return this.httpGET().then(result => {
            if(result.success) {
                return {
                    success: true,
                    rows: result.data.rows.reverse()
                }
            } else return result;
        });
    },



    addCard: function(data) {
        return this.httpPOST({
            action: "add",
            values: data,
        }).then(result => {
            if(result.success) {
                return {
                    success: true,
                    uuid: result.data.uuid,
                }
            } else return result;
        });
    },

    addImage: function(filename, contents) {

    },


    httpGET: async function(args = null) {

        // const url = 'https://script.google.com/macros/s/' + BRAINSTORM_API + '/exec'
        // await sleep(1000);
        // const url = root + 'assets/data/cards.json';
// console.log(window.location.hostname);
        const url = (window.location.hostname === 'localhost' ? root + 'assets/data/cards.json' : 'https://script.google.com/macros/s/' + BRAINSTORM_API + '/exec');



        return fetch(url)
        .then((response) => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.text();
        })
        .then((responseData) => {
            let response = JSON.parse(responseData);
            if(response.status == undefined) return {
                success: false,
                errmsg: "Réponse du serveur invalide."
            };
            if(response.status != 'success') return {
                success: false,
                errmsg: response.message
            };
            return {
                success: true,
                data: response
            };
        })
        .catch((err) => {
            return {
                success: false,
                errmsg: err.message,
            }
        });



    },


    httpPOST: async function (data) {
        const url = 'https://script.google.com/macros/s/' + BRAINSTORM_API + '/exec'
        return fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: "data=" + encodeURIComponent(JSON.stringify(data))
        })
        .then((response) => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.text();
        })
        .then((responseData) => {
            let response = JSON.parse(responseData);
            if(response.status == undefined) return {
                success: false,
                errmsg: "Réponse du serveur invalide."
            };
            if(response.status != 'success') return {
                success: false,
                errmsg: response.message
            };
            return {
                success: true,
                data: response
            };
        })
        .catch((err) => {
            return {
                success: false,
                errmsg: err.message,
            }
        });

    },

}