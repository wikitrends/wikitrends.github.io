var globali = 0;
var username;
/* The Search Functionality Starts */

// This part simply changes the UI. Just to add the the cross button when the WeeklyPedia section is used etc. 
$(document).ready(function() {

    $("#myModal").modal()

    $('#element').tooltip('show')

    var currFFZoom = 1;
    var currIEZoom = 100;

    var step = 10;
    currIEZoom -= step;
    $('body').css('zoom', '90%');

    $(".lang-selector li a").click(function() {

        $("#mostNewEdits").css({
            "color": "#333",
            "background-color": "#fff"
        })
        $("#mostEdits").css({
            "color": "#333",
            "background-color": "#fff"
        })

        $("#mostNewEdits").removeClass("active")
        $("#mostEdits").removeClass("active")

        $('#suggestionsPane').find('.mostEdits').html('');
        $('#suggestionsPane').find('.mostNewEdits').html('');
        $('#results_pane').find('.searchResults').html('');

        $(this).parents(".input-group-btn").find('.btn').html($(this).text() + "<span class='caret'></span>");
        $(this).parents(".input-group-btn").find('.btn').val($(this).text() + "<span class='caret'></span>");

    });

    $('input[name=searchQuery][type=text]').bind('change paste keyup', function() {
        var query = $('input[name=searchQuery]').val();
        if (query.length >= 3) search(query);
        else if (query.length === 0) resetDisplay();
    });

    $("#closeMostEdits").click(function() {
        $('#suggestionsPane').find('.mostEdits').html('');
        $("#closeMostEdits").hide()
    });

    $("#closeMostNewEdits").click(function() {
        $('#suggestionsPane').find('.mostNewEdits').html('');
        $("#closeMostNewEdits").hide()
    });

    $('#usernameSubmit').click(function() {
        username = $('input[name=username]').val();
        $("#myModal").modal("hide");
    })

    $('#oneB').click(function() {
        $('#spinnerOne').empty()
        var vizjson_url = 'https://wikimedia.cartodb.com/api/v2/viz/f9128ca4-315a-11e5-a737-0e0c41326911/viz.json';
        cartodb.Image(vizjson_url)
            .center([40, -95])
            .zoom(4)
            .into(document.getElementById('one'))
    })

    $('#nineB').click(function() {
        cartodb.createVis('nine', 'https://dpatel.cartodb.com/api/v2/viz/771e43ca-1a38-11e5-a03e-0e0c41326911/viz.json');
    })

    $('#twoB').click(function() {


        $('#spinnerOne').empty()

        var vizjson_url = 'https://wikimedia.cartodb.com/api/v2/viz/f9128ca4-315a-11e5-a737-0e0c41326911/viz.json';
        cartodb.Image(vizjson_url)
            .center([20, 10])
            .zoom(2)
            .into(document.getElementById('two'))



        // $('#spinnerTwo').empty()
        // console.log('asd')
        // cartodb.createVis('two', 'https://wikimedia.cartodb.com/api/v2/viz/73d010a8-320d-11e5-8a40-0e018d66dc29/viz.json');
        // // cartodb.createVis('one', 'https://wikimedia.cartodb.com/api/v2/viz/f9128ca4-315a-11e5-a737-0e0c41326911/viz.json');
        // // cartodb.Image(vizjson_url)
        // //   .size(600, 400)
        // //   .center([-113.75,-45.58328975600631])
        // //   .zoom(1)
        // //   .write({ class: "thumb", id: "one" });

    })
});



// Starts the search functionality of the article section. It then calls the next 4 functions (requestArticleExtracts, updateNumResults, resetDisplay, updateDisplay)
var search = function(query) {


    var langCode = $(".lang-selector li a").parents(".input-group-btn").find('.btn').text()
    langCode = langCode.replace(" <span class='caret'></span>", "").toLowerCase();

    console.log(langCode)

    $.ajax({
        url: 'https://' + langCode + '.wikipedia.org/w/api.php?action=query&list=search&format=json&srsearch=' + query,
        type: 'GET',
        dataType: 'jsonp',
        headers: {
            'Api-User-Agent': 'WikiReader/0.1.0'
        }
    }).success(function(data, status) {
        updateNumResults(data.query);
        requestArticleExtracts(data.query);
    }).error(function(data, status) {
        // console.log("ERROR! " + status);
    });
};

var requestArticleExtracts = function(queryResult) {

    var langCode = $(".lang-selector li a").parents(".input-group-btn").find('.btn').text()
    langCode = langCode.replace("<span class='caret'></span>", "").toLowerCase();
    langCode = langCode.replace(/ /g, "")

    // Request extracts for each of the articles found in the search
    var extractQuery = 'https://' + langCode + '.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&exsentences=2&exlimit=max&exintro=&explaintext=&titles=';

    // Add each page title to the query
    var searchResults = queryResult.search;
    for (var i = 0; i < searchResults.length - 1; i++) {
        extractQuery += searchResults[i].title + '|';
    }
    extractQuery += searchResults[searchResults.length - 1].title;
    extractQuery = encodeURI(extractQuery);

    $.ajax({
        url: extractQuery,
        type: 'GET',
        dataType: 'jsonp',
        headers: {
            'Api-User-Agent': 'WikiReader/0.1.0'
        }
    }).success(function(data, status) {
        updateDisplay(data);
    })
}

var updateNumResults = function(queryResult) {
    $('.num_results').html("<p class='num_results'>Showing results 1 to 10 of " + queryResult.searchinfo.totalhits + "</p>");
};

var resetDisplay = function() {
    $('#results_pane').find('.searchResults').html('');
    $('.num_results').html('');
}

var updateDisplay = function(queryResult) {
    //console.log(queryResult);
    var pages = queryResult.query.pages;

    // Find the results pane and reset it
    $('#results_pane').find('.searchResults').html('');

    for (var pId in pages) {
        var htmlToAdd = "<div class='result_card'>";

        // Using pages[pId].title doesn't work in API call. Hence use pageID
        var pageDetails = [pages[pId].pageid, pages[pId].title]
            // htmlToAdd += "<a nohref onClick=\"grandPlotter(" + pages[pId].pageid + "," + "\'" + pages[pId].title + "\'" + ")\">"
        htmlToAdd += "<a nohref onClick=\"precurssor(" + pages[pId].pageid +
            "," + globali +
            "," + "\'" + (pages[pId].title).replace('\'', '\\\'') + "\'" +
            ")\">"

        //console.log(pages[pId].title)
        //test(pages[pId].title)
        //htmlToAdd += "<a href='javascript:grandPlotter(" + pages[pId].title + ")'>";
        htmlToAdd += "<p>" + pages[pId].title + "</p>";
        //htmlToAdd += "<p>" + pages[pId].extract + "</p></a></div>";

        $('#suggestionsPane').find('.mostEdits').html('');
        $('#suggestionsPane').find('.mostNewEdits').html('');
        $('#results_pane').find('.searchResults').append(htmlToAdd);

    }
}

/* Search functionality ends here */
function precurssor(input, globalia, pageTitle) {

    pageTitle.replace('\'', '\\\'')

    grandPlotter(input, pageTitle)

    $("#datepicker input").val()
        // picker.destroy()
}

/* WeeklyPedia functionality starts here */
// Automatic Most Editted and most recently editted pages are fetched and displayed. 
function weeklyPedia(parameter) {
    var printer = $("#datepicker")
    console.log(printer)

    var lastFriday = moment().startOf('isoweek').subtract(2, 'days')
    lastFriday = JSON.stringify(lastFriday).slice(1, 11).replace(/-/g, "")
    var textCheck = $(".lang-selector li a").parents(".input-group-btn").find('.btn').text()
    console.log(textCheck.replace("<span class='caret'></span>", "").toLowerCase());
    if (parameter == 'Most Edits') {

        var url = "http://weekly.hatnote.com/archive/en/" + lastFriday + "/weeklypedia_" + lastFriday + ".json"

        $("#mostNewEdits").css({
            "color": "#333",
            "background-color": "#fff"
        })
        $("#mostEdits").css({
            'background-color': "#333",
            'color': "#fff"
        })


        getWeeklyPedia(url, function(data) {
            var useFulData = data.query.results.json.mainspace

            for (i = 0; i < useFulData.length; i++) {

                var htmlToAdd = "<div class='result_card'>";
                // htmlToAdd += "<a target='_' "  href='https://en.wikipedia.org/?curid=" + pages[pId].pageid + "'>";

                // Using pages[pId].title doesn't work in API call. Hence use pageID
                // console.log(useFulData[i].title)

                htmlToAdd += "<a nohref onClick=\"precurssor(" + useFulData[i].page_id +
                    "," + globali +
                    "," + "\'" + (useFulData[i].title_s).replace('\'', '\\\'') + "\'" +
                    ")\">"

                // htmlToAdd += "<a nohref onClick=\"grandPlotter(" + useFulData[i].page_id + "\'" + useFulData[i].title + "\'" + ")\">"
                htmlToAdd += "<p>" + useFulData[i].title_s + "</p>";

                $('#closeMostNewEdits').hide()
                $('#closeMostEdits').show()
                $('#suggestionsPane').find('.mostNewEdits').html('');
                $('#results_pane').find('.searchResults').html('');
                $('#suggestionsPane').find('.mostEdits').append(htmlToAdd);
            }

        })
    } else {

        $("#mostEdits").css({
            "color": "#333",
            "background-color": "#fff"
        })
        $("#mostNewEdits").css({
            'background-color': "#333",
            'color': "#fff"
        })



        var url = "http://weekly.hatnote.com/archive/en/" + lastFriday + "/weeklypedia_" + lastFriday + ".json"
        getWeeklyPedia(url, function(data) {
            if (data.query.results) {
                var useFulData = data.query.results.json.new_articles

                for (i = 0; i < useFulData.length; i++) {

                    var htmlToAdd = "<div class='result_card'>";
                    htmlToAdd += "<a nohref onClick=\"precurssor(" + useFulData[i].page_id +
                        "," + globali +
                        "," + "\'" + (useFulData[i].title_s).replace('\'', '\\\'') + "\'" +
                        ")\">"
                    htmlToAdd += "<p>" + useFulData[i].title_s + "</p>";
                    $('#closeMostEdits').hide()
                    $('#closeMostNewEdits').show()
                    $('#results_pane').find('.searchResults').html('');
                    $('#suggestionsPane').find('.mostEdits').html('');
                    $('#suggestionsPane').find('.mostNewEdits').append(htmlToAdd);

                }

            } else {
                //console.log(useFulData)
            }

        })
    }
}

function getWeeklyPedia(url, callback) {

    // Since weeklypedia does not support jsonp (yet!)
    // Using YahooApis (take into account the 10,000 per hour limit. Need to look it up)

    url = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent('select * from json where url="' + url + '"') + '&format=json';
    return $.ajax({
        type: "GET",
        url: url,
        success: callback,
        error: function() {
            alert("Error");
        },
        dataType: "json"
    });
}

var languages = ["en-English"]

// Nepal Earthquake

// Jurrasic
// grandPlotter('47084203', '2015 Sousse attacks')

// grandPlotter("April_2015_Nepal_earthquake")

// This is the main place where everything works. All the calls the the APIs ( except for the article seach and weeklypedia suggestions ), pretty much everything lies here. 

function grandPlotter(pageIDin, pageTitlein) {

    //// Make this spinning fellow better. 
    function loader(config) {
        return function() {
            var radius = Math.min(config.width, config.height) / 2;
            var tau = 2 * Math.PI;

            var arc = d3.svg.arc()
                .innerRadius(radius * 0.2)
                .outerRadius(radius * 0.4)
                .startAngle(0);

            var svg = d3.select(config.container).append("svg")
                .attr("id", "loader")
                .attr("width", config.width)
                .attr("height", config.height)
                .append("g")
                .attr("transform", "translate(" + config.width / 2 + "," + config.height / 2 + ")")

            var background = svg.append("path")
                .datum({
                    endAngle: 0.33 * tau
                })
                .style("fill", "#4D4D4D")
                .attr("d", arc)
                .call(spin, 1500)

            function spin(selection, duration) {
                selection.transition()
                    .ease("linear")
                    .duration(duration)
                    .attrTween("transform", function() {
                        return d3.interpolateString("rotate(0)", "rotate(360)");
                    });

                setTimeout(function() {
                    spin(selection, duration);
                }, duration);
            }

            function transitionFunction(path) {
                path.transition()
                    .duration(7500)
                    .attrTween("stroke-dasharray", tweenDash)
                    .each("end", function() {
                        d3.select(this).call(transition);
                    });
            }
        };
    }

    // var myLoader = loader({
    //     width: 960,
    //     height: 500,
    //     container: "#spinnerOne",
    //     id: "spinnerOne"
    // });
    // myLoader();
    // var myLoader = loader({
    //     width: 960,
    //     height: 500,
    //     container: "#two",
    //     id: "one"
    // });
    // myLoader();
    // var myLoader = loader({
    //     width: 960,
    //     height: 500,
    //     container: "#three",
    //     id: "one"
    // });
    // myLoader();
    // var myLoader = loader({
    //     width: 960,
    //     height: 500,
    //     container: "#four",
    //     id: "one"
    // });
    // myLoader();

    /* Loader Section ends */

    //// You mad, bro? 
    var pageID = pageIDin;
    var pageTitle

    var langCode = $(".lang-selector li a").parents(".input-group-btn").find('.btn').text()
    langCode = langCode.replace(" <span class='caret'></span>", "").toLowerCase();

    //**// Variable Name
    // It is used by just the pageEdits function and the graph plotter. 
    function getData(url, callback) {
        return $.ajax({
            url: url,
            dataType: 'jsonp',
            type: 'GET',
            headers: {
                'Api-User-Agent': 'Example/1.0'
            },
            success: callback,
        });
    }

    var extract;

    function serverSend(lang, pageid) {

        var xhr = new XMLHttpRequest();

        locateUrl = "http://trusty.tools.wmflabs.org:4000/locate" + "?username=" + username + "&language=" + lang + "&pageid=" + pageid;

        console.log(locateUrl)
        xhr.open("POST", locateUrl, true);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=utf-8')
        xhr.timeout = 600000;
        xhr.onload = function(e) {
            if (xhr.readyState === 4) {

                json = JSON.parse(xhr.responseText);

                // $('#spinnerOne').empty()
                // $('#spinnerTwo').empty()
                // $('#spinnerThree').empty()

                var vizjson_url = 'https://wikimedia.cartodb.com/api/v2/viz/f9128ca4-315a-11e5-a737-0e0c41326911/viz.json';
                cartodb.Image(vizjson_url)
                    .center([20, 10])
                    .zoom(2)
                    .into(document.getElementById('one'))

                var vizjson_url = 'https://wikimedia.cartodb.com/api/v2/viz/f9128ca4-315a-11e5-a737-0e0c41326911/viz.json';
                cartodb.Image(vizjson_url)
                    .center([40, -95])
                    .zoom(4)
                    .into(document.getElementById('two'))
                $('#three').empty()

                cartodb.createVis('three', 'https://wikimedia.cartodb.com/api/v2/viz/84ea519e-401f-11e5-b214-0e9d821ea90d/viz.json');

                // var vizjson_url = 'https://wikimedia.cartodb.com/api/v2/viz/f9128ca4-315a-11e5-a737-0e0c41326911/viz.json';
                // cartodb.Image(vizjson_url)
                //     .center([40, -95])
                //     .zoom(4)
                //     .into(document.getElementById('two'))

                getData("https://wikimedia.cartodb.com/api/v2/sql?q=SELECT title FROM datasource ORDER BY title LIMIT 1 OFFSET 20", function(data) {
                    var cartoDBpageID = data.rows[0].title
                    getData("https://en.wikipedia.org/w/api.php?action=query&format=json&pageids=" + cartoDBpageID, function(data) {
                        console.log(data.query.pages[cartoDBpageID].title)
                    })
                    console.log(data)
                })


                console.log(json)

            } else {
                console.error(xhr.statusText);
            }
        }
        xhr.ontimeout = function() {
            console.log('timedOut')
        }

        xhr.send();

    }

    // This runs the pageEdit graph!
    serverSend(langCode, pageID)
}
