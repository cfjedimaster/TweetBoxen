function init() {

    $(document).on("touchmove", function(e) { e.preventDefault();});

    $("#addButton").on("touchstart click", function(e) {
        $("#addSearchModal").modal({backdrop:true});
        e.preventDefault();
    });

    $("#addTermButton").on("click", function(e) {
        var value = $.trim($("#twittersearchterm").val());
        if(value !== '') {
            $("#twittersearchterm").val("");
            addBox(value);
            storeSearch(value);
        }
        $("#addSearchModal").modal("hide");

    });

    addBox = function(label) {
        var tb = new TwitterBox(label);
        tb.init($("#mainContainer"));
    };

    $("#introModal").modal({backdrop:true});

    $("#introModal").on("hidden", function() {
        if(localStorage.previousTerms) {
            try {
                var previousTerms = JSON.parse(localStorage.previousTerms);
                console.dir(previousTerms);
                for(var i=0; i<previousTerms.length; i++) {
                    addBox(previousTerms[i]);
                }

            } catch(e) { console.log(e); }
        }
    });

}

function storeSearch(value) {
    var terms = [];
    if(localStorage.previousTerms) {
        try {
            terms = JSON.parse(localStorage.previousTerms);
        } catch(e) {}
    }
    if(terms.indexOf(value) == -1) {
        terms.push(value);
        localStorage.previousTerms = JSON.stringify(terms);
    }
}

function removeSearch(value) {
    var terms = [];
    if(localStorage.previousTerms) {
        try {
            terms = JSON.parse(localStorage.previousTerms);
        } catch(e) {}
        if(terms.indexOf(value) !== -1) {
            terms.slice(terms.indexOf(value), 1);
            localStorage.previousTerms = JSON.stringify(terms);
        }
    }
}
