var multipleOne;
var multipleTwo;
var globali = 0;

// The Date Picker thingy. Uses pikaday.js
var picker = new Pikaday({
    field: document.getElementById('datepicker'),
    firstDay: 1,
    minDate: new Date('2000-01-01'),
    maxDate: new Date('2018-12-31'),
    yearRange: [2000, 2018]
});
var pickerTwo = new Pikaday({
    field: document.getElementById('datepickerTwo'),
    firstDay: 1,
    minDate: new Date('2001-01-01'),
    maxDate: new Date('2018-12-31'),
    yearRange: [2000, 2018]
});

/* The Search Functionality Starts */

// This part simply changes the UI. Just to add the the cross button when the WeeklyPedia section is used etc. 
$(document).ready(function() {

    $("#weekShow").click(function() {
        $(".placeholderOne").show()
        $(".placeholderThree").hide()
        $(".placeholderTwo").hide()
    })
    $("#dayShow").click(function() {
        $(".placeholderTwo").show()
        $(".placeholderThree").hide()
        $(".placeholderOne").hide()
    })
    $("#hourShow").click(function() {
        $(".placeholderThree").show()
        $(".placeholderOne").hide()
        $(".placeholderTwo").hide()
    })

    $('.graphs').hide()

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

});



// Starts the search functionality of the article section. It then calls the next 4 functions (requestArticleExtracts, updateNumResults, resetDisplay, updateDisplay)
var search = function(query) {

    var langCode = $(".lang-selector li a").parents(".input-group-btn").find('.btn').text()
    langCode = langCode.replace(" <span class='caret'></span>", "").toLowerCase();

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
        htmlToAdd += "<a nohref onClick=\"grandPlotter(" + pages[pId].pageid +
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

/* WeeklyPedia functionality starts here */
// Automatic Most Editted and most recently editted pages are fetched and displayed. 
function weeklyPedia(parameter) {

    var lastFriday = moment().startOf('isoweek').subtract(2, 'days')
    lastFriday = JSON.stringify(lastFriday).slice(1, 11).replace(/-/g, "")

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

                htmlToAdd += "<a nohref onClick=\"grandPlotter(" + useFulData[i].page_id +
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
                    htmlToAdd += "<a nohref onClick=\"grandPlotter(" + useFulData[i].page_id +
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

// This gets the dimensions of the image. Used by almost every visualization caller. 
function getImageDimensions(url, callback) {
    var img = new Image();
    img.src = url;
    img.onload = function() {
        callback(this.width, this.height);
    }
}

// Puts spaces in numbers! (or commas)
function numberWithSpaces(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Converts the image into base64 format. So that afterwards the entire svg container can be converted to pngß
function convertImgToBase64(url, heightParam, widthParam, callback, outputFormat) {
    var img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function() {
        var canvas = document.createElement('CANVAS');
        var ctx = canvas.getContext('2d');
        canvas.height = this.height;
        canvas.width = this.width;
        ctx.drawImage(this, 0, 0);
        var dataURL = canvas.toDataURL(outputFormat || 'image/png');
        callback(dataURL);
        canvas = null;
    };
    img.src = url;
}

// Clones the JSON objects. dataSource fame.
function clone(obj) {
    if (obj == null || typeof(obj) != 'object')
        return obj;
    var temp = new obj.constructor();
    for (var key in obj)
        temp[key] = clone(obj[key]);
    return temp;
}

var languages = ["en-English",
    "de-German",
    "fr-French",
    "nl-Dutch",
    "it-Italian",
    "pl-Polish",
    "es-Spanish",
    "ru-Russian",
    "ja-Japansese",
    "pt-Portuguese",
    "zh-Chinese",
    "sv-Swedish",
    "vi-Vietnamese",
    "ca-Catalan",
    "fi-Finnish",
    "cs-Czech",
    "hu-Hungarian",
    "ko-Korean",
    "hi-Hindi"
]

//// Have pity on this lonely variable. Find a new home for him. Preferrably somewhere with other variables.
var thereIs;

// Nepal Earthquake

// Jurrasic
// grandPlotter('47084203', '2015 Sousse attacks')

// grandPlotter("April_2015_Nepal_earthquake")

// This is the main place where everything works. All the calls the the APIs ( except for the article seach and weeklypedia suggestions ), pretty much everything lies here. 

function grandPlotter(pageIDin, pageTitlein) {


    // THE UI CHANGES
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
    var myLoader = loader({
        width: 960,
        height: 500,
        container: "#one",
        id: "one"
    });
    myLoader();

    $(".graphs").show()

    document.getElementById('datepicker').value = '';
    document.getElementById('datepickerTwo').value = '';
    var timeLimit = null
    var timeLimitUpper = null


    //// You mad, bro? 
    var pageID = pageIDin;
    var pageTitle

    var jsonObject;
    var lastRevID;

    var langCode = $(".lang-selector li a").parents(".input-group-btn").find('.btn').text()
    langCode = langCode.replace(" <span class='caret'></span>", "").toLowerCase();

    var linkInitialPageEdits = "https://" + langCode + ".wikipedia.org/w/api.php?action=query&prop=revisions&format=json&rvprop=ids%7Ctimestamp%7Cuser%7Cuserid%7Csize&rvlimit=1000&rvcontentformat=text%2Fplain" + "&pageids=" + pageID + "&format=json&callback=?"
    var linkSubsequentPageEdits = "https://" + langCode + ".wikipedia.org/w/api.php?action=query&prop=revisions&format=json&rvprop=ids%7Ctimestamp%7Cuser%7Cuserid%7Csize&rvlimit=1000&rvcontentformat=text%2Fplain" + "&rvstartid=" + lastRevID + "&pageids=" + pageID + "&format=json&callback=?"

    // The limit of results returned currently set to 300. Total number of Wikipedias is 277 ( as of 16/6/15 )
    var linkInitialWordCloud = "https://" + langCode + ".wikipedia.org/w/api.php?action=query&prop=langlinks&format=json&llprop=url%7Clangname%7Cautonym&lllimit=300&iwurl=" + "&pageids=" + pageID + "&format=json&callback=?"

    var linkInitialPageViews = "http://stats.grok.se/json/es/latest90/" + encodeURI(pageTitlein)

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

    function getDataNoCrossOrigin(url, callback) {
        url = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent('select * from json where url="' + url + '"') + '&format=json';
        // console.log(url)
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

    var impDataConcated = [];
    var langLinksJsonObject = []
    var finalJsonObjectLangLinks = [];
    var originalPageID;

    var fullOnData = []

    function getDataExtraParams(url, parameterOne, parameterTwo, originalWikiID, callback) {

        var tempTest = $.ajax({

            url: url,
            async: false,
            dataType: 'json',
            type: 'GET',
            headers: {
                'Api-User-Agent': 'Example/1.0'
            },
            success: function() {

                var i = parameterTwo
                impData = tempTest.responseJSON
                if (parameterTwo == 2) {
                    //console.log(parameterOne)
                    //console.log(tempTest.responseJSON)
                }

                var pageID = Object.keys(impData.query.pages)[0]
                var engTitle = impData.query.pages[pageID].title
                var impData = impData.query.pages[pageID].revisions
                fullOnData = fullOnData.concat(impData)
                    //  console.log(url)
                    // console.log("asdasdasdasddad")
                    // console.log(i + " } " + impData + " } " + pageID)

                // console.log(tempTest.responseJSON)
                // console.log(Object.keys(impData).length)

                if (Object.keys(impData).length == 500) {

                    var wordCloudJsonObjectlastRevID = impData[Object.keys(impData)[Object.keys(impData).length - 1]].revid

                    impDataConcated = impDataConcated.concat(impData)

                    if (parameterTwo == Object.keys(parameterOne).length) {
                        getDataExtraParams("https://" + "en" + ".wikipedia.org/w/api.php?action=query&prop=revisions&format=json&rvprop=ids%7Ctimestamp%7Cuser%7Cuserid%7Csize&rvlimit=1000&rvcontentformat=text%2Fplain" + "&rvstartid=" + wordCloudJsonObjectlastRevID + "&pageids=" + originalWikiID + "&format=json&callback=?", parameterOne, parameterTwo, originalWikiID, callback)
                    } else {
                        var wikiLanguage = parameterOne[parameterTwo].lang;
                        var articleTitle = parameterOne[parameterTwo].articleTitle;
                        getDataExtraParams("https://" + wikiLanguage + ".wikipedia.org/w/api.php?action=query&prop=revisions&format=json&rvprop=ids%7Ctimestamp%7Cuser%7Cuserid%7Csize&rvlimit=1000&rvcontentformat=text%2Fplain" + "&rvstartid=" + wordCloudJsonObjectlastRevID + "&titles=" + articleTitle + "&format=json&callback=?", parameterOne, i, originalWikiID, callback)
                    }

                } else {

                    impDataConcated = impDataConcated.concat(impData)

                    var pageEditsTotal = Object.keys(impDataConcated).length

                    impDataConcated = []

                    // This part is for pushing the values in the final parameter which is passed to the visualizing code.
                    if (parameterTwo < Object.keys(parameterOne).length) {
                        langLinksJsonObject.push({
                            lang: parameterOne[parameterTwo].lang,
                            articleTitle: engTitle,
                            autonym: parameterOne[parameterTwo].autonym,
                            langname: parameterOne[parameterTwo].langname,
                            totalEdits: pageEditsTotal
                        })
                    } else {
                        langLinksJsonObject.push({
                            lang: "en",
                            articleTitle: engTitle,
                            autonym: "English",
                            langname: "English",
                            totalEdits: pageEditsTotal
                        })
                    }

                    // console.log(Object.keys(parameterOne).length + '  ' + parameterTwo)

                    if (parameterTwo == Object.keys(parameterOne).length) {

                        // console.log(langLinksJsonObject)

                        //console.log(fullOnData)

                        var userInputImageURL = $('#imageURL').val()

                        //console.log(userInputImageURL)

                        if (userInputImageURL == "") {
                            // console.log('asdasd')
                            wordCloud("https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original" + "&pageids=" + pageID + "&format=json&callback=?")
                        } else {
                            getImageDimensions(
                                userInputImageURL,
                                function(width, height) {
                                    thereIs = width;

                                    //console.log(pageTitle)

                                    pageEditsTester(fullOnData, "#four", "none", "", "", "day", engTitleengTitle, userInputImageURL, width, height, "cover")
                                    pageEditsTester(fullOnData, "#five", "none", "", "", "hour", engTitle, userInputImageURL, width, height, "cover")

                                    pageEditsTester(fullOnData, "#two", "none", "", "", "day", engTitle, userInputImageURL, width, height)
                                    pageEditsTester(fullOnData, "#three", "none", "", "", "hour", engTitle, userInputImageURL, width, height)
                                    pageEditsTester(fullOnData, "#one", "none", "", "", "week", engTitle, userInputImageURL, width, height)

                                }
                            );
                        }


                    }
                    // Since the mediaWiki API doesn't return the 'english' Wikipedia langlink.
                    else if (parameterTwo == Object.keys(parameterOne).length - 1) {

                        // console.log(impData)
                        getDataExtraParams("https://" + "en" + ".wikipedia.org/w/api.php?action=query&prop=revisions&format=json&rvprop=ids%7Ctimestamp%7Cuser%7Cuserid%7Csize&rvlimit=1000&rvcontentformat=text%2Fplain" + "&pageids=" + originalWikiID + "&format=json&callback=?", parameterOne, parameterTwo + 1, originalWikiID, callback)

                    } else {

                        var wikiLanguage = parameterOne[parameterTwo + 1].lang;
                        var articleTitle = parameterOne[parameterTwo + 1].articleTitle;

                        getDataExtraParams("https://" + wikiLanguage + ".wikipedia.org/w/api.php?action=query&prop=revisions&format=json&rvprop=ids%7Ctimestamp%7Cuser%7Cuserid%7Csize&rvlimit=1000&rvcontentformat=text%2Fplain" + "&titles=" + articleTitle + "&format=json&callback=?", parameterOne, parameterTwo + 1, originalWikiID, callback)

                    }
                }
            },
        });
    }

    var finaljsonObject = [];
    var finaljsonObjectNeverChange = [];

    var linkAddress;

    function pageEdits(url) {

        getData(url, function(data) {

            // console.log(data)

            // This part runs when the pageEdits function or the getData function is used to get the page edits. Otherwise the 'else' part is used (for the thumbnail dimensions and URL)
            if (url.indexOf("revisions") > -1) {

                jsonObject = data;

                // Clean up Data
                var pageID = Object.keys(jsonObject.query.pages)[0]
                pageTitle = jsonObject.query.pages[pageID].title

                jsonObject = jsonObject.query.pages[pageID].revisions

                // Get last revision ID
                lastRevID = jsonObject[Object.keys(jsonObject)[Object.keys(jsonObject).length - 1]].revid

                //  console.log(lastRevID)

                // This is the length of the useful JSON object
                //c.log(Object.keys(jsonObject).length)

                // Run this part of the if - else everytime except for the last time.

                if (Object.keys(jsonObject).length == 500) {

                    pageEdits("https://en.wikipedia.org/w/api.php?action=query&prop=revisions&format=json&rvprop=ids%7Ctimestamp%7Cuser%7Cuserid%7Csize&rvlimit=1000&rvcontentformat=text%2Fplain" + "&rvstartid=" + lastRevID + "&pageids=" + pageID + "&format=json&callback=?")

                    finaljsonObject = finaljsonObject.concat(jsonObject)

                }

                // Run this part of the if - else everytime only for the last time when the callback exits.
                else {


                    finaljsonObject = finaljsonObject.concat(jsonObject)
                        // Not sure about this little thing over here ^

                    // For the pageImage thingy

                    var userInputImageURL = $('#imageURL').val()

                    //console.log(userInputImageURL)

                    if (userInputImageURL == "") {
                        // console.log('asdasd')
                        linkAddress = pageEdits("https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original" + "&pageids=" + pageID + "&format=json&callback=?")
                    } else {
                        getImageDimensions(
                            userInputImageURL,
                            function(width, height) {
                                thereIs = width;

                                //console.log(pageTitle)


                                // pageEditsTester(finaljsonObject, "#one", "none", "", "", "day", pageTitle, photoUrl, width, height)
                                // pageEditsPlotter(finaljsonObject, "#two", "none", "", "", "week", pageTitle, photoUrl, width, height)
                                pageEditsTester(finaljsonObject, "#three", "none", "", "", "hour", pageTitle, userInputImageURL, width, height)
                                pageEditsTester(finaljsonObject, "#two", "none", "", "", "day", pageTitle, userInputImageURL, width, height)
                                pageEditsTester(finaljsonObject, "#one", "none", "", "", "week", pageTitle, userInputImageURL, width, height)

                            }
                        );
                    }

                    // var pageID = Object.keys(linkAddress.query.pages)[0]
                    // linkAddress = linkAddress.query.pages[pageID].thumbnail

                    // initialises runNow function which has the d3 stuff. Passes the concated data as the parameter.

                }

            } else {

                // var linkAddress = getData("https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original" + "&pageids=" + pageID + "&format=json&callback=?")

                // getMeta("https://upload.wikimedia.org/wikipedia/commons/a/ab/China_edcp_location_map.svg");

                linkAddress = data;
                finaljsonObjectNeverChange = finaljsonObject;

                var pageID = Object.keys(linkAddress.query.pages)[0]
                var pageTitle = linkAddress.query.pages[pageID].title

                linkAddress = linkAddress.query.pages[pageID].thumbnail

                // Extrememly Sorry for this shitfuckery!
                var photoUrl = JSON.stringify(linkAddress)
                if (photoUrl != undefined) {
                    photoUrl = photoUrl.substring(13)
                    photoUrl = photoUrl.substring(0, photoUrl.length - 2);

                    getImageDimensions(
                        photoUrl,
                        function(width, height) {

                            thereIs = width;
                            // pageEditsTester(finaljsonObject, "#four", "none", "", "", "hour", pageTitle, userInputImageURL, width, height, "cover")

                            initializer(finaljsonObject, pageTitle, photoUrl, width, height, "CCBYSA")

                            // pageEditsTester(finaljsonObject, "#three", "none", "", "", "hour", pageTitle, photoUrl, width, height)
                            // pageEditsTester(finaljsonObject, "#two", "none", "", "", "day", pageTitle, photoUrl, width, height, "cover")
                            // pageEditsTester(finaljsonObject, "#one", "none", "", "", "week", pageTitle, photoUrl, width, height)

                            // pageEditsSize(finaljsonObject, "#three", "none", "", "", "hour", pageTitle, photoUrl, width, height)


                            // runNow("pageEdits", pageTitle, photoUrl, width, height, finaljsonObject, "", "", "")

                        }
                    );

                } else {
                    // console.log('asdasd')


                    // initializer(finaljsonObject, pageTitle, "assets/defaultImage.jpg", 1000, 500)

                    // pageEditsPlotter(finaljsonObject, "#one", "none", "", "", "day", pageTitle, "assets/defaultImage.jpg", 1000, 500)
                    // pageEditsTester(finaljsonObject, "#one", "none", "", "", "day", pageTitle, "assets/defaultImage.jpg", 1000, 500)
                    // pageEditsPlotter(finaljsonObject, "#two", "none", "", "", "week", pageTitle, "assets/defaultImage.jpg", 1000, 500)
                    pageEditsTester(finaljsonObject, "#three", "none", "", "", "hour", pageTitle, "assets/defaultImage.jpg", 1000, 500)
                    pageEditsTester(finaljsonObject, "#two", "none", "", "", "day", pageTitle, "assets/defaultImage.jpg", 1000, 500)
                    pageEditsTester(finaljsonObject, "#one", "none", "", "", "week", pageTitle, "assets/defaultImage.jpg", 1000, 500)

                    // function runNow(origin, pageTitle, picUrl, picWidth, picHeight, dataSource, dataSourceLangLinks, pageEditCount) {
                    // runNow("pageEdits", pageTitle, "assets/defaultImage.jpg", 1000, 500, finaljsonObject, "", "", "")
                    // runNow("pageEdits", pageTitle, "assets/defaultImage.jpg", 1000, 500, finaljsonObject, "", "", "")

                }

            }
        })
    }

    function initializer(object, pageTitle, url, width, height, atribution) {

        pageEditsTester(object, "#three", "none", "", "", "hour", pageTitle, url, width, height, "stretch", "lineChart", atribution)
        pageEditsTester(object, "#two", "none", "", "", "day", pageTitle, url, width, height, "stretch", "lineChart", atribution)
        pageEditsTester(object, "#one", "none", "", "", "week", pageTitle, url, width, height, "stretch", "lineChart", atribution)
    }

    function wordCloud(wordCloudUrl, langLinksJsonObject) {

        var jsonObjectLangLinks;
        var finalWordCloudJsonObject = [];
        var wordCloudJsonObject;
        var pageEditsTotal = 0;
        // The variable which gets passed.
        // Not sure if this is required!  // It is!
        var wordCloudJsonObjectlastRevID;
        //Need to be global because they need to be pushed into finalJsonObjectLangLinks and passed on as arguments for the plotting function. 
        var articleTitle;
        var wikiLanguage

        getData(wordCloudUrl, function(data) {

            // This part runs when the pageEdits function or the getData function is used to get the page edits. Otherwise the 'else' part is used (for the thumbnail dimensions and URL)
            // Langlinks instead of revisions here
            if (wordCloudUrl.indexOf("langlinks") > -1) {

                jsonObjectLangLinks = data;

                // Clean up Data -- Actually we already have the pageID! Too scared to delete this piece though, it might be that jenga piece which brings down the entire tower!
                var pageID = Object.keys(jsonObjectLangLinks.query.pages)[0]
                jsonObjectLangLinks = jsonObjectLangLinks.query.pages[pageID].langlinks

                // console.log(jsonObjectLangLinks)

                for (i = 0; i < Object.keys(jsonObjectLangLinks).length; i++) {

                    wikiLanguage = jsonObjectLangLinks[i].lang
                    articleTitle = jsonObjectLangLinks[i].url.replace(/.*wiki\//g, "")
                    autonym = jsonObjectLangLinks[i].autonym
                    langname = jsonObjectLangLinks[i].langname

                    finalJsonObjectLangLinks.push({
                        lang: wikiLanguage,
                        articleTitle: articleTitle,
                        autonym: autonym,
                        langname: langname,
                        // totalEdits: pageEditsTotal // --> It'll be added by the getDataExtraParams function
                    })

                }

                // These need to be the parameters of the first entry of finalJsonObjectLangLinks

                wikiLanguage = finalJsonObjectLangLinks[0].lang
                articleTitle = finalJsonObjectLangLinks[0].articleTitle

                // console.log(wikiLanguage + " asdasdasd " + articleTitle)

                getDataExtraParams("https://" + wikiLanguage + ".wikipedia.org/w/api.php?action=query&prop=revisions&format=json&rvprop=ids%7Ctimestamp%7Cuser%7Cuserid%7Csize&rvlimit=1000&rvcontentformat=text%2Fplain" + "&titles=" + articleTitle + "&format=json&callback=?", finalJsonObjectLangLinks, 0, pageID)

            }
            // For image
            else {

                linkAddress = data;

                var pageID = Object.keys(linkAddress.query.pages)[0]
                var pageTitle = linkAddress.query.pages[pageID].title

                linkAddress = linkAddress.query.pages[pageID].thumbnail


                // Extrememly Sorry for this shitfuckery!
                var photoUrl = JSON.stringify(linkAddress)
                if (photoUrl != undefined) {
                    photoUrl = photoUrl.substring(13)
                    photoUrl = photoUrl.substring(0, photoUrl.length - 2);

                    getImageDimensions(
                        photoUrl,
                        function(width, height) {
                            thereIs = width;
                            // pageEditsTester(fullOnData, "#five", "none", "", "", "hour", pageTitle, photoUrl, width, height, "cover")

                            // pageEditsTester(fullOnData, "#four", "none", "", "", "day", pageTitle, photoUrl, width, height, "cover")

                            // pageEditsTester(fullOnData, "#two", "none", "", "", "day", pageTitle, photoUrl, width, height)
                            // pageEditsTester(fullOnData, "#three", "none", "", "", "hour", pageTitle, photoUrl, width, height)
                            // pageEditsTester(fullOnData, "#one", "none", "", "", "week", pageTitle, photoUrl, width, height)

                            runNow(fullOnData, "wordCloud", pageTitle, photoUrl, width, height, "", langLinksJsonObject, 90, "CCBYSA")
                                // function runNow(origin, pageTitle, picUrl, picWidth, picHeight, dataSource, dataSourceLangLinks, pageEditCount, atribution) {

                        }
                    );

                    // return jsonObjectLangLinks
                }
                // This part runs when there is no image for that article
                else {

                    // pageEditsTester(fullOnData, "#two", "none", "", "", "day", pageTitle, "assets/defaultImage.jpg", 1000, 500)

                    runNow("wordCloud", pageTitle, "assets/defaultImage.jpg", 1000, 500, "", langLinksJsonObject)

                    // return jsonObjectLangLinks

                }

            }

        })
    }

    //// Think of a way to combine it with getData
    function pageViews(url, callback) {
        getDataNoCrossOrigin(url, function(data) {
            var arrayData = []

            var requiredData = data.query.results.json.daily_views
            typeof requiredData;

            for (var key in requiredData) {

                if (requiredData.hasOwnProperty(key)) {
                    var keyWithout_ = key.replace("_", "2")
                    arrayData.push({
                        date: keyWithout_,
                        pageViews: requiredData[key]
                    })
                }
            }
            // Sorts the array as per the dates
            arrayData.sort(function(a, b) {
                var c = new Date(a.date);
                var d = new Date(b.date);
                return c - d;
            });

            getData("https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original" + "&titles=" + pageTitlein + "&format=json&callback=?", function(data) {

                linkAddress = data;

                var pageID = Object.keys(linkAddress.query.pages)[0]
                var pageTitle = linkAddress.query.pages[pageID].title

                linkAddress = linkAddress.query.pages[pageID].thumbnail

                // Extrememly Sorry for this shitfuckery!
                var photoUrl = JSON.stringify(linkAddress)
                if (photoUrl != undefined) {
                    photoUrl = photoUrl.substring(13)
                    photoUrl = photoUrl.substring(0, photoUrl.length - 2);

                    getImageDimensions(
                        photoUrl,
                        function(width, height) {
                            thereIs = width;

                            // console.log('asdasdasd')
                            pageViewsPlotter(arrayData, "#seven", "none", "", "", "day", pageTitle, photoUrl, width, height)
                            pageViewsPlotter(arrayData, "#eight", "bundle", "", "", "day", pageTitle, photoUrl, width, height)

                            // pageEditsPlotter(finaljsonObject, "#two", "none", "", "", "week", pageTitle, photoUrl, width, height)

                            // runNow("pageEdits", pageTitle, photoUrl, width, height, finaljsonObject, "", "", "")

                        }
                    );

                } else {


                    pageViewsPlotter(arrayData, "#seven", "none", "", "", "day", pageTitle, "assets/defaultImage.jpg", 1000, 500)
                    pageViewsPlotter(arrayData, "#eight", "bundle", "", "", "day", pageTitle, "assets/defaultImage.jpg", 1000, 500)

                    // pageEditsPlotter(finaljsonObject, "#two", "none", "", "", "week", pageTitle, "assets/defaultImage.jpg", 1000, 500)

                    // function runNow(origin, pageTitle, picUrl, picWidth, picHeight, dataSource, dataSourceLangLinks, pageEditCount) {
                    // runNow("pageEdits", pageTitle, "assets/defaultImage.jpg", 1000, 500, finaljsonObject, "", "", "")
                    // runNow("pageEdits", pageTitle, "assets/defaultImage.jpg", 1000, 500, finaljsonObject, "", "", "")

                }
            })

            // pageViewsPlotter(arrayData)
        })
    }

    function runNow(fullData, origin, pageTitle, picUrl, picWidth, picHeight, dataSource, dataSourceLangLinks, pageEditCount, atribution) {

        var totalEditsAllLanguages = fullData.length

        function wordCloudLangLinks(totalEdits, dataSourceLangLinks, idname, wordText, fontSizeLowerBound, fontSizeUpperBound, atribution, padding) {

            $('#loader').html('');
            $(idname).html('');

            var fullBleedWidth = 1008;
            var fullBleedHeight = 572;

            var margin = {
                    top: 20,
                    right: 20,
                    bottom: 30,
                    left: 50
                },
                width = fullBleedWidth - margin.left - margin.right,
                height = fullBleedHeight - margin.top - margin.bottom;

            var svgBase = d3.select("body").select(idname).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr('class', 'svgBase')
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            var svgFull = svgBase.append("g")
                .attr('class', 'svgFull')
                .attr("transform", "translate(" + (-1) * margin.left + "," + (-1) * margin.top + ")");

            // var color = d3.scale.linear()
            //     .domain([100000,5000, 0])
            //     .color(["#222222", "#333333", "#444444"])
            //     //.domain([1000, 700, 300, 100, 0])
            //     //.range(["#eee", "#e6e6e6", "#ddd", "#d6d6d6", "#ccc"]);

            convertImgToBase64(picUrl, picHeight, picWidth, function(base64Img) {

                imageBase64 = base64Img

                // fullBleedHeight = 100;

                // Image Bleed Stuff
                var imgs = svgFull.selectAll("image").data([0]);
                imgs.enter()
                    .append("svg:image")
                    .attr('class', "images")
                    .attr('id', "image" + idname.slice(1))
                    .attr("xlink:href", function(d) {
                        // if (picUrl == undefined) {
                        //     picUrl = "assets/defaultImage.jpg"
                        //     return "assets/defaultImage.jpg"
                        // } else {
                        // console.log(imageBase64)
                        return imageBase64
                            // }
                    })
                    .attr("x", function(d) {
                        if (picUrl != "http://wikitrends.github.io/assets/defaultImage.jpg") {
                            if (picHeight / picWidth <= fullBleedHeight / fullBleedWidth) {
                                return (((0.5) * (fullBleedHeight / picHeight) * picWidth) - (fullBleedWidth / 2))
                            } else {
                                return 0
                            }
                        } else {
                            return 0
                        }
                    })
                    .attr("y", function(d) {
                        if (picUrl != "http://wikitrends.github.io/assets/defaultImage.jpg") {
                            if (picHeight / picWidth <= fullBleedHeight / fullBleedWidth) {
                                return 0
                            } else {
                                return (((-0.5) * (fullBleedWidth / picWidth) * picHeight) + (fullBleedHeight / 2))
                            }
                        } else {
                            return 0
                        }
                    })
                    .attr("width", function(d) {
                        if (picUrl != "http://wikitrends.github.io/assets/defaultImage.jpg") {
                            if (picHeight / picWidth <= fullBleedHeight / fullBleedWidth) {
                                return (fullBleedHeight / picHeight) * picWidth
                            } else {
                                return fullBleedWidth
                            }
                        } else {
                            return fullBleedWidth
                        }
                    })
                    .attr("height", function(d) {
                        if (picUrl != "http://wikitrends.github.io/assets/defaultImage.jpg") {
                            if (picHeight / picWidth <= fullBleedHeight / fullBleedWidth) {
                                return fullBleedHeight
                            } else {
                                return (fullBleedWidth / picWidth) * picHeight
                            }
                        } else {
                            return fullBleedHeight
                        }
                    });

                if (picUrl != "http://wikitrends.github.io/assets/defaultImage.jpg") {

                    var opacityRect = svgFull.append("rect")
                        .attr("id", "rect" + idname.slice(1))
                        .attr("width", width + margin.right + margin.left)
                        .attr("fill", "black")
                        .attr("opacity", 0.7)
                        .attr("height", height + margin.top + margin.bottom);

                    // if (graphStyle == "cover") {

                    var opacityRect = svgFull.append("rect")
                        .attr("id", "rectCover" + idname.slice(1))
                        .attr("width", width + margin.right + margin.left)
                        .attr("fill", "#f9f9f9")
                        .attr("opacity", 0)
                        .attr("y", 155)
                        .attr("height", height + margin.top + margin.bottom - 155);
                    // }

                }
                var opacityRect = svgFull.append("rect")
                    .attr("id", "rectCover" + idname.slice(1))
                    .attr("width", width + margin.right + margin.left)
                    .attr("fill", "#f9f9f9")
                    .attr("opacity", 0)
                    .attr("y", 155)
                    .attr("height", height + margin.top + margin.bottom - 155);
            });

            convertImgToBase64("assets/wikipediaW.png", picHeight, picWidth, function(base64Img) {
                imageBase64 = base64Img

                // Adding Wikipedia Logo
                d3.select(idname).select('.svgBase')
                    .append("svg:image")
                    .attr("xlink:href", imageBase64)
                    .attr("x", 0)
                    .attr("y", 15)
                    .attr("width", 80)
                    .attr("height", 80);
            })

            convertImgToBase64("assets/" + atribution + ".png", picHeight, picWidth, function(base64Img) {
                imageBase64 = base64Img

                // Adding Wikipedia Logo
                d3.select(idname).select('.svgBase')
                    .append("svg:image")
                    .attr("xlink:href", imageBase64)
                    .attr("x", 100)
                    .attr("y", 65)
                    .attr("width", function() {
                        if (atribution == "CCSA") {
                            return 38.2417582418
                        } else {
                            return 57.6923076923
                        }
                    })
                    .attr("height", 20);
            })

            var totalEditors = dataSourceLangLinks.length

            d3.select(idname).select('.svgBase')
                .append('text')
                .text("Languages")
                .attr("x", function(d) {
                    var length = numberWithSpaces(totalEditors).length
                    return width - (24 * length) - 45 - 15
                })
                .attr("y", 40)
                .attr("font-family", "Helvetica Neue")
                .attr("font-size", function(d) {
                    return "12.33px"
                })
                .attr("font-weight", "500")
                .attr("fill", "#DCDCDC")
                .attr('opacity', "1");

            d3.select(idname).select('.svgBase')
                .append('text')
                .text(numberWithSpaces(totalEditors))
                .attr("x", function(d) {
                    var length = numberWithSpaces(totalEditors).length
                    return width - (24 * length) - 65
                })
                .attr("y", 90)
                .attr("font-family", "Open Sans")
                .attr("font-weight", 700)
                .attr("font-size", function(d) {
                    return "46px"
                })
                .attr("fill", "white")
                .attr('opacity', "1");


            d3.select(idname).select('.svgBase')
                .append('text')
                .text("Total Edits")
                .attr("x", function(d) {
                    var length = numberWithSpaces(totalEditors).length
                    var lengthTwo = numberWithSpaces(totalEdits).length
                    return width - (24 * length) - 90 - (24 * lengthTwo) - 15
                })
                .attr("y", 40)
                .attr("font-family", "Helvetica Neue")
                .attr("font-size", function(d) {
                    return "12.33px"
                })
                .attr("font-weight", "500")
                .attr("fill", "#DCDCDC")
                .attr('opacity', "1");

            d3.select(idname).select('.svgBase')
                .append('text')
                .text(numberWithSpaces(totalEdits))
                .attr("x", function(d) {
                    var length = numberWithSpaces(totalEditors).length
                    var lengthTwo = numberWithSpaces(totalEdits).length
                    return width - (24 * length) - 90 - (24 * lengthTwo) - 15
                })
                .attr("y", 90)
                .attr("font-family", "Open Sans")
                .attr("font-weight", 700)
                .attr("font-size", function(d) {
                    return "46px"
                })
                .attr("fill", "white")
                .attr('opacity', "1");


            d3.select(idname).select('.svgBase')
                .append('text')
                .text(pageTitle)
                // .attr("text-anchor", "end")
                .attr("x", 100)
                .attr("y", 54)
                .attr("font-family", "Georgia")
                .attr("font-size", function(d) {
                    //console.log(pageTitle + picUrl)
                    return "29px"
                })
                .attr("fill", "white")
                .attr('opacity', "1");

            var controlsInsertor = d3.select("#" + idname.slice(1) + "Controls")

            controlsInsertor
                .each(function(d) {

                    // d3.select(this).append("div")
                    //     .attr("class", "sliderSections")
                    //     .each(function(d) {
                    //         d3.select(this).append("label")
                    //             .attr("class", "input-labels-graph")
                    //             .text('CHART TYPE')
                    //         d3.select(this).append("div")
                    //             .attr("class", "btn-group")
                    //             .attr("data-toggle", "buttons")
                    //             .html(function(d) {
                    //                 return "<label class='btn btn-primary active'  id='cover" + idname.slice(1) + "' ><input type='radio' name='options' autocomplete='off' checked=''>Cover</label><label class='btn btn-primary' id='stretch" + idname.slice(1) + "'><input type='radio' name='options' autocomplete='off' checked=''>Stretch</label>"
                    //             })
                    //     });

                    d3.select(this).append("div")
                        .attr("class", "sliderSections")
                        .each(function(d) {
                            d3.select(this).append("label")
                                .attr("class", "input-labels-graph")
                                .text('REFRESH')
                            d3.select(this).append("div")
                                .attr("class", "btn-group")
                                .attr("data-toggle", "buttons")
                                .html(function(d) {
                                    return "<button class='btn btn-default input-button refresher' id='" + idname.slice(1) + "refresher'>Woohoo!</button>"
                                })

                        });

                    d3.select(this).append("div")
                        .attr("class", "sliderSections")
                        .each(function(d) {
                            d3.select(this).append("label")
                                .attr("class", "input-labels-graph")
                                .text('PADDING')
                            d3.select(this).append("input")
                                .attr("type", "range")
                                .attr("min", 20)
                                .attr("max", 100)
                                .style("width", "180px")
                                .attr("id", "opacitySlider" + idname.slice(1))
                        });

                    d3.select(this).append("div")
                        .attr("class", "sliderSections")
                        .each(function(d) {
                            d3.select(this).append("label")
                                .attr("class", "input-labels-graph")
                                .text('RANGE MAPPING')
                                // (top bar changes the minimum size of the words and bottom bar, the maximum size)
                                .each(function(d) {
                                    d3.select(this).append("input")
                                        .attr("type", "range")
                                        .attr("min", 5)
                                        .attr("max", 30)
                                        .style("width", "180px")
                                        .attr("id", "rangeOne" + idname.slice(1))
                                    d3.select(this).append("input")
                                        .attr("type", "range")
                                        .attr("min", 50)
                                        .attr("max", 150)
                                        .style("width", "180px")
                                        .attr("id", "rangeTwo" + idname.slice(1))
                                })
                        });

                    d3.select(this).append("div")
                        .attr("class", "sliderSections")
                        .each(function(d) {
                            d3.select(this).append("label")
                                .attr("class", "input-labels-graph")
                                .text('POSITION ( x & y )')
                                .each(function(d) {
                                    d3.select(this).append("input")
                                        .attr("type", "range")
                                        .attr("min", 200)
                                        .attr("max", 400)
                                        .style("width", "180px")
                                        .attr("id", "translateX" + idname.slice(1))
                                    d3.select(this).append("input")
                                        .attr("type", "range")
                                        .attr("min", 200)
                                        .attr("max", 400)
                                        .style("width", "180px")
                                        .attr("id", "translateY" + idname.slice(1))
                                })
                        });

                    d3.select(this).append("div")
                        .attr("class", "sliderSections")
                        .each(function(d) {
                            d3.select(this).append("label")
                                .attr("class", "input-labels-graph")
                                .text('WIDTH')
                            d3.select(this).append("input")
                                .attr("type", "range")
                                .attr("min", -picWidth)
                                .attr("max", picWidth)
                                .style("width", "180px")
                                .attr("id", "imageWidthSlider" + idname.slice(1))
                        });

                    d3.select(this).append("div")
                        .attr("class", "sliderSections")
                        .each(function(d) {
                            d3.select(this).append("label")
                                .attr("class", "input-labels-graph")
                                .text('HEIGHT')
                            d3.select(this).append("input")
                                .attr("type", "range")
                                .attr("min", -picHeight)
                                .attr("max", picHeight)
                                .style("width", "180px")
                                .attr("id", "imageHeightSlider" + idname.slice(1))
                        });
                })

            var padding = 10;
            var gWidthValue = 1200;
            var gHeightValue = 700;
            var translateXValue = 300;
            var translateYValue = 300;
            var rangeOneValue = 15;
            var rangeTwoValue = 90;

            d3.select("#" + "opacitySlider" + idname.slice(1)).on("input", function() {
                padding = +this.value
                cloudUpdate()
                    // updateOpacity(+this.value);
            });

            d3.select("#" + "imageHeightSlider" + idname.slice(1)).on("input", function() {
                updateImageHeight(+this.value);
            });

            d3.select("#" + "rangeOne" + idname.slice(1)).on("input", function() {
                rangeOneValue = +this.value
                cloudUpdate()
                    // gHeight(+this.value);
            });

            d3.select("#" + "rangeTwo" + idname.slice(1)).on("input", function() {
                rangeTwoValue = +this.value;
                cloudUpdate()

            });

            d3.select("#" + "translateX" + idname.slice(1)).on("input", function() {
                translateXValue = +this.value;
                cloudUpdate()
            });


            d3.select("#" + "translateY" + idname.slice(1)).on("input", function() {
                translateYValue = +this.value;
                cloudUpdate()
            });


            d3.select("#" + "imageWidthSlider" + idname.slice(1)).on("input", function() {
                updateImageWidth(+this.value);
            });

            d3.select("#lineChart" + idname.slice(1)).on("click", function() {

                svgBase.selectAll(".bar")
                    .remove()

                svgBase.append("path")
                    .datum(finale)
                    .attr("class", "upperline")
                    .attr("d", upperline)
                    .attr("fill", "none")
                    .attr("stroke", function() {
                        if (graphStyle == "cover") {
                            return blue
                        } else {
                            return "rgb(94, 255, 176)"
                        }
                    })
                    .attr("stroke-width", "3px")
                    .append('text')
                    .text("Page Edits")
                    .attr("x", function(d) {
                        var length = numberWithSpaces(totalEditors).length
                        var lengthTwo = numberWithSpaces(totalEdits).length
                        return width - (24 * length) - 90 - (24 * lengthTwo) + 5
                    })
                    .attr("y", 40)
                    .attr("font-family", "Helvetica Neue")
                    .attr("font-size", function(d) {
                        return "12.33px"
                    })
                    .attr("font-weight", "500")
                    .attr("fill", "#DCDCDC")
                    .attr('opacity', "1");

            });

            d3.select("#barChart" + idname.slice(1)).on("click", function() {});

            d3.select("#stretch" + idname.slice(1)).on("click", function() {
                // d3.select("#wordCloudContainer").remove()
                // refresher(10, 25, 95)
                // wordCloudLangLinks(langLinksJsonObject, "#four", "autonym", 25, 75, 1000)
            });

            d3.select("#cover" + idname.slice(1)).on("click", function() {

                svgBase.selectAll('.axis line, .axis path')
                    .style({
                        'stroke': '#E3E3E3',
                        'fill': 'none',
                        'stroke-width': '0.8px',
                        "opacity": "0.5"
                    });

                svgBase.select("#rectCover" + idname.slice(1))
                    .style({
                        "opacity": "1"
                    });

                d3.select("#wordCloudContainer").selectAll("text")
                    .style('fill', "#555")

            });

            function cloudUpdate() {
                d3.select("#wordCloudContainer").remove()
                console.log(rangeOneValue)

                refresher(padding * 0.1, rangeOneValue, rangeTwoValue, translateXValue, translateYValue, gWidthValue, gHeightValue)
            }

            // function gHeight(ina) {
            //     d3.select("#wordCloudContainer").remove()
            //     console.log(padding)
            //     refresher(padding*0.01, 15, 95, 300, ina)
            // } 

            // function gHeight(ina) {
            //     d3.select("#wordCloudContainer").remove()
            //     console.log(padding)
            //     refresher(padding*0.01, 15, 95, 300, ina)
            // } 

            // function updateOpacity(ina) {

            //     d3.select("#wordCloudContainer").remove()
            //     // console.log(ina)
            //     refresher(ina*0.01, 15, 95, 300, 300)

            //     // d3.select("#" + "rect" + idname.slice(1))
            //     //     .data([0])
            //     //     .style("opacity", function(d) {
            //     //         // console.log(ina)
            //     //         return ina * 0.01
            //     //     })
            // }

            function updateImageHeight(ina) {
                d3.select("#" + "image" + idname.slice(1))
                    .data([0])
                    .attr("y", function(d) {
                        return ina
                    })
            }

            function updateImageWidth(ina) {
                d3.select("#" + "image" + idname.slice(1))
                    .data([0])
                    .attr("x", function(d) {
                        return ina
                    })
            }

            d3.select("#CCSA").on("click", function() {
                timeLimit = picker.getDate()
                console.log('asdasd')
                timeLimitUpper = pickerTwo.getDate()
                initializer(finaljsonObject, pageTitle, picUrl, picWidth, picHeight, "CCSA")
            })

            d3.select("#CCBYSA").on("click", function() {
                timeLimit = picker.getDate()
                console.log('asdasd')

                timeLimitUpper = pickerTwo.getDate()
                initializer(finaljsonObject, pageTitle, picUrl, picWidth, picHeight, "CCBYSA")
            })

            d3.select("#CCSANC").on("click", function() {
                timeLimit = picker.getDate()
                console.log('asdasd')

                timeLimitUpper = pickerTwo.getDate()
                initializer(finaljsonObject, pageTitle, picUrl, picWidth, picHeight, "CCSANC")
            })

            d3.select("#imageRefresher").on("click", function() {

                timeLimit = picker.getDate()
                timeLimitUpper = pickerTwo.getDate()

                var userInputImageURL = $('#imageURL').val()

                getImageDimensions(
                    userInputImageURL,
                    function(width, height) {

                        thereIs = width;

                        initializer(dataTemp, pageTitle, userInputImageURL, width, height)

                    }
                );
            })

            d3.select(idname + "refresher").on("click", function() {
                d3.select("#wordCloudContainer").remove()
                refresher(padding * 0.1, rangeOneValue, rangeTwoValue, translateXValue, translateYValue, gWidthValue, gHeightValue)
            });

            refresher(10, 15, 95, 300, 300)

            function refresher(padding, rangeOne, rangeTwo, translateX, translateY, gWidth, gHeight) {

                var sizeScale = d3.scale.linear()
                    .domain([0, d3.max(dataSourceLangLinks, function(d) {
                        return d.totalEdits
                    })])
                    .range(
                        [rangeOne, rangeTwo]
                    ); // 95 because 100 was causing stuff to be missing


                var layout = d3.layout.cloud().size([930, 420])
                    .words(dataSourceLangLinks)
                    .padding(padding)
                    .rotate(0)
                    // .text(function(d) {
                    //     if (wordText == "autonym") {
                    //         return d.autonym;
                    //     } else {
                    //         return d.articleTitle;
                    //     }
                    // })
                    .fontSize(function(d) {
                        return sizeScale(d.totalEdits)
                    })
                    .on("end", draw)

                layout.start();

                function draw(words) {
                    svgBase.append("g")
                        .attr("id", "wordCloudContainer")
                        // .attr("transform", "translate(310,320)")
                        .attr("width", gWidth)
                        .attr("height", gHeight)
                        .attr("class", "wordcloud")
                        .append("g")
                        // without the transform, words words would get cutoff to the left and top, they would
                        // appear outside of the SVG area
                        .attr("transform", "translate(" + translateX + "," + translateY + ")")
                        .attr("width", gWidth)
                        .attr("height", gHeight)
                        .selectAll("text")
                        .data(words)
                        .enter().append("text")
                        .style("font-size", function(d) {
                            return sizeScale(d.totalEdits)
                        })
                        .style("fill", function(d, i) {
                            return "#eee";
                        })
                        .attr("transform", function(d) {
                            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                        })
                        .text(function(d) {
                            //  console.log(d.articleTitle)
                            if (wordText == "autonym") {
                                return d.autonym;
                            } else {
                                return d.articleTitle;
                            }
                        });
                }
            }

            function binaryblob() {
                var byteString = atob(document.querySelector("canvas").toDataURL().replace(/^data:image\/(png|jpg);base64,/, "")); //wtf is atob?? https://developer.mozilla.org/en-US/docs/Web/API/Window.atob
                var ab = new ArrayBuffer(byteString.length);
                var ia = new Uint8Array(ab);
                for (var i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                var dataView = new DataView(ab);
                var blob = new Blob([dataView], {
                    type: "image/png"
                });
                var DOMURL = self.URL || self.webkitURL || self;
                var newurl = DOMURL.createObjectURL(blob);

                var img = '<img src="' + newurl + '">';
                d3.select("#img").html(img);
            }

        }

        wordCloudLangLinks(totalEditsAllLanguages, langLinksJsonObject, "#four", "autonym", 25, 75, 10)
    }

    var extract;
    var articleTitle;

    function pageEditsTester(dataSource, idname, interpolation, parameter, plotParameter, timeDuration, pageTitle, picUrl, picWidth, picHeight, graphStyle, chartType, atribution) {

        var blue = "#2196F3"
        var green = "rgb(94, 255, 176)"

        var dataTemp = clone(dataSource)

        d3.select(idname + "Controls").selectAll("*")
            .remove()

// dataTemp.sort(function(a, b) {
//     var c = new Date(a.timestamp);
//     var d = new Date(b.timestamp);
//     return d - c;
// });

// console.log(dataTemp)

// var editors = []
// var editorsCount = 0;

// dataTemp.forEach(function(d, i) {

//     var user = d.user

//     if (editors.indexOf(user) > -1) {
//         d.editorsCount = editorsCount
//     } else {
//         editorsCount = editorsCount + 1;
//         editors.push(user)
//         d.editorsCount = editorsCount
//     }

// })


// dataTemp.forEach(function(d, i) {

//     if (i == dataTemp.length - 1) {
//         d.difference = d.size;
//     } else {
//         d.difference = d.size - dataTemp[i + 1].size;
//     }

// })


        var totalEdits = 0;
// var totalEditors;
        var brokenDownDataSource = []

        dataTemp.forEach(function(d) {

            if (timeLimit == null && timeLimitUpper == null) {
                totalEdits = totalEdits + 1
                // brokenDownDataSource.push({
                //     user: d.user,
                //     timestamp: d.timestamp
                // })
            } else if (timeLimit == null && timeLimitUpper != null) {
                if (moment(d.timestamp).diff(moment(timeLimitUpper)) < 0) {
                    totalEdits = totalEdits + 1
                    // brokenDownDataSource.push({
                    //     user: d.user,
                    //     timestamp: d.timestamp
                    // })
                }
            } else if (timeLimit != null && timeLimitUpper == null) {
                if (moment(d.timestamp).diff(moment(timeLimit)) > 0) {
                    totalEdits = totalEdits + 1
                    // brokenDownDataSource.push({
                    //     user: d.user,
                    //     timestamp: d.timestamp
                    // })
                }
            } else if (timeLimit != null && timeLimitUpper != null) {
                if (moment(d.timestamp).diff(moment(timeLimit)) < 0) {} else {
                    if (moment(d.timestamp).diff(moment(timeLimitUpper)) < 0) {
                        totalEdits = totalEdits + 1
                        // brokenDownDataSource.push({
                        //     user: d.user,
                        //     timestamp: d.timestamp
                        // })
                    }
                }
            }
        })



// var editorLength = {},
//     e;
// for (var i = 0, l = brokenDownDataSource.length; i < l; i++) {
//     e = brokenDownDataSource[i];
//     editorLength[e.user] = (editorLength[e.user] || 0) + 1;
// }


// var totalEditors = Object.keys(editorLength).length

        $('#loader').html('');
        $(idname).html('')

        var fullBleedWidth = 1095;
        var fullBleedHeight = 572;

        var margin = {
                top: 20,
                right: 20,
                bottom: 30,
                left: 50
            },
            width = fullBleedWidth - margin.left - margin.right,
            height = fullBleedHeight - margin.top - margin.bottom;

        //var parseDate = d3.time.format.utc("%Y-%m-%dT%H:%M:%SZ").parse;
        var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S.%LZ").parse;

        var x = d3.time.scale()
            .range([25, width - 225]);

        var y = d3.scale.linear()
            .range([height - 28, 180]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .ticks(4)
            .tickPadding(8)
            .tickSize(0)
            .innerTickSize(0)
            .outerTickSize(0)
            // .tickSize(6, 0)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .ticks(5)
            .tickSize(-width + 200)
            .outerTickSize(0)
            .orient("left");

        var knotChecker;

        var upperline = d3.svg.line()
            // .tension(0.95)
            // .interpolate("bundle")
            .x(function(d, i) {

                if (timeLimit == null && timeLimitUpper == null) {
                    return x(parseDate(d.key));
                } else if (timeLimit == null && timeLimitUpper != null) {
                    if (moment(d.key).diff(moment(timeLimitUpper)) < 0) {
                        return x(parseDate(d.key))
                    }
                    return x(timeLimitUpper)
                } else if (timeLimit != null && timeLimitUpper == null) {
                    if (moment(d.key).diff(moment(timeLimit)) > 0) {
                        return x(parseDate(d.key))
                    }
                    return x(timeLimit)
                } else if (timeLimit != null && timeLimitUpper != null) {
                    if (moment(d.key).diff(moment(timeLimit)) < 0) {
                        return x(timeLimit)
                    } else {
                        if (moment(d.key).diff(moment(timeLimitUpper)) < 0) {
                            return x(parseDate(d.key))
                        } else {
                            return x(timeLimitUpper)
                        }
                    }
                }
            })
            .y(function(d, i) {

                if (timeLimit == null && timeLimitUpper == null) {
                    return y(d.values);
                } else if (timeLimit == null && timeLimitUpper != null) {
                    if (moment(d.key).diff(moment(timeLimitUpper)) < 0) {
                        return y(d.values);
                    } else {
                        return y(0)
                    }
                } else if (timeLimit != null && timeLimitUpper == null) {
                    if (moment(d.key).diff(moment(timeLimit)) > 0) {
                        return y(d.values);
                    } else {
                        return y(0)
                    }
                } else if (timeLimit != null && timeLimitUpper != null) {

                    if (moment(d.key).diff(moment(timeLimit)) < 0) {
                        return y(0)
                    } else {
                        if (moment(d.key).diff(moment(timeLimitUpper)) < 0) {
                            return y(d.values);
                        } else {
                            return y(0)
                        }
                    }
                }
            });

        var svgBase = d3.select("body").select(idname).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr('id', 'testing')
            .append("g")
            .attr('class', 'svgBase')
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var svgFull = svgBase.append("g")
            .attr('class', 'svgFull')
            .attr("transform", "translate(" + (-1) * margin.left + "," + (-1) * margin.top + ")");

        var count = 0;

        var previousParameter = 0;
        var weekInitial;
        var weekNumber;
        var thisWeekNumber;

        var lastDate;
        var totalCount = 0;

        var newData = dataTemp;

        newData.forEach(function(d) {

            var trueTime = d.timestamp

            //// Adding zero insertor for date checker as well. 
            if (timeDuration == "hour") {
                var tempDate = d.timestamp;
                tempDate = tempDate.substring(0, 14)
                tempDate = tempDate.concat("00:01.000Z")
                d.timestamp = tempDate;
            }

            if (timeDuration == "day") {

                // Days
                var tempDate = d.timestamp;
                tempDate = tempDate.substring(0, 10);
                tempDate = tempDate.concat("T00:00:01.000Z");
                d.timestamp = tempDate;
                lastDate = tempDate;
                totalCount = totalCount + 1;

            }

            if (timeDuration == "week") {

                // Weeks
                thisWeekNumber = moment(d.timestamp).week();
                if (weekNumber == thisWeekNumber) {
                    d.timestamp = weekInitial
                    d.timestamp = d.timestamp.substring(0, 10);
                    d.timestamp = d.timestamp.concat("T00:00:01.000Z");
                } else {
                    d.timestamp = d.timestamp.substring(0, 10);
                    d.timestamp = d.timestamp.concat("T00:00:01.000Z");

                    dayOfTheWeek = moment(d.timestamp).day()
                    d.timestamp = JSON.stringify(moment(d.timestamp).subtract(dayOfTheWeek, "days")).replace("\"", "").replace("\"", "")
                    weekInitial = d.timestamp;

                    // console.log(moment(d.timestamp).day())

                    weekNumber = thisWeekNumber
                }

            }

            if (timeDuration == "month") {

                // Month
                var tempDate = d.timestamp;
                tempDate = tempDate.substring(0, 7);
                tempDate = tempDate.concat("-01T00:00:01.000Z");
                d.timestamp = tempDate;
                // console.log(d.timestamp)

            }

            d.timestamptrue = trueTime;

            d.values = 1;
        });

        var data = d3.nest()
            .key(function(d) {
                return d.timestamp;
            })
            .rollup(function(d) {
                return d3.sum(d, function(d) {
                    return d.values;
                });
            }).entries(newData);

        // Attempting to fix the Zero Date problem
        var finale = []

        function timeAxisAggregator() {
            if (timeDuration == "hour") {

                var previousDateActual = "";
                var dayMinusOne;

                data.forEach(function(d, i) {

                    var dayPlusOne = moment(d.key).add(1, 'hour')

                    var theDay = moment(d.key)

                    var previousDate = moment(previousDateActual)

                    //  console.log(JSON.stringify(dayPlusOne) + "  |  " + JSON.stringify(previousDate) + "  |  " + JSON.stringify(dayMinusOne) + "  |  " + JSON.stringify(d.key))

                    // START: At all costs, this needs to be in front of the second part.

                    if (i == 0) {} else {
                        if (JSON.stringify(dayMinusOne) != JSON.stringify(d.key)) {

                            // tempIn is just of temporary string conversions. '"' need to be removed.å
                            var tempIn = JSON.stringify(dayMinusOne).replace("\"", "").replace("\"", "")
                            var smoothner = moment(dayMinusOne).subtract(2, "minutes")

                            finale.push({
                                key: tempIn,
                                values: 0
                            })


                            var tempIn = JSON.stringify(smoothner).replace("\"", "").replace("\"", "")

                            finale.push({
                                key: tempIn,
                                values: 0
                            })


                            //console.log('two  ' + tempIn)

                        } else {

                        }
                    }

                    // END

                    if (i != 0) {

                        if (JSON.stringify(dayPlusOne) != JSON.stringify(previousDate)) {

                            var smoothner = moment(dayPlusOne).add(1, "hour")

                            // tempIn is just of temporary string conversions.
                            var tempIn = JSON.stringify(dayPlusOne).replace("\"", "").replace("\"", "")

                            //console.log(tempIn)

                            finale.push({
                                key: tempIn,
                                values: 0
                            })

                            var smoothner = moment(dayPlusOne).add(2, "minutes")

                            var tempIn = JSON.stringify(smoothner).replace("\"", "").replace("\"", "")

                            finale.push({
                                key: tempIn,
                                values: 0
                            })

                        } else {
                            finale.push({
                                key: JSON.stringify(d.key).replace("\"", "").replace("\"", ""),
                                values: d.values
                            })
                        }
                    } else {}

                    finale.push({
                        key: JSON.stringify(d.key).replace("\"", "").replace("\"", ""),
                        values: d.values
                    })

                    // Checks for the next 
                    dayMinusOne = moment(d.key).subtract(1, 'hour')
                        // console.log(i)
                        // console.log(data.length)

                    // if ( i == data.length - 1 ) {
                    // //console.log('sadas')
                    //     finale.push({
                    //         key: JSON.stringify(d.key).replace("\"", "").replace("\"", ""),
                    //         values: 0
                    //     })                
                    // } 
                    // // d.key = momen
                    // if ( i == 0 ) {
                    // //console.log(JSON.stringify(dayPlusOne).replace("\"", "").replace("\"", ""))

                    //     finale.push({
                    //         key: JSON.stringify(dayPlusOne).replace("\"", "").replace("\"", ""),
                    //         values: 0
                    //     })                
                    // } 
                    // PreviosDateActual is the actual date which follows the current date. It is a misnomer too. 
                    previousDateActual = d.key;
                })
            } else if (timeDuration == "day") {

                // BEWARE BEWARE BEWARE!
                // Countless hours have been spent trying to get this part to work. 
                // TLDR; On MediaWiki APIs, time runs backwards!

                var previousDateActual = "";
                var dayMinusOne;

                data.forEach(function(d, i) {

                    var dayPlusOne = moment(d.key).add(1, 'days')

                    // Daylight Savings (the knot problem)
                    if (JSON.stringify(dayPlusOne).indexOf("T23:00:01.000Z") > -1) {
                        dayPlusOne = moment(dayPlusOne).add(1, "hour")
                    }
                    if (JSON.stringify(dayPlusOne).indexOf("T01:00:01.000Z") > -1) {
                        dayPlusOne = moment(dayPlusOne).subtract(1, "hour")
                    }

                    var theDay = moment(d.key)

                    var previousDate = moment(previousDateActual)

                    //  console.log(JSON.stringify(dayPlusOne) + "  |  " + JSON.stringify(previousDate) + "  |  " + JSON.stringify(dayMinusOne) + "  |  " + JSON.stringify(d.key))

                    // START: At all costs, this needs to be in front of the second part.

                    if (i == 0) {} else {
                        if (JSON.stringify(dayMinusOne) != JSON.stringify(d.key)) {

                            // tempIn is just of temporary string conversions. '"' need to be removed.å
                            var tempIn = JSON.stringify(dayMinusOne).replace("\"", "").replace("\"", "")
                            var smoothner = moment(dayMinusOne).subtract(1, "hour")

                            finale.push({
                                key: tempIn,
                                values: 0
                            })

                            var tempIn = JSON.stringify(smoothner).replace("\"", "").replace("\"", "")

                            finale.push({
                                key: tempIn,
                                values: 0
                            })

                            // console.log('two  ' + tempIn)

                        } else {

                        }
                    }

                    // END

                    if (i != 0) {

                        if (JSON.stringify(dayPlusOne) != JSON.stringify(previousDate)) {

                            var smoothner = moment(dayPlusOne).add(1, "hour")

                            // tempIn is just of temporary string conversions.
                            var tempIn = JSON.stringify(dayPlusOne).replace("\"", "").replace("\"", "")
                                // console.log(tempIn)

                            finale.push({
                                key: tempIn,
                                values: 0
                            })

                            var tempIn = JSON.stringify(smoothner).replace("\"", "").replace("\"", "")

                            finale.push({
                                    key: tempIn,
                                    values: 0
                                })
                                // console.log('One  ' + tempIn)

                        } else {
                            finale.push({
                                key: JSON.stringify(d.key).replace("\"", "").replace("\"", ""),
                                values: d.values
                            })
                        }
                    } else {}

                    finale.push({
                        key: JSON.stringify(d.key).replace("\"", "").replace("\"", ""),
                        values: d.values
                    })

                    // Checks for the next 
                    dayMinusOne = moment(d.key).subtract(1, 'days')

                    // Daylight Savings (the knot problem)
                    if (JSON.stringify(dayMinusOne).indexOf("T23:00:01.000Z") > -1) {
                        dayMinusOne = moment(dayMinusOne).add(1, "hour")

                        // console.log('asdasd' + JSON.stringify(dayMinusOne))
                    }
                    if (JSON.stringify(dayMinusOne).indexOf("T01:00:01.000Z") > -1) {
                        dayMinusOne = moment(dayMinusOne).subtract(1, "hour")

                        // console.log('asdasd' + JSON.stringify(dayMinusOne))
                    }

                    // PreviosDateActual is the actual date which follows the current date. It is a misnomer too. 
                    previousDateActual = d.key;
                })
            } else if (timeDuration == "week") {

                // console.log('asdsa')

                // BEWARE BEWARE BEWARE!
                // Countless hours have been spent trying to get this part to work. 
                // TLDR; On MediaWiki APIs, time runs backwards!

                var previousDateActual = "";
                var dayMinusOne;

                data.forEach(function(d, i) {

                    var dayPlusOne = moment(d.key).add(1, 'week')

                    // Daylight Savings (the knot problem)
                    if (JSON.stringify(dayPlusOne).indexOf("T23:00:01.000Z") > -1) {
                        dayPlusOne = moment(dayPlusOne).add(1, "hour")
                    }
                    if (JSON.stringify(dayPlusOne).indexOf("T01:00:01.000Z") > -1) {
                        dayPlusOne = moment(dayPlusOne).subtract(1, "hour")
                    }

                    var theDay = moment(d.key)

                    var previousDate = moment(previousDateActual)

                    // console.log('Week: ' + JSON.stringify(dayPlusOne) + "  |  " + JSON.stringify(previousDate) + "  |  " + JSON.stringify(dayMinusOne) + "  |  " + JSON.stringify(d.key))

                    // START: At all costs, this needs to be in front of the second part.

                    if (i == 0) {} else {
                        if (JSON.stringify(dayMinusOne) != JSON.stringify(d.key)) {

                            // tempIn is just of temporary string conversions. '"' need to be removed.å
                            var tempIn = JSON.stringify(dayMinusOne).replace("\"", "").replace("\"", "")

                            finale.push({
                                key: tempIn,
                                values: 0
                            })
                        } else {

                        }
                    }
                    // END

                    if (i != 0) {

                        if (JSON.stringify(dayPlusOne) != JSON.stringify(previousDate)) {

                            // tempIn is just of temporary string conversions.
                            var tempIn = JSON.stringify(dayPlusOne).replace("\"", "").replace("\"", "")
                                // console.log(tempIn)

                            finale.push({
                                    key: tempIn,
                                    values: 0
                                })
                                //  console.log('One  ' + tempIn)

                        } else {
                            finale.push({
                                key: JSON.stringify(d.key).replace("\"", "").replace("\"", ""),
                                values: d.values
                            })
                        }
                    } else {}

                    finale.push({
                        key: JSON.stringify(d.key).replace("\"", "").replace("\"", ""),
                        values: d.values
                    })

                    // Checks for the next 
                    dayMinusOne = moment(d.key).subtract(1, 'week')

                    // Daylight Savings (the knot problem)
                    if (JSON.stringify(dayMinusOne).indexOf("T23:00:01.000Z") > -1) {
                        dayMinusOne = moment(dayMinusOne).add(1, "hour")
                    }
                    if (JSON.stringify(dayMinusOne).indexOf("T01:00:01.000Z") > -1) {
                        dayMinusOne = moment(dayMinusOne).subtract(1, "hour")
                    }

                    // PreviosDateActual is the actual date which follows the current date. It is a misnomer too. 
                    previousDateActual = d.key;

                })
            } else if (timeDuration == "month") {

                // BEWARE BEWARE BEWARE!
                // Countless hours have been spent trying to get this part to work. 
                // TLDR; On MediaWiki APIs, time runs backwards!

                var previousDateActual = "";
                var theDayMisnomerPlus;

                data.forEach(function(d, i) {

                    var theDayMisnomerMonth = (d.key).substr(5, 6)

                    var initialPart = (d.key).substr(0, 4)
                    var latterPart = "-01T00:00:01.000Z"

                    var theDayMisnomerMinus = parseInt(theDayMisnomerMonth);

                    if (theDayMisnomerMinus == 12) {

                        // Getting year + 1 & month = 01
                        initialPart = (parseInt(initialPart) + 1).toString()
                        theDayMisnomerMinus = "01"
                        theDayMisnomerMinus = initialPart + "-" + theDayMisnomerMinus + latterPart;

                    } else {
                        theDayMisnomerMinus = theDayMisnomerMinus + 1;
                        theDayMisnomerMinus = theDayMisnomerMinus.toString()

                        // To add 0 in front of months. String socery.
                        if (theDayMisnomerMinus.length == 1) {
                            theDayMisnomerMinus = initialPart + "-0" + theDayMisnomerMinus + latterPart;
                        } else {
                            theDayMisnomerMinus = initialPart + "-" + theDayMisnomerMinus + latterPart;
                        }
                    }

                    var theDay = moment(d.key)

                    var previousDate = moment(previousDateActual)

                    if (JSON.stringify(theDayMisnomerMinus) != JSON.stringify(previousDate)) {

                        // tempIn is just of temporary string conversions.
                        var tempIn = JSON.stringify(theDayMisnomerMinus).replace("\"", "").replace("\"", "")
                            // console.log(tempIn)

                        // Adding the new Zeroed entry at relevant location so as to avoid sorting.
                        data.splice(i, 1, {
                            key: tempIn,
                            values: 0
                        })

                    } else {}

                    // START: At all costs, this needs to be in front before -> theDayMisnomerPlus = moment(d.key).subtract(1, 'days')
                    if (i != 0) {
                        if (JSON.stringify(theDayMisnomerPlus) != JSON.stringify(d.key)) {

                            // tempIn is just of temporary string conversions. '"' need to be removed.å
                            var tempIn = JSON.stringify(theDayMisnomerPlus).replace("\"", "").replace("\"", "")

                            // Adding the new Zeroed entry at relevant location so as to avoid sorting.
                            data.splice(i - 1, 1, {
                                key: tempIn,
                                values: 0
                            })

                        } else {}
                    }

                    // END

                    // Checks for the next 

                    var theDayMisnomerMonth = (d.key).substr(5, 6)

                    var initialPart = (d.key).substr(0, 4)
                    var latterPart = "-01T00:00:01.000Z"

                    var theDayMisnomerPlus = parseInt(theDayMisnomerMonth);

                    if (theDayMisnomerPlus == 1) {

                        // Getting year + 1 & month = 01
                        initialPart = (parseInt(initialPart) - 1).toString()
                        theDayMisnomerPlus = "12"

                        theDayMisnomerPlus = initialPart + "-" + theDayMisnomerPlus + latterPart;
                        // console.log(theDayMisnomerPlus)

                    } else {
                        theDayMisnomerPlus = theDayMisnomerPlus - 1;
                        theDayMisnomerPlus = theDayMisnomerPlus.toString()

                        // To add 0 in front of months. String socery.
                        if (theDayMisnomerPlus.length == 1) {
                            theDayMisnomerPlus = initialPart + "-0" + theDayMisnomerPlus + latterPart;
                        } else {
                            theDayMisnomerPlus = initialPart + "-" + theDayMisnomerPlus + latterPart;
                        }

                        // console.log(theDayMisnomerMinus)
                    }
                    theDayMisnomerPlus = moment(d.key).subtract(1, 'month')
                        // console.log(theDayMisnomerPlus)

                    // PreviosDateActual is the actual date which follows the current date. It is a misnomer too. 
                    previousDateActual = d.key;

                })
            }
        }

        timeAxisAggregator();

        var maxum = d3.max(finale, function(d){
            return d.values
        })

        console.log(maxum)

        finale.sort(function(a, b) {
            var c = new Date(a.key);
            var d = new Date(b.key);
            return d - c;
        });

        x.domain(d3.extent(finale, function(d) {

            if (timeLimit == null && timeLimitUpper == null) {
                // console.log("nullnull")
                return parseDate(d.key);
            } else if (timeLimit == null && timeLimitUpper != null) {
                if (moment(d.key).diff(moment(timeLimitUpper)) < 0) {
                    return parseDate(d.key)
                }
                return timeLimitUpper
            } else if (timeLimit != null && timeLimitUpper == null) {
                if (moment(d.key).diff(moment(timeLimit)) > 0) {
                    return parseDate(d.key)
                }
                return timeLimit
            } else if (timeLimit != null && timeLimitUpper != null) {
                if (moment(d.key).diff(moment(timeLimit)) < 0) {
                    return timeLimit
                } else {
                    if (moment(d.key).diff(moment(timeLimitUpper)) < 0) {
                        return parseDate(d.key)
                    } else {
                        return timeLimitUpper
                    }
                }
            }
        }))
        y.domain(d3.extent(finale, function(d) {

            if (timeLimit == null && timeLimitUpper == null) {
                return d.values;
            } else if (timeLimit == null && timeLimitUpper != null) {
                if (moment(d.key).diff(moment(timeLimitUpper)) < 0) {
                    return d.values;
                } else {
                    return 0
                }
            } else if (timeLimit != null && timeLimitUpper == null) {
                if (moment(d.key).diff(moment(timeLimit)) > 0) {
                    return d.values;
                } else {
                    return 0
                }
            } else if (timeLimit != null && timeLimitUpper != null) {

                if (moment(d.key).diff(moment(timeLimit)) < 0) {
                    return 0
                } else {
                    if (moment(d.key).diff(moment(timeLimitUpper)) < 0) {
                        return d.values;
                    } else {
                        return 0
                    }
                }
            }
        }));

        // Image Bleed Stuff
        var imageBase64 = "";

        if (picUrl === undefined || picUrl === "assets/defaultImage.jpg") {
            picUrl = "http://wikitrends.github.io/assets/defaultImage.jpg"
        } else {}

        convertImgToBase64(picUrl, picHeight, picWidth, function(base64Img) {

            imageBase64 = base64Img

            // Image Bleed Stuff
            var imgs = svgFull.selectAll("image").data([0]);
            imgs.enter()
                .append("svg:image")
                .attr('class', "images")
                .attr('id', "image" + idname.slice(1))
                .attr("xlink:href", function(d) {
                    return imageBase64
                })
                .attr("x", function(d) {
                    if (picUrl != "http://wikitrends.github.io/assets/defaultImage.jpg") {
                        if (picHeight / picWidth <= fullBleedHeight / fullBleedWidth) {
                            return (((0.5) * (fullBleedHeight / picHeight) * picWidth) - (fullBleedWidth / 2))
                        } else {
                            return 0
                        }
                    } else {
                        return 0
                    }
                })
                .attr("y", function(d) {
                    if (picUrl != "http://wikitrends.github.io/assets/defaultImage.jpg") {
                        if (picHeight / picWidth <= fullBleedHeight / fullBleedWidth) {
                            return 0
                        } else {
                            return (((-0.5) * (fullBleedWidth / picWidth) * picHeight) + (fullBleedHeight / 2))
                        }
                    } else {
                        return 0
                    }
                })
                .attr("width", function(d) {
                    if (picUrl != "http://wikitrends.github.io/assets/defaultImage.jpg") {
                        if (picHeight / picWidth <= fullBleedHeight / fullBleedWidth) {
                            return (fullBleedHeight / picHeight) * picWidth
                        } else {
                            return fullBleedWidth
                        }
                    } else {
                        return fullBleedWidth
                    }
                })
                .attr("height", function(d) {
                    if (picUrl != "http://wikitrends.github.io/assets/defaultImage.jpg") {
                        if (picHeight / picWidth <= fullBleedHeight / fullBleedWidth) {
                            return fullBleedHeight
                        } else {
                            return (fullBleedWidth / picWidth) * picHeight
                        }
                    } else {
                        return fullBleedHeight
                    }
                });

            if (picUrl != "http://wikitrends.github.io/assets/defaultImage.jpg") {

                var opacityRect = svgFull.append("rect")
                    .attr("id", "rect" + idname.slice(1))
                    .attr("width", width + margin.right + margin.left)
                    .attr("fill", "black")
                    .attr("opacity", 0.7)
                    .attr("height", height + margin.top + margin.bottom);


                var opacityRect = svgFull.append("rect")
                    .attr("id", "rectCover" + idname.slice(1))
                    .attr("width", width + margin.right + margin.left)
                    .attr("fill", "#F5F5F5")
                    .attr("opacity", 1)
                    .attr("y", 155)
                    .attr("height", height + margin.top + margin.bottom - 155);

            }
        });

        convertImgToBase64("assets/wikipediaW.png", picHeight, picWidth, function(base64Img) {
            imageBase64 = base64Img

            // Adding Wikipedia Logo
            d3.select(idname).select('.svgBase')
                .append("svg:image")
                .attr("xlink:href", imageBase64)
                .attr("x", 0)
                .attr("y", 10)
                .attr("width", 87)
                .attr("height", 87);
        })

        convertImgToBase64("assets/" + atribution + ".png", picHeight, picWidth, function(base64Img) {
            imageBase64 = base64Img

            // Adding Wikipedia Logo
            d3.select(idname).select('.svgBase')
                .append("svg:image")
                .attr("xlink:href", imageBase64)
                .attr("x", 110)
                .attr("y", 85)
                .attr("width", function() {
                    if (atribution == "CCSA") {
                        return 38.2417582418
                    } else {
                        return 57.6923076923
                    }
                })
                .attr("height", 20);
        })

        // d3.select(idname).select('.svgBase')
        //     .append('text')
        //     .text("Page Edits")
        //     .attr("x", function(d) {
        //         var length = numberWithSpaces(totalEditors).length
        //         var lengthTwo = numberWithSpaces(totalEdits).length
        //         return width - (24 * length) - 90 - (24 * lengthTwo) + 5
        //     })
        //     .attr("y", 40)
        //     .attr("font-family", "Helvetica Neue")
        //     .attr("font-size", function(d) {
        //         return "12.33px"
        //     })
        //     .attr("font-weight", "500")
        //     .attr("fill", "#DCDCDC")
        //     .attr('opacity', "1");

        // d3.select(idname).select('.svgBase')
        //     .append('text')
        //     .text(numberWithSpaces(totalEdits))
        //     .attr("x", function(d) {
        //         var length = numberWithSpaces(totalEditors).length
        //         var lengthTwo = numberWithSpaces(totalEdits).length
        //         return width - (24 * length) - 90 - (24 * lengthTwo)
        //     })
        //     .attr("y", 90)
        //     .attr("font-family", "Open Sans")
        //     .attr("font-weight", 700)
        //     .attr("font-size", function(d) {
        //         return "46px"
        //     })
        //     .attr("fill", "white")
        //     .attr('opacity', "1");

        d3.select(idname).select('.svgBase')
            .append('text')
            .attr('id', 'textHeader')
            .text("Page Edits")
            .attr("x", function(d) {
                var length = numberWithSpaces(totalEdits).length
                return width - (24 * length) - 45 + 5
            })
            .attr("y", 220)
            .attr("font-family", "Helvetica Neue")
            .attr("font-size", function(d) {
                return "12.33px"
            })
            .attr("font-weight", "500")
            .attr("fill", "#444")
            .attr('opacity', "1");

        d3.select(idname).select('.svgBase')
            .append('text')
            .text(numberWithSpaces(totalEdits))
            .attr("x", function(d) {
                var length = numberWithSpaces(totalEdits).length
                return width - (24 * length) - 45
            })
            .attr("y", 270)
            .attr("font-family", "Open Sans")
            .attr("font-weight", 700)
            .attr("font-size", function(d) {
                return "46px"
            })
            .attr("fill", blue)
            .attr('opacity', "1");

        d3.select(idname).select('.svgBase')
            .append('text')
            .text(pageTitle)
            // .attr("text-anchor", "end")
            .attr("x", 110)
            .attr("y", 70)
            .attr("font-family", "Georgia")
            .attr("font-size", function(d) {
                return "29px"
            })
            .attr("fill", "white")
            .attr('opacity', "1");

        d3.select(idname).select('.svgBase')
            .append('text')
            .text("Number of Page Edits per " + timeDuration)
            // .attr("text-anchor", "end")
            .attr("x", 110)
            .attr("y", 34)
            .attr("font-family", "Helvetica Neue")
            .attr("font-size", function(d) {
                return "17.5px"
            })
            .attr("fill", "white")
            .attr('opacity', "1");

        d3.select(idname).select('.svgBase')
            .append('text')
            .attr('id', "author" + idname.slice(1))
            .text("")
            // .attr("text-anchor", "end")
            .attr("y", 100)
            .attr("x", function() {
                if (atribution == "CCSA") {
                    return 38.2417582418 + 120
                } else {
                    return 57.6923076923 + 120
                }
            })
            .attr("font-family", "Helvetica Neue")
            .attr("font-size", function(d) {
                return "17.5px"
            })
            .attr("font-weight", "400")
            .attr("fill", "white")
            .attr('opacity', "1");

        svgBase.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll("text")
            .style("fill", "#999")
            .attr("dy", -15)
            .style("font-family", "Source Sans Pro")
            .style("font-weight", "100")
            .style("font-size", "16px");

        svgBase.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .selectAll("text")
            // .attr("transform", "rotate(-90)")
            .attr("dx", 1)
            .attr("dy", -9)
            .style("text-anchor", "start")
            .style("fill", "#999")
            .style("font-family", "Source Sans Pro")
            .style("font-weight", "100")
            .style("font-size", "16px")
            // .selectAll("line")
            //     .style("stroke-width", "30px")
            //     .style("stroke", "white")

        if (graphStyle == "cover") {

            svgBase.selectAll('.axis line, .axis path')
                .style({
                    'stroke': '#E3E3E3',
                    'fill': 'none',
                    'stroke-width': '0.8px',
                    "opacity": "0.5"
                });
        } else {
            svgBase.selectAll('.axis line, .axis path')
                .style({
                    'stroke': '#ddd',
                    'fill': 'none',
                    'stroke-width': '0.7px',
                    "opacity": "0.4"
                });
        }

        if (chartType == "barChart") {

            var a = moment(x.domain()[1]);
            var b = moment(x.domain()[0]);

            var difference = a.diff(b, timeDuration)

            svgBase.selectAll(".bar")
                .data(finale)
                .enter()
                .append("rect")
                .attr("class", "bar")
                .attr("x", function(d, i) {

                    if (timeLimit == null && timeLimitUpper == null) {
                        return x(parseDate(d.key)) - ((width) / difference) / 2
                    } else if (timeLimit == null && timeLimitUpper != null) {
                        if (moment(d.key).diff(moment(timeLimitUpper)) < 0) {
                            return x(parseDate(d.key)) - ((width) / difference) / 2
                        }
                        return x(timeLimitUpper)
                    } else if (timeLimit != null && timeLimitUpper == null) {
                        if (moment(d.key).diff(moment(timeLimit)) > 0) {
                            return x(parseDate(d.key)) - ((width) / difference) / 2
                        }
                        return x(timeLimit)
                    } else if (timeLimit != null && timeLimitUpper != null) {
                        if (moment(d.key).diff(moment(timeLimit)) < 0) {
                            return x(timeLimit)
                        } else {
                            if (moment(d.key).diff(moment(timeLimitUpper)) < 0) {
                                return x(parseDate(d.key)) - ((width) / difference) / 2
                            } else {
                                return x(timeLimitUpper)
                            }
                        }
                    }

                    // console.log(d.key)
                    // console.log(parseDate(d.key))
                    // console.log(x(parseDate(d.key)))

                    // return x(parseDate(d.key)) - ((width) / difference)/2

                })
                .attr("width", function() {

                    // var barWidth = width / difference 
                    // if ( barWidth < 5 ) {
                    //     return 3
                    // }
                    // return ( width / difference )
                    return (width / difference) - ((width / difference) / 5)
                })
                .attr("y", function(d) {
                    return y(d.values)
                })
                .attr("height", function(d) {

                    if (timeLimit == null && timeLimitUpper == null) {
                        return height - y(d.values)
                    } else if (timeLimit == null && timeLimitUpper != null) {
                        if (moment(d.key).diff(moment(timeLimitUpper)) < 0) {
                            return height - y(d.values)
                        } else {
                            return height - y(0)
                        }
                    } else if (timeLimit != null && timeLimitUpper == null) {
                        if (moment(d.key).diff(moment(timeLimit)) > 0) {
                            return height - y(d.values)
                        } else {
                            return height - y(0)
                        }
                    } else if (timeLimit != null && timeLimitUpper != null) {

                        if (moment(d.key).diff(moment(timeLimit)) < 0) {
                            return y(0)
                        } else {
                            if (moment(d.key).diff(moment(timeLimitUpper)) < 0) {
                                return height - y(d.values)
                            } else {
                                return height - y(0)
                            }
                        }
                    }

                    // return height - y(d.values)

                })
                .attr("opacity", function(d) {
                    return 0.5
                })
                .attr("shape-rendering", "crispEdges")
                .attr("fill", function(d) {
                    return "#2196F3"
                })
        } else {
            svgBase.append("path")
                .datum(finale)
                .attr("class", "upperline")
                .attr("d", upperline)
                .attr("fill", "none")
                .attr("stroke", function() {
                    if (graphStyle == "cover") {
                        return "#2196F3"
                    } else {
                        return blue
                    }
                })
                .attr("stroke-width", "4px")
                .append('text')
                .text("Page Edits")
                .attr("x", function(d) {
                    var lengthTwo = numberWithSpaces(totalEdits).length
                    return width - (24 * length) - 90 - (24 * lengthTwo) + 5
                })
                .attr("y", 40)
                .attr("font-family", "Helvetica Neue")
                .attr("font-size", function(d) {
                    return "12.33px"
                })
                .attr("font-weight", "500")
                .attr("fill", "#DCDCDC")
                .attr('opacity', "1");
        }


        dataTemp.sort(function(a, b) {
            var c = new Date(a.values);
            var d = new Date(b.values);
            return d - c;
        });

        


        // var rectangle = svgBase.append("rect")
        //     // .attr("x", d3.mouse(this)[0])
        //     // .attr("y", d3.mouse(this)[1])
        //     .attr("width", 100)
        //     .attr("fill", "black")
        //     .attr("opacity", 0.7)
        //     .attr("height", 100)
        //     .call(drag);

        // var text = svgBase.append("rect")
        //     .attr("id", "rect" + idname.slice(1))
        //     .attr("width", 100)
        //     .attr("fill", "black")
        //     .attr("opacity", 0.7)
        //     .attr("height", 100)
        //     .call(drag);

        // svgBase.selectAll("circle.line")
        //     .data(data)
        //     .enter().append("svg:circle")
        //     .attr("class", "line")
        //     .style("fill", "green")
        //     .attr("cx", upperline.x())
        //     .attr("cy", upperline.y())
        //     .attr("r", 12)
        //     .attr('opacity', 0)
        //     .on("click", function(d) {})

        d3.select(idname + "Controls")
            .selectAll("div")
            .data([0])
            .enter()
            .append("div")
            .attr("id", function(d) {
                return "controls" + idname.slice(1)
            })

        var controlsInsertor = d3.select("#" + idname.slice(1) + "Controls")

        controlsInsertor
            .each(function(d) {
                d3.select(this).append("div")
                    .attr("class", "sliderSections")
                    .each(function(d) {
                        d3.select(this).append("label")
                            .attr("class", "input-labels-graph")
                            .text('CHART TYPE')
                        d3.select(this).append("div")
                            .attr("class", "btn-group")
                            .attr("data-toggle", "buttons")
                            .html(function(d) {
                                return "<label id='lineChart" + idname.slice(1) + "'class='btn btn-primary active'><input type='radio' name='options' autocomplete='off' checked=''>Line Chart</label><label  id='barChart" + idname.slice(1) + "' class='btn btn-primary'><input type='radio' name='options' autocomplete='off' checked=''>Bar Chart</label>"
                            })
                    });

                d3.select(this).append("div")
                    .attr("class", "sliderSections")
                    .each(function(d) {
                        d3.select(this).append("label")
                            .attr("class", "input-labels-graph")
                            .text('CHART TYPE')
                        d3.select(this).append("div")
                            .attr("class", "btn-group")
                            .attr("data-toggle", "buttons")
                            .html(function(d) {
                                return "<label class='btn btn-primary active'  id='cover" + idname.slice(1) + "' ><input type='radio' name='options' autocomplete='off' checked=''>Cover</label><label class='btn btn-primary' id='stretch" + idname.slice(1) + "'><input type='radio' name='options' autocomplete='off' checked=''>Stretch</label>"
                            })
                    });

                d3.select(this).append("div")
                    .attr("class", "sliderSections")
                    .each(function(d) {
                        d3.select(this).append("label")
                            .attr("class", "input-labels-graph")
                            .text('DOWNLOAD')
                        d3.select(this).append("div")
                            .attr("class", "btn-group")
                            .attr("data-toggle", "buttons")
                            .html(function(d) {
                                return "<button class='btn btn-default input-button pngExporter' id='" + idname.slice(1) + "PngConvertor'>Woohoo!</button>"
                            })

                    });

                d3.select(this).append("div")
                    .attr("class", "sliderSections")
                    .each(function(d) {
                        d3.select(this).append("label")
                            .attr("class", "input-labels-graph")
                            .text('OPACITY')
                        d3.select(this).append("input")
                            .attr("type", "range")
                            .attr("min", 20)
                            .attr("max", 100)
                            .style("width", "180px")
                            .attr("id", "opacitySlider" + idname.slice(1))
                    });

                d3.select(this).append("div")
                    .attr("class", "sliderSections")
                    .each(function(d) {
                        d3.select(this).append("label")
                            .attr("class", "input-labels-graph")
                            .text('WIDTH')
                        d3.select(this).append("input")
                            .attr("type", "range")
                            .attr("min", -picWidth)
                            .attr("max", picWidth)
                            .style("width", "180px")
                            .attr("id", "imageWidthSlider" + idname.slice(1))
                    });

                d3.select(this).append("div")
                    .attr("class", "sliderSections")
                    .each(function(d) {
                        d3.select(this).append("label")
                            .attr("class", "input-labels-graph")
                            .text('HEIGHT')
                        d3.select(this).append("input")
                            .attr("type", "range")
                            .attr("min", -picHeight)
                            .attr("max", picHeight)
                            .style("width", "180px")
                            .attr("id", "imageHeightSlider" + idname.slice(1))
                    });

                d3.select(this).append("div")
                    .attr("class", "sliderSections")
                    .each(function(d) {
                        d3.select(this).append("label")
                            .attr("class", "input-labels-graph")
                            .text('Author')
                        d3.select(this).append("input")
                            .attr("type", "text")
                            .attr("class", "form-control")
                            .attr("placeholder", "Graph Title")
                            .style("width", "180px")
                            .attr("id", "authorName" + idname.slice(1))

                    });
            })

        // controlsInsertor.append("label")
        //     .attr("class", "input-labels-graph")
        //     .text('asdasd')

        // controlsInsertor.append("input")
        // .attr("type", "range")
        // .attr("min", -picHeight)
        // .attr("max", picHeight)
        // .style("width", "200px")
        // .attr("id", "imageHeightSlider" + idname.slice(1))

        // controlsInsertor.append("label")
        //     .attr("class", "input-labels-graph")
        //     .text('asdasd')

        // controlsInsertor.append("input")
        //     .attr("type", "range")
        //     .attr("min", -picWidth)
        //     .attr("max", picWidth)
        //     .style("width", "200px")
        //     .attr("id", "imageWidthSlider" + idname.slice(1))

        d3.select("#" + "opacitySlider" + idname.slice(1)).on("input", function() {
            updateOpacity(+this.value);
        });

        d3.select("#" + "imageHeightSlider" + idname.slice(1)).on("input", function() {
            updateImageHeight(+this.value);
        });

        d3.select("#" + "imageWidthSlider" + idname.slice(1)).on("input", function() {
            updateImageWidth(+this.value);
        });

        d3.select("#lineChart" + idname.slice(1)).on("click", function() {

            svgBase.selectAll(".bar")
                .remove()

            svgBase.append("path")
                .datum(finale)
                .attr("class", "upperline")
                .attr("d", upperline)
                .attr("fill", "none")
                .attr("stroke", function() {
                    // if (graphStyle == "cover") {
                    return blue
                        // } else {
                        //     return "rgb(94, 255, 176)"
                        // }
                })
                .attr("stroke-width", "3px")
                .append('text')
                .text("Page Edits")
                .attr("x", function(d) {
                    // var length = numberWithSpaces(totalEditors).length
                    var lengthTwo = numberWithSpaces(totalEdits).length
                    return width - (24 * length) - 90 - (24 * lengthTwo) + 5
                })
                .attr("y", 40)
                .attr("font-family", "Helvetica Neue")
                .attr("font-size", function(d) {
                    return "12.33px"
                })
                .attr("font-weight", "500")
                .attr("fill", "#DCDCDC")
                .attr('opacity', "1");
        });

        d3.select("#barChart" + idname.slice(1)).on("click", function() {

            svgBase.selectAll(".upperline")
                .remove()

            var a = moment(x.domain()[1]);
            var b = moment(x.domain()[0]);

            var difference = a.diff(b, timeDuration)

            console.log(difference)

            console.log(finale)

            svgBase.selectAll(".bar")
                .data(finale)
                .enter()
                .append("rect")
                .attr("class", "bar")
                .attr("x", function(d, i) {

                    if (timeLimit == null && timeLimitUpper == null) {
                        return x(parseDate(d.key)) - ((width) / difference) / 2
                    } else if (timeLimit == null && timeLimitUpper != null) {
                        if (moment(d.key).diff(moment(timeLimitUpper)) < 0) {
                            return x(parseDate(d.key)) - ((width) / difference) / 2
                        }
                        return x(timeLimitUpper)
                    } else if (timeLimit != null && timeLimitUpper == null) {
                        if (moment(d.key).diff(moment(timeLimit)) > 0) {
                            return x(parseDate(d.key)) - ((width) / difference) / 2
                        }
                        return x(timeLimit)
                    } else if (timeLimit != null && timeLimitUpper != null) {
                        if (moment(d.key).diff(moment(timeLimit)) < 0) {
                            return x(timeLimit)
                        } else {
                            if (moment(d.key).diff(moment(timeLimitUpper)) < 0) {
                                return x(parseDate(d.key)) - ((width) / difference) / 2
                            } else {
                                return x(timeLimitUpper)
                            }
                        }
                    }

                    // console.log(d.key)
                    // console.log(parseDate(d.key))
                    // console.log(x(parseDate(d.key)))

                    // return x(parseDate(d.key)) - ((width) / difference)/2

                })
                .attr("width", function() {

                    return (width / difference) - ((width / difference) / 3)
                })
                .attr("y", function(d) {
                    console.log(y(0))
                    return y(d.values)
                })
                .attr("height", function(d) {

                    if (timeLimit == null && timeLimitUpper == null) {
                        return height - y(d.values) - 30
                    } else if (timeLimit == null && timeLimitUpper != null) {
                        if (moment(d.key).diff(moment(timeLimitUpper)) < 0) {
                            return height - y(d.values) - 30
                        } else {
                            return height - y(0) - 30
                        }
                    } else if (timeLimit != null && timeLimitUpper == null) {
                        if (moment(d.key).diff(moment(timeLimit)) > 0) {
                            return height - y(d.values) - 30
                        } else {
                            return height - y(0) - 30
                        }
                    } else if (timeLimit != null && timeLimitUpper != null) {

                        if (moment(d.key).diff(moment(timeLimit)) < 0) {
                            return height - y(0) - 30
                        } else {
                            if (moment(d.key).diff(moment(timeLimitUpper)) < 0) {
                                return height - y(d.values) - 30
                            } else {
                                return height - y(0) - 30
                            }
                        }
                    }

                    // return height - y(d.values)

                })
                .attr("opacity", function(d) {
                    return 1
                })
                .attr("shape-rendering", "crispEdges")
                .attr("fill", function(d) {
                    return "#2196F3"
                })
        });

        d3.select("#stretch" + idname.slice(1)).on("click", function() {

            svgBase.selectAll('.axis line, .axis path')
                .style({
                    'stroke': '#ddd',
                    'fill': 'none',
                    'stroke-width': '0.7px',
                    "opacity": "0.4"
                });

            svgBase.select("#rectCover" + idname.slice(1))
                .style({
                    "opacity": "0"
                });

            svgBase.selectAll("#textHeader")
                .style({
                    'fill': '#DCDCDC'
                });

            svgBase.selectAll(".upperline")
                .remove()

            svgBase.append("path")
                .datum(finale)
                .attr("class", "upperline")
                .attr("d", upperline)
                .attr("fill", "none")
                .attr("stroke", function() {
                    return blue
                })
                .attr("stroke-width", "4px")
                .append('text')
                .text("Page Edits")
                .attr("x", function(d) {
                    var length = numberWithSpaces(totalEditors).length
                    var lengthTwo = numberWithSpaces(totalEdits).length
                    return width - (24 * length) - 90 - (24 * lengthTwo) + 5
                })
                .attr("y", 40)
                .attr("font-family", "Helvetica Neue")
                .attr("font-size", function(d) {
                    return "12.33px"
                })
                .attr("font-weight", "500")
                .attr("fill", "#DCDCDC")
                .attr('opacity', "1");
        });

        d3.select("#cover" + idname.slice(1)).on("click", function() {

            svgBase.selectAll('.axis line, .axis path')
                .style({
                    'stroke': '#E3E3E3',
                    'fill': 'none',
                    'stroke-width': '0.8px',
                    "opacity": "0.5"
                });

            svgBase.select("#rectCover" + idname.slice(1))
                .style({
                    "opacity": "1"
                });

            svgBase.selectAll(".upperline")
                .remove()

            svgBase.selectAll("#textHeader")
                .style({
                    'fill': '#333'
                });

            svgBase.append("path")
                .datum(finale)
                .attr("class", "upperline")
                .attr("d", upperline)
                .attr("fill", "none")
                .attr("stroke", function() {
                    // if (graphStyle == "cover") {
                    return blue
                        // } else {
                        //     return "rgb(94, 255, 176)"
                        // }
                })
                .attr("stroke-width", "4px")
                .append('text')
                .text("Page Edits")
                .attr("x", function(d) {
                    var length = numberWithSpaces(totalEditors).length
                    var lengthTwo = numberWithSpaces(totalEdits).length
                    return width - (24 * length) - 90 - (24 * lengthTwo) + 5
                })
                .attr("y", 40)
                .attr("font-family", "Helvetica Neue")
                .attr("font-size", function(d) {
                    return "12.33px"
                })
                .attr("font-weight", "500")
                .attr("fill", "#DCDCDC")
                .attr('opacity', "1");
        });

        d3.select("#" + "authorName" + idname.slice(1)).on("input", function() {
            console.log(this.value)
            d3.select("#" + "author" + idname.slice(1))
                .text(this.value);
        });

        function updateOpacity(ina) {
            d3.select("#" + "rect" + idname.slice(1))
                .data([0])
                .style("opacity", function(d) {
                    // console.log(ina)
                    return ina * 0.01
                })
        }

        function updateImageHeight(ina) {
            d3.select("#" + "image" + idname.slice(1))
                .data([0])
                .attr("y", function(d) {
                    return ina
                })
        }

        function updateImageWidth(ina) {
            d3.select("#" + "image" + idname.slice(1))
                .data([0])
                .attr("x", function(d) {
                    return ina
                })
        }

        d3.select("#CCSA").on("click", function() {
            timeLimit = picker.getDate()
            console.log('asdasd')
            timeLimitUpper = pickerTwo.getDate()
            initializer(finaljsonObject, pageTitle, picUrl, picWidth, picHeight, "CCSA")
        })

        d3.select("#CCBYSA").on("click", function() {
            timeLimit = picker.getDate()
            console.log('asdasd')

            timeLimitUpper = pickerTwo.getDate()
            initializer(finaljsonObject, pageTitle, picUrl, picWidth, picHeight, "CCBYSA")
        })

        d3.select("#CCSANC").on("click", function() {
            timeLimit = picker.getDate()
            console.log('asdasd')

            timeLimitUpper = pickerTwo.getDate()
            initializer(finaljsonObject, pageTitle, picUrl, picWidth, picHeight, "CCSANC")
        })

        d3.select(idname)
            .selectAll("path.domain")
            .remove()

        d3.select("#imageRefresher").on("click", function() {

            timeLimit = picker.getDate()
            timeLimitUpper = pickerTwo.getDate()

            var userInputImageURL = $('#imageURL').val()

            getImageDimensions(
                userInputImageURL,
                function(width, height) {

                    thereIs = width;

                    initializer(dataTemp, pageTitle, userInputImageURL, width, height)

                }
            );
        })

        d3.select(idname + "PngConvertor").on("click", function() {
            var html = d3.select(idname).select("svg")
                .attr("version", 1.1)
                .attr("xmlns", "http://www.w3.org/2000/svg")
                .node().parentNode.innerHTML;

            html = html.match(/(.*)<\/svg>/g)[0]

            var imgsrc = 'data:image/svg+xml;base64,' + btoa(html);
            var img = '<img src="' + imgsrc + '">';

            var canvas = document.querySelector("canvas"),
                context = canvas.getContext("2d");

            var image = new Image;
            image.src = imgsrc;
            image.onload = function() {

                canvas.height = 572;
                canvas.width = 1095;

                context.drawImage(image, 0, 0);

                //save and serve it as an actual filename
                binaryblob();

                var a = document.createElement("a");
                a.download = "sample.png";
                a.href = canvas.toDataURL("image/png");

                var pngimg = '<img src="' + a.href + '">';
                d3.select("#pngdataurl").html(pngimg);

                a.click();
            };
        });

        function binaryblob() {
            var byteString = atob(document.querySelector("canvas").toDataURL().replace(/^data:image\/(png|jpg);base64,/, "")); //wtf is atob?? https://developer.mozilla.org/en-US/docs/Web/API/Window.atob
            var ab = new ArrayBuffer(byteString.length);
            var ia = new Uint8Array(ab);
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            var dataView = new DataView(ab);
            var blob = new Blob([dataView], {
                type: "image/png"
            });
            var DOMURL = self.URL || self.webkitURL || self;
            var newurl = DOMURL.createObjectURL(blob);

            var img = '<img src="' + newurl + '">';
            d3.select("#img").html(img);
        }

        d3.select("#dateRefresher").on("click", function() {
            timeLimit = picker.getDate()
            timeLimitUpper = pickerTwo.getDate()
            initializer(finaljsonObject, pageTitle, picUrl, picWidth, picHeight, "CCBYSA")
        })

        d3.select("#author").on("input", function() {
            // d3.selectAll('author').text('Hello')
            // console.log('asd')
            // console.log('asd')
            // timeLimit = picker.getDate()
            // timeLimitUpper = pickerTwo.getDate()
            // initializer(finaljsonObject, pageTitle, picUrl, picWidth, picHeight, "CCBYSA")
        })
    }

    function pageViewsPlotter(dataSource, idname, interpolation, parameter, plotParameter, timeDuration, pageTitle, picUrl, picWidth, picHeight) {

        $('#loader').html('');
        $(idname).html('');

        var fullBleedWidth = 1008;
        var fullBleedHeight = 572;

        var margin = {
                top: 20,
                right: 20,
                bottom: 30,
                left: 50
            },
            width = fullBleedWidth - margin.left - margin.right,
            height = fullBleedHeight - margin.top - margin.bottom;

        //var parseDate = d3.time.format.utc("%Y-%m-%dT%H:%M:%SZ").parse;
        var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S.%LZ").parse;
        var parseDate = d3.time.format("%Y-%m-%d").parse;

        var x = d3.time.scale()
            .range([25, width - 25]);

        var y = d3.scale.linear()
            .range([height, 150]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .ticks(4)
            .tickPadding(8)
            .tickSize(0)
            .innerTickSize(0)
            .outerTickSize(0)
            // .tickSize(6, 0)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .ticks(5)
            .tickSize(-width + 20)
            .outerTickSize(0)
            .orient("left");

        // var knotChecker;

        var upperline = d3.svg.line()
            .interpolate(interpolation).tension(0.8)
            .x(function(d) {

                return x(d3.time.format("%Y-%m-%d").parse(d.date))

                // if (timeLimit != null) {
                //     if (moment(d.date).diff(moment(timeLimit)) > 0) {
                //         //     if (d.date.indexOf("T23:00:01.000Z") > -1 || d.date.indexOf("T01:00:01.000Z") > -1) {
                //         //   // console.log('wooh' + "   " + d.date)
                //         //     } else {
                //         return x(parseDate(d.date));
                //         // }
                //     } else {
                //         // return x(parseDate(JSON.stringify(moment(timeLimit)).replace("\"", "").replace("\"", "")))
                //     }
                // } else {
                //     return x(parseDate(d.date));
                // }

            })
            .y(function(d) {

                // if (timeLimit != null) {

                return y(parseInt(d.pageViews))

                //     if (moment(d.date).diff(moment(timeLimit)) > 0) {
                //         // if (d.date.indexOf("T23:00:01.000Z") > -1 || d.date.indexOf("T01:00:01.000Z") > -1) {
                //         //  console.log('wooh' + "   " + d.date)

                //         // } else {
                //         return y(parseInt(d.pageViews));
                //         // }
                //     } else {}
                // } else {
                //     return y(parseInt(d.pageViews));
                // }

            });

        var svgBase = d3.select("body").select(idname).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr('class', 'svgBase')

        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var svgFull = svgBase.append("g")
            .attr('class', 'svgFull')
            // .attr("width", width + margin.left + margin.right)
            // .attr("height", height + margin.top + margin.bottom)
            .attr("transform", "translate(" + (-1) * margin.left + "," + (-1) * margin.top + ")");

        x.domain(d3.extent(dataSource, function(d) {

            return parseDate(d.date);

            // if (timeLimit != null) {
            //     if (moment(d.date).diff(moment(timeLimit)) > 0) {
            //         return parseDate(d.date);
            //     } else {
            //         //  console.log('inHere')
            //         return parseDate(JSON.stringify(moment(timeLimit)).replace("\"", "").replace("\"", ""))
            //     }
            // } else {
            //     return parseDate(d.date);

            // }
        }))
        y.domain(d3.extent(dataSource, function(d) {

            return parseInt(d.pageViews);

            // if (timeLimit != null) {
            //     if (moment(d.date).diff(moment(timeLimit)) > 0) {
            //         return parseInt(d.pageViews);
            //     } else {
            //         //  console.log(moment(d.date).diff(moment(timeLimit)))
            //         //  console.log('ere2123')
            //         return 0
            //     }
            // } else {
            //     return parseInt(d.pageViews);
            // }

        }));

        // The opacity rectangle and the image need to be above everything else. Otherwise the graphs and the text would be hidden

        var imageBase64 = "";

        if (picUrl === undefined) {
            picUrl = "http://wikitrends.github.io/assets/defaultImage.jpg"
        } else {}

        convertImgToBase64(picUrl, picHeight, picWidth, function(base64Img) {

            imageBase64 = base64Img
                // return imageBase64
                // console.log(imageBase64)

            // Image Bleed Stuff
            var imgs = svgFull.selectAll("image").data([0]);
            imgs.enter()
                .append("svg:image")
                .attr('class', "images")
                .attr('id', "image" + idname.slice(1))
                .attr("xlink:href", function(d) {
                    // if (picUrl == undefined) {
                    //     picUrl = "assets/defaultImage.jpg"
                    //     return "assets/defaultImage.jpg"
                    // } else {
                    // console.log(imageBase64)
                    return imageBase64
                        // }
                })
                .attr("x", function(d) {
                    // console.log(picHeight)
                    // console.log(picWidth)
                    if (picUrl != "http://wikitrends.github.io/assets/defaultImage.jpg") {
                        if (picHeight / picWidth <= fullBleedHeight / fullBleedWidth) {
                            return (((0.5) * (fullBleedHeight / picHeight) * picWidth) - (fullBleedWidth / 2))
                        } else {
                            return 0
                        }
                    } else {
                        return 0
                    }
                })
                .attr("y", function(d) {
                    if (picUrl != "http://wikitrends.github.io/assets/defaultImage.jpg") {
                        if (picHeight / picWidth <= fullBleedHeight / fullBleedWidth) {
                            return 0
                        } else {
                            return (((-0.5) * (fullBleedWidth / picWidth) * picHeight) + (fullBleedHeight / 2))
                        }
                    } else {
                        return 0
                    }
                })
                .attr("width", function(d) {
                    if (picUrl != "http://wikitrends.github.io/assets/defaultImage.jpg") {
                        if (picHeight / picWidth <= fullBleedHeight / fullBleedWidth) {
                            return (fullBleedHeight / picHeight) * picWidth
                        } else {
                            return fullBleedWidth
                        }
                    } else {
                        return fullBleedWidth
                    }
                })
                .attr("height", function(d) {
                    if (picUrl != "http://wikitrends.github.io/assets/defaultImage.jpg") {
                        if (picHeight / picWidth <= fullBleedHeight / fullBleedWidth) {
                            return fullBleedHeight
                        } else {
                            return (fullBleedWidth / picWidth) * picHeight
                        }
                    } else {
                        return fullBleedHeight
                    }
                });

            if (picUrl != "http://wikitrends.github.io/assets/defaultImage.jpg") {

                var opacityRect = svgFull.append("rect")
                    .attr("id", "rect" + idname.slice(1))
                    .attr("width", width + margin.right + margin.left)
                    .attr("fill", "black")
                    .attr("opacity", 0.7)
                    .attr("height", height + margin.top + margin.bottom);

            }
        });

        var totalViews = 0;

        dataSource.forEach(function(d) {
            totalViews = totalViews + parseInt(d.pageViews)
                // console.log(d.pageViews)
        })

        convertImgToBase64("assets/wikipediaW.png", picHeight, picWidth, function(base64Img) {
            imageBase64 = base64Img

            // Adding Wikipedia Logo
            d3.select(idname).select('.svgBase')
                .append("svg:image")
                .attr("xlink:href", imageBase64)
                .attr("x", width - 80)
                .attr("y", 0)
                .attr("width", 70)
                .attr("height", 70);
        })


        d3.select(idname).select('.svgBase')
            .append('text')
            .text("PAGE VIEWS")
            .attr("x", 0)
            .attr("y", 25)
            .attr("font-family", "Open Sans")
            .attr("font-size", function(d) {
                return "16px"
            })
            .attr("fill", "white")
            .attr('opacity', "0.8");

        d3.select(idname).select('.svgBase')
            .append('text')
            .text(numberWithSpaces(totalViews))
            .attr("x", 0)
            .attr("y", 85)
            .attr("font-family", "Open Sans")
            .attr("font-weight", 700)
            .attr("font-size", function(d) {
                return "60px"
            })
            .attr("fill", "white")
            .attr('opacity', "0.8");

        d3.select(idname).select('.svgBase')
            .append('text')
            .text(pageTitle)
            .attr("text-anchor", "end")
            .attr("x", width - 100)
            .attr("y", 45)
            .attr("font-family", "Georgia")
            .attr("font-size", function(d) {
                return "32px"
            })
            .attr("fill", "white")
            .attr('opacity', "0.8");

        // d3.selectAll("path.domain").remove();

        // .attr("transform", "translate(0," + height + ")") shifts the axis to the bottom part of the G element. 
        svgBase.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll("text")
            .style("fill", "#999")
            .style("font-family", "Source Sans Pro")
            .style("font-weight", "100")
            .style("font-size", "16px");

        svgBase.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .selectAll("text")
            // .attr("transform", "rotate(-90)")
            .attr("dx", 1)
            .attr("dy", -9)
            .style("text-anchor", "start")
            .style("fill", "#999")
            .style("font-family", "Source Sans Pro")
            .style("font-weight", "100")
            .style("font-size", "16px")
            // .selectAll("line")
            //     .style("stroke-width", "30px")
            //     .style("stroke", "white")

        svgBase.selectAll('.axis line, .axis path')
            .style({
                'stroke': '#ddd',
                'fill': 'none',
                'stroke-width': '0.7px',
                "opacity": "0.4"
            });
        // .attr("dx", 1)
        // .attr("dy", -9)
        //.text("Ratings");

        svgBase.append("path")
            .datum(dataSource)
            .attr("class", "upperline")
            .attr("d", upperline)
            .attr("fill", "none")
            .attr("stroke", "rgb(94, 255, 176)")
            .attr("stroke-width", "3px")

        svgBase.selectAll("circle.line")
            .data(dataSource)
            .enter().append("svg:circle")
            .attr("class", "line")
            .style("fill", "green")
            .attr("cx", upperline.x())
            .attr("cy", upperline.y())
            .attr("r", 12)
            .attr('opacity', 0)
            // .on('click', tip.show)

        d3.select(idname)
            .selectAll("div")
            .data([0])
            .enter()
            .append("div")
            .attr("id", function(d) {
                //console.log('why')
                return "controls" + idname.slice(1)
            })

        var controlsInsertor = d3.select("#" + "controls" + idname.slice(1))
            .selectAll("button")
            .data([0])
            .enter()

        controlsInsertor.append("input")
            .attr("type", "range")
            .attr("min", 1)
            .attr("max", 100)
            .style("width", "200px")
            .attr("id", "opacitySlider" + idname.slice(1))

        controlsInsertor.append("input")
            .attr("type", "range")
            .attr("min", -picHeight)
            .attr("max", picHeight)
            .style("width", "200px")
            .attr("id", "imageHeightSlider" + idname.slice(1))

        controlsInsertor.append("input")
            .attr("type", "range")
            .attr("min", -picWidth)
            .attr("max", picWidth)
            .style("width", "200px")
            .attr("id", "imageWidthSlider" + idname.slice(1))

        d3.select("#" + "opacitySlider" + idname.slice(1)).on("input", function() {
            updateOpacity(+this.value);
        });

        d3.select("#" + "imageHeightSlider" + idname.slice(1)).on("input", function() {
            updateImageHeight(+this.value);
        });

        d3.select("#" + "imageWidthSlider" + idname.slice(1)).on("input", function() {
            updateImageWidth(+this.value);
        });

        function updateOpacity(ina) {
            d3.select("#" + "rect" + idname.slice(1))
                .data([0])
                .style("opacity", function(d) {
                    // console.log(ina)
                    return ina * 0.01
                })
        }

        function updateImageHeight(ina) {
            d3.select("#" + "image" + idname.slice(1))
                .data([0])
                .attr("y", function(d) {
                    return ina
                })
        }

        function updateImageWidth(ina) {
            d3.select("#" + "image" + idname.slice(1))
                .data([0])
                .attr("x", function(d) {
                    return ina
                })
        }


        d3.select(idname + "PngConvertor").on("click", function() {
            var html = d3.select("#testing")
                .attr("version", 1.1)
                .attr("xmlns", "http://www.w3.org/2000/svg")
                .node().parentNode.innerHTML;

            html = html.match(/(.*)<\/svg>/g)[0]

            //console.log(html);
            var imgsrc = 'data:image/svg+xml;base64,' + btoa(html);
            var img = '<img src="' + imgsrc + '">';
            d3.select("#svgdataurl").html(img);

            var canvas = document.querySelector("canvas"),
                context = canvas.getContext("2d");

            var image = new Image;
            image.src = imgsrc;
            image.onload = function() {

                canvas.height = 572;
                canvas.width = 1095;

                context.drawImage(image, 0, 0);

                //save and serve it as an actual filename
                binaryblob();

                var a = document.createElement("a");
                a.download = "sample.png";
                a.href = canvas.toDataURL("image/png");

                var pngimg = '<img src="' + a.href + '">';
                d3.select("#pngdataurl").html(pngimg);

                a.click();
            };
        });

        function binaryblob() {
            var byteString = atob(document.querySelector("canvas").toDataURL().replace(/^data:image\/(png|jpg);base64,/, "")); //wtf is atob?? https://developer.mozilla.org/en-US/docs/Web/API/Window.atob
            var ab = new ArrayBuffer(byteString.length);
            var ia = new Uint8Array(ab);
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            var dataView = new DataView(ab);
            var blob = new Blob([dataView], {
                type: "image/png"
            });
            var DOMURL = self.URL || self.webkitURL || self;
            var newurl = DOMURL.createObjectURL(blob);

            var img = '<img src="' + newurl + '">';
            d3.select("#img").html(img);
        }


        d3.select(idname)
            .selectAll("path.domain")
            .remove()

        // d3.select(idname).select('.svgBase')
        //     .append('text')
        //     .text("PAGEVIEWS")
        //     .attr("x", 0)
        //     .attr("y", 25)
        //     .attr("font-family", "Open Sans")
        //     .attr("font-size", function(d) {
        //         return "16px"
        //     })
        //     .attr("fill", "white")
        //     .attr('opacity', "0.8");

        // d3.select(idname).select('.svgBase')
        //     .append('text')
        //     .text(numberWithSpaces(totalViews))
        //     .attr("x", 0)
        //     .attr("y", 85)
        //     .attr("font-family", "Open Sans")
        //     .attr("font-weight", 700)
        //     .attr("font-size", function(d) {
        //         return "60px"
        //     })
        //     .attr("fill", "white")
        //     .attr('opacity', "0.8");

        // d3.select(idname).select('.svgBase')
        //     .append('text')
        //     .text(pageTitle)
        //     .attr("text-anchor", "end")
        //     .attr("x", width - 100)
        //     .attr("y", 45)
        //     .attr("font-family", "Georgia")
        //     .attr("font-size", function(d) {
        //         return "32px"
        //     })
        //     .attr("fill", "white")
        //     .attr('opacity', "0.8");

        // // .attr("transform", "translate(0," + height + ")") shifts the axis to the bottom part of the G element. 
        // svgBase.append("g")
        //     .attr("class", "x axis")
        //     .attr("transform", "translate(0," + height + ")")
        //     .call(xAxis);

        // svgBase.append("g")
        //     .attr("class", "y axis")
        //     .call(yAxis)
        //     .append("text")
        //     .attr("transform", "rotate(-90)")
        //     .attr("y", 6)
        //     .attr("dy", ".71em")
        //     .style("text-anchor", "end")
        //     //.text("Ratings");

        // svgBase.append("path")
        //     .datum(dataSource)
        //     .attr("class", "upperline")
        //     .attr("d", upperline)
        //     .attr("fill", "white")
        //     .attr("stroke", "#3FC380")
        //     .attr("stroke-width", "1px")

        // d3.select(idname)
        //     .selectAll("div")
        //     .data([0])
        //     .enter()
        //     .append("div")
        //     .attr("id", function(d) {
        //         return "controls" + idname.slice(1)
        //     })

        // var controlsInsertor = d3.select("#" + "controls" + idname.slice(1))
        //     .selectAll("button")
        //     .data([0])
        //     .enter()

        // controlsInsertor.append("input")
        //     .attr("type", "range")
        //     .attr("min", 1)
        //     .attr("max", 100)
        //     .style("width", "200px")
        //     .attr("id", "opacitySlider" + idname.slice(1))

        // controlsInsertor.append("input")
        //     .attr("type", "range")
        //     .attr("min", -picHeight)
        //     .attr("max", picHeight)
        //     .style("width", "200px")
        //     .attr("id", "imageHeightSlider" + idname.slice(1))

        // controlsInsertor.append("input")
        //     .attr("type", "range")
        //     .attr("min", -picWidth)
        //     .attr("max", picWidth)
        //     .style("width", "200px")
        //     .attr("id", "imageWidthSlider" + idname.slice(1))

        // d3.select("#" + "opacitySlider" + idname.slice(1)).on("input", function() {
        //     updateOpacity(+this.value);
        // });

        // d3.select("#" + "imageHeightSlider" + idname.slice(1)).on("input", function() {
        //     updateImageHeight(+this.value);
        // });

        // d3.select("#" + "imageWidthSlider" + idname.slice(1)).on("input", function() {
        //     updateImageWidth(+this.value);
        // });

        // function updateOpacity(ina) {
        //     d3.select("#" + "rect" + idname.slice(1))
        //         .data([0])
        //         .style("opacity", function(d) {
        //             // console.log(ina)
        //             return ina * 0.01
        //         })
        // }

        // function updateImageHeight(ina) {
        //     d3.select("#" + "image" + idname.slice(1))
        //         .data([0])
        //         .attr("y", function(d) {
        //             return ina
        //         })
        // }

        // function updateImageWidth(ina) {
        //     d3.select("#" + "image" + idname.slice(1))
        //         .data([0])
        //         .attr("x", function(d) {
        //             // console.log(ina)
        //             return ina
        //         })
        // }
    }

    // This runs the pageEdit graph!
    pageEdits(linkInitialPageEdits)

    // This runs the wordCloud graph!ssss
    // wordCloud(linkInitialWordCloud)

    // This gets the pageview stats from Stats.grok.se
    // pageViews(linkInitialPageViews)

}


// grandPlotter(2615708, "Jurrasic World")
// grandPlotter2([46514718], [11056991])

// Legend //

///// = Pretty Difficult.
//*// = Not that Difficult
//**// = Ah! That is what I can fix in my sleep.
