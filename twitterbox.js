(function(window) {

    var API = "http://portaltnx20.openamplify.com/AmplifyWeb_v21/AmplifyThis";
    var APIKEY = "dhj34antjkh87bs6fmrrhymganaz78d5";
    var APIURL = API + "?apiKey="+APIKEY+"&analysis=styles&outputFormat=json_js";

    function TwitterBox(term) {
        var obj = this;
        this.term = term;
        this.results = 0;
        this.lastid = 0;
        this.polarity = 0;

        //keep track of items differently since openamplify may bounce us a bit
        this.items = 0;
        this.polaritytotal = 0;
        this.div = $("<div>");

        this.content = $("<p>");
        this.div.append(this.content);

        this.trash = $("<img>");
        this.trash.attr("src","trash.png");
        this.trash.addClass("trash");
        this.div.append(this.trash);

        this.blurbs = [];

        this.alive = true;

        this.trash.on("click",function(e) {
            //need to remove myself from the greater dom
            console.log("DELETE "+obj.term);
            removeSearch(obj.term);
            //handleDelete(obj);
            $(obj.div).remove();
            obj.alive=false;
        });

        this.div.attr("class","twitterbox neutral");
    }

    TwitterBox.prototype.kill = function() {
        $(this.div).remove();
    };

    TwitterBox.prototype.init = function(elm) {
        elm.append(this.div);
        this.div.on("click", TwitterBox.prototype.showDelete);
        self=this;
        TwitterBox.prototype.draw(this);
        startHeartBeat(this)();
    };

    TwitterBox.prototype.showDelete = function(e) {
        $(".trash",e.currentTarget).show();
    };

    TwitterBox.prototype.draw = function(context) {
        var s = "<h1 class='tk-nimbus-sans'>"+context.term+"</h1>";
        s+= "<p class='tk-nimbus-sans'>"+context.results + " results.<br/>";
        s+= "Polarity: "+context.polarity + "</p>";
        context.content.html(s);
        context.div.removeClass("neutral positive negative positive_medium positive_light negative_medium negative_light");
        if(context.polarity < -0.6) {
            context.div.addClass("negative");
        } else if(context.polarity < -0.4) {
                context.div.addClass("negative_medium");
        } else if(context.polarity < -0.05) {
            context.div.addClass("negative_light");
        } else if(context.polarity < 0.05) {
            context.div.addClass("neutral");
        } else if(context.polarity < 0.4) {
            context.div.addClass("positive_light");
        } else if(context.polarity < 0.6) {
            context.div.addClass("positive_medium");
        } else {
            context.div.addClass("positive");
        }
    };

    //Changed to my HB function come from Elijah Manor - thanks!
    var startHeartBeat = function(context) {
        return function heartbeat() {
            console.log("doing "+context.term+ " at "+new Date());

            if(!context.alive) return;

            function doOA() {
                var text = context.blurbs.shift();
                console.log(context.blurbs.length + " items left for "+context.term);
                $.getScript(APIURL + "&inputText="+escape(text),function(data,status) {
                    var mood = amplifyOutput.StylesResponse.StylesReturn.Styles.Polarity.Mean.Value;
                    context.polaritytotal+=mood;
                    context.items++;
                    context.polarity = (context.polaritytotal/context.items).toFixed(5);
                    console.log(context.items+ " items and pol "+context.polarity);
                    context.draw(context);
                    if(context.blurbs.length) setTimeout(doOA,500);
               });

            }

            var url = "http://search.twitter.com/search.json?q="+escape(context.term)+"&since_id="+context.lastid+"&callback=?";
            $.getJSON(url,{}, function(res,code) {

                for(var i=0; i<res.results.length; i++) {
                    if(res.results[i].text.length > 5) context.blurbs.push(res.results[i].text);
                }
                doOA();

                context.lastid = res.max_id_str;
                context.results+=res.results.length;
                context.draw(context);
            },"jsonp");

            if(context.alive) setTimeout(heartbeat,10000);
        };

    };

    window.TwitterBox = TwitterBox;

}(window));