// const BRAINSTORM_API = 'AKfycbzbVdYrHLR6De7I7L9wlQUpGTsPkWVQsu4iUdlihO9Zbf2H2-KpM1rLWMS6vtcXKmvHWw';
// const BRAINSTORM_API = 'AKfycbysPx5mi9ux7T82eyo0RMG0bS79LxAiOXUJMTbangYPW2eMGAqwyevKnbN_n7dZ7wQ4Gg';
const BRAINSTORM_API = 'AKfycbzg4aFxpiBguq7AuHkSXYWcthT2uLKLzX2-UhqmJz_zgMPdeI3CrWdUOo5M0IBw6RecoA';

const Brainstorm = {




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


    httpGET: function(args = null) {

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