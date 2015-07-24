var globali = 0;
var multipleOne = [];

// The Date Picker thingy. Uses pikaday.js
var picker = new Pikaday({
    field: document.getElementById('datepicker'),
    firstDay: 1,
    minDate: new Date('2000-01-01'),
    maxDate: new Date('2020-12-31'),
    yearRange: [2000, 2020]
});
var pickerTwo = new Pikaday({
    field: document.getElementById('datepickerTwo'),
    firstDay: 1,
    minDate: new Date('2000-01-01'),
    maxDate: new Date('2020-12-31'),
    yearRange: [2000, 2020]
});

/* The Search Functionality Starts */

// This part simply changes the UI. Just to add the the cross button when the WeeklyPedia section is used etc. 
$(document).ready(function() {

        $('.graphs').hide()


    $('#element').tooltip('show')

    $(".graphs").hide()

    // langCode = langCode.replace(" <span class='caret'></span>", "").toLowerCase();

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

    $("#staph").click(function() {
        numberOf = []
        $('#selectedArticles').find('.selectedArticlesContainer').html('')
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

    $('#tenB').click(function() {
        cartodb.createVis('ten', 'https://dpatel.cartodb.com/api/v2/viz/7f6c716a-1a1e-11e5-9539-0e4fddd5de28/viz.json');
    })

    $('#nineB').click(function() {
        cartodb.createVis('nine', 'https://dpatel.cartodb.com/api/v2/viz/771e43ca-1a38-11e5-a03e-0e0c41326911/viz.json');
    })

    $('#elevenB').click(function() {
        cartodb.createVis('eleven', 'https://dpatel.cartodb.com/api/v2/viz/df71869c-2020-11e5-8a62-0e018d66dc29/viz.json');
    })

    $("#goGoGo").click(function() {
        grandPlotterPrecurssor()
    });
});

// Starts the search functionality of the article section. It then calls the next 4 functions (requestArticleExtracts, updateNumResults, resetDisplay, updateDisplay)
var search = function(query) {

    var langCode = $(".lang-selector li a").parents(".input-group-btn").find('.btn').text()
    langCode = langCode.replace(" <span class='caret'></span>", "").toLowerCase();

    $.ajax({
        url: "https://" + langCode + ".wikipedia.org/w/api.php?action=query&list=search&format=json&srsearch=" + query,
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

// Removes the selector IDs.
function closeThis(idname){
    idname = "[id='" + idname + "']"
    $(idname).remove()
}    

var requestArticleExtracts = function(queryResult) {
    // Request extracts for each of the articles found in the search

    console.log('asd')

    var langCode = $(".lang-selector li a").parents(".input-group-btn").find('.btn').text()
    langCode = langCode.replace(" <span class='caret'></span>", "").toLowerCase();

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
    // console.log(queryResult);
    var pages = queryResult.query.pages;

    var langCode = $(".lang-selector li a").parents(".input-group-btn").find('.btn').text()
    langCode = langCode.replace(" <span class='caret'></span>", "").toLowerCase();

    // Find the results pane and reset it
    $('#results_pane').find('.searchResults').html('');

    for (var pId in pages) {
        var htmlToAdd = "<div class='result_card'>";
        // htmlToAdd += "<a target='_' "  href='https://en.wikipedia.org/?curid=" + pages[pId].pageid + "'>";

        // Using pages[pId].title doesn't work in API call. Hence use pageID
        var pageDetails = [pages[pId].pageid, pages[pId].title]
            // htmlToAdd += "<a nohref onClick=\"grandPlotter(" + pages[pId].pageid + "," + "\'" + pages[pId].title + "\'" + ")\">"
        htmlToAdd += "<a nohref onClick=\"precurssor(" + pages[pId].pageid +
            "," + globali + "," + "\'" + langCode + "\'" +
            "," + "\'" + (pages[pId].title).replace('\'', '\\\'') + "\'" +
            ")\">"

        //test(pages[pId].title)
        //htmlToAdd += "<a href='javascript:grandPlotter(" + pages[pId].title + ")'>";
        htmlToAdd += "<p>" + pages[pId].title + "</p>";
        htmlToAdd += "<p>" + pages[pId].extract + "</p></a></div>";

        $('#suggestionsPane').find('.mostEdits').html('');
        $('#suggestionsPane').find('.mostNewEdits').html('');
        $('#results_pane').find('.searchResults').append(htmlToAdd);

        $("#mostNewEdits").removeClass("active")
        $("#mostEdits").removeClass("active")
    }
}

/* Search functionality ends here */

var numberOf = []

function precurssor(input, globalia, lang, pageTitle) {

    var finalJsonObjectLangLinks = []

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

            jsonObjectLangLinks = data;

            // Clean up Data -- Actually we already have the pageID! Too scared to delete this piece though, it might be that jenga piece which brings down the entire tower!
            var pageID = Object.keys(jsonObjectLangLinks.query.pages)[0]
            jsonObjectLangLinks = jsonObjectLangLinks.query.pages[pageID].langlinks

            for (i = 0; i < Object.keys(jsonObjectLangLinks).length; i++) {

                // var htmlToAdd = "<div id='" + input + "|" + jsonObjectLangLinks[i].url.replace(/.*wiki\//g, "") + "' class='selected_card'>";
                // htmlToAdd += "<a nohref>"
                // htmlToAdd += "<p>" + jsonObjectLangLinks[i].url.replace(/.*wiki\//g, "") + "</br> <span style='font-weight: 600'>" +  jsonObjectLangLinks[i].lang + "</span></p>";
                // var htmlToAdd = "<li><a onClick=\"precurssor(" + 12 + ","+ 12 + ","  + "'" + 

                // htmlToAdd += "<a nohref onClick=\"precurssor(" + useFulData[i].page_id +
                //     "," + globali + "," + "\'" + langCode + "\'" +
                //     "," + "\'" + (useFulData[i].title_s).replace('\'', '\\\'') + "\'" +
                //     ")\">"

                var htmlToAdd = "<li><a nohref onClick=\"precurssor(" + 12 +
                    "," + 12 + "," + "\'" + jsonObjectLangLinks[i].lang + "\'" +
                    "," + "\'" + jsonObjectLangLinks[i]['*'] + "\'" +
                    ")\">" + jsonObjectLangLinks[i].autonym + "</a></li>"

                $('#selectedArticles').find('#languageHelper').find("ul").append(htmlToAdd);

            }
        })
    }

    var htmlToAdd = "<div id='" + lang + "|" + pageTitle + "' class='selected_card'>";
    htmlToAdd += "<a nohref>"

    var linkInitialWordCloud = "https://" + lang + ".wikipedia.org/w/api.php?action=query&prop=langlinks&format=json&llprop=url%7Clangname%7Cautonym&lllimit=300&iwurl=" + "&titles=" + pageTitle + "&format=json&callback=?"
    wordCloud(linkInitialWordCloud)

    htmlToAdd += "<p class=\"selectionCard\">" + pageTitle + "</br> <span style='font-weight: 600'>" + lang + "</span></p><i class='closingIcon fa fa-times' onClick='closeThis(\"" + lang + "|" + pageTitle + "\")'></i>";

    $('#selectedArticles').find('.selectedArticlesContainer').append(htmlToAdd);

    pageTitle.replace('\'', '\\\'')

}

function grandPlotterPrecurssor() {

    // arr stores all the titles and pageIDs in the selector section and then passes them over to grandPlotter.
    var arr = $('.selectedArticlesContainer > div').map(function() {
        return this.id;
    }).get();

    if (arr.length!=2) {
        alert('Nope. You need exactly two selected items to plot graph.')
    }

    // the details of the two pages which have to be compared. 
    var detailsFirst = arr[0].split('|')
    var detailsSecond = arr[1].split('|')

    grandPlotter(detailsFirst, detailsSecond)
}

/* WeeklyPedia functionality starts here */
// Automatic Most Editted and most recently editted pages are fetched and displayed. 
function weeklyPedia(parameter) {

    var lastFriday = moment().startOf('week').subtract(2, 'days')
    lastFriday = JSON.stringify(lastFriday).slice(1, 11).replace(/-/g, "")

    var langCode = $(".lang-selector li a").parents(".input-group-btn").find('.btn').text()
    langCode = langCode.replace(" <span class='caret'></span>", "").toLowerCase();

    if (parameter == 'Most Edits') {

        var url = "http://weekly.hatnote.com/archive/" + langCode + "/" + lastFriday + "/weeklypedia_" + lastFriday + ".json"

        getWeeklyPedia(url, function(data) {
            var useFulData = data.query.results.json.mainspace

            $("#mostNewEdits").css({
                "color": "#333",
                "background-color": "#fff"
            })
            $("#mostEdits").css({
                'background-color': "#333",
                'color': "#fff"
            })

            $("#mostNewEdits").removeClass("active")
            $("#mostEdits").addClass("active")

            $('#suggestionsPane').find('.mostEdits').html('');
            $('#suggestionsPane').find('.mostNewEdits').html('');

            for (i = 0; i < useFulData.length; i++) {

                var htmlToAdd = "<div class='result_card'>";
                // htmlToAdd += "<a target='_' "  href='https://en.wikipedia.org/?curid=" + pages[pId].pageid + "'>";

                // Using pages[pId].title doesn't work in API call. Hence use pageID
                // console.log(useFulData[i].title)

                htmlToAdd += "<a nohref onClick=\"precurssor(" + useFulData[i].page_id +
                    "," + globali + "," + "\'" + langCode + "\'" +
                    "," + "\'" + (useFulData[i].title_s).replace('\'', '\\\'') + "\'" +
                    ")\">"

                // htmlToAdd += "<a nohref onClick=\"grandPlotter(" + useFulData[i].page_id + "\'" + useFulData[i].title + "\'" + ")\">"
                htmlToAdd += "<p>" + useFulData[i].title_s + "</p>";

                $('#closeMostNewEdits').hide()
                $('#closeMostEdits').show()
                $('#results_pane').find('.searchResults').html('');
                $('#suggestionsPane').find('.mostEdits').append(htmlToAdd);
            }

        })
    } else {

        var url = "http://weekly.hatnote.com/archive/" + langCode + "/" + lastFriday + "/weeklypedia_" + lastFriday + ".json"
        getWeeklyPedia(url, function(data) {

            $("#mostEdits").removeClass("active")
            $("#mostNewEdits").addClass("active")

            $("#mostEdits").css({
                "color": "#333",
                "background-color": "#fff"
            })
            $("#mostNewEdits").css({
                'background-color': "#333",
                'color': "#fff"
            })

            $('#suggestionsPane').find('.mostEdits').html('');
            $('#suggestionsPane').find('.mostNewEdits').html('');

            if (data.query.results) {
                var useFulData = data.query.results.json.new_articles

                for (i = 0; i < useFulData.length; i++) {

                    var htmlToAdd = "<div class='result_card'>";
                    htmlToAdd += "<a nohref onClick=\"precurssor(" + useFulData[i].page_id +
                        "," + globali + "," + "\'" + langCode + "\'" +
                        "," + "\'" + (useFulData[i].title_s).replace('\'', '\\\'') + "\'" +
                        ")\">"
                    htmlToAdd += "<p>" + useFulData[i].title_s + "</p>";
                    $('#closeMostEdits').hide()
                    $('#closeMostNewEdits').show()
                    $('#results_pane').find('.searchResults').html('');
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

// This gets the dimensions of the image. Used by almost every visualization caller. 
function getImageDimensions(url, callback) {
    var img = new Image();
    img.src = url;
    img.onload = function() {
        callback(this.width, this.height);
    }
}

// Puts spaces in the number!
function numberWithSpaces(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

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

function searchArray(nameKey, myArray) {
    for (var i = 0; i < myArray.length; i++) {
        if (myArray[i].name === nameKey) {
            return myArray[i];
        }
    }
}

function clone(obj) {
    if (obj == null || typeof(obj) != 'object')
        return obj;

    var temp = new obj.constructor();
    for (var key in obj)
        temp[key] = clone(obj[key]);

    return temp;
}

//// Have pity on this lonely variable. Find a new home for him. Preferrably somewhere with other variables.
var thereIs;

// Nepal Earthquake

// Jurrasic
// grandPlotter('47084203', '2015 Sousse attacks')

// grandPlotter("April_2015_Nepal_earthquake")

// This is the main place where everything works. All the calls the the APIs ( except for the article seach and weeklypedia suggestions ), pretty much everything lies here. 

function grandPlotter(graphOne, graphTwo) {

    $(".graphs").show()

    document.getElementById('datepicker').value='';
    document.getElementById('datepickerTwo').value='';

    var finaljsonObjectOne = [];
    var finaljsonObjectTwo = [];

    var timeLimit = picker.getDate()
    var timeLimitUpper = pickerTwo.getDate()

    if (moment(timeLimit) == moment())

    //// You mad, bro? 
    var pageID = pageIDin;
    var pageTitle

    var jsonObject;
    var lastRevID;
    var objectTwo = []

    // var langCode = $(".lang-selector li a").parents(".input-group-btn").find('.btn').text()
    // langCode = langCode.replace(" <span class='caret'></span>", "").toLowerCase();

    var linkInitialPageEdits = "https://" + graphOne[0] + ".wikipedia.org/w/api.php?action=query&prop=revisions&format=json&rvprop=ids%7Ctimestamp%7Cuser%7Cuserid%7Csize&rvlimit=1000&rvcontentformat=text%2Fplain" + "&titles=" + graphOne[1] + "&format=json&callback=?"
    var linkInitialWordCloud = "https://" + graphOne[0] + ".wikipedia.org/w/api.php?action=query&prop=langlinks&format=json&llprop=url%7Clangname%7Cautonym&lllimit=300&iwurl=" + "&titles=" + graphOne[1] + "&format=json&callback=?"

    // var linkInitialPageViews = "http://stats.grok.se/json/es/latest90/" + encodeURI(pageTitlein)

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

                var jsonObject = tempTest.responseJSON;

                // Clean up Data
                var pageID = Object.keys(jsonObject.query.pages)[0]
                jsonObject = jsonObject.query.pages[pageID].revisions

                // Get last revision ID

                // console.log(jsonObject)
                lastRevID = jsonObject[Object.keys(jsonObject)[Object.keys(jsonObject).length - 1]].revid

                //  console.log(lastRevID)

                //  console.log(url)

                // This is the length of the useful JSON object
                //c.log(Object.keys(jsonObject).length)

                // Run this part of the if - else everytime except for the last time.

                if (Object.keys(jsonObject).length == 500) {

                    if (parameterOne == 0) {
                        finaljsonObjectOne = finaljsonObjectOne.concat(jsonObject)
                        getDataExtraParams("https://" + graphOne[0] + ".wikipedia.org/w/api.php?action=query&prop=revisions&format=json&rvprop=ids%7Ctimestamp%7Cuser%7Cuserid%7Csize&rvlimit=1000&rvcontentformat=text%2Fplain" + "&rvstartid=" + lastRevID + "&titles=" + graphOne[1] + "&format=json&callback=?", parameterOne)
                    }

                    if (parameterOne == 1) {
                        finaljsonObjectTwo = finaljsonObjectTwo.concat(jsonObject)
                        getDataExtraParams("https://" + graphTwo[0] + ".wikipedia.org/w/api.php?action=query&prop=revisions&format=json&rvprop=ids%7Ctimestamp%7Cuser%7Cuserid%7Csize&rvlimit=1000&rvcontentformat=text%2Fplain" + "&rvstartid=" + lastRevID + "&titles=" + graphTwo[1] + "&format=json&callback=?", parameterOne)
                    }

                }

                // Run this part of the if - else everytime only for the last time when the callback exits.
                else {

                    if (parameterOne == 0) {
                        finaljsonObjectOne = finaljsonObjectOne.concat(jsonObject)
                        getDataExtraParams("https://" + graphTwo[0] + ".wikipedia.org/w/api.php?action=query&prop=revisions&format=json&rvprop=ids%7Ctimestamp%7Cuser%7Cuserid%7Csize&rvlimit=1000&rvcontentformat=text%2Fplain" + "&titles=" + graphTwo[1] + "&format=json&callback=?", 1)
                        
                    }

                    if (parameterOne == 1) {
                        // console.log(finaljsonObjectOne)
                        finaljsonObjectTwo = finaljsonObjectTwo.concat(jsonObject)

                        // console.log(finaljsonObjectTwo)
                        // console.log(finaljsonObjectOne)

                        // function initializer(objectOne, objectTwo, pageTitle, url, width, height, atribution) {

                        initializer(finaljsonObjectOne, finaljsonObjectTwo, "one", "assets/defaultImage.jpg", 1000, 500)

                    }

                    // For the pageImage thingy

                    // linkAddress = pageEdits("https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original" + "&pageids=" + pageID + "&format=json&callback=?")

                    // var pageID = Object.keys(linkAddress.query.pages)[0]
                    // linkAddress = linkAddress.query.pages[pageID].thumbnail

                    // initialises runNow function which has the d3 stuff. Passes the concated data as the parameter.

                }
            },
        });
    }

    // function multipleDataGetter(url, parameterOne, callback) {
        
    //     var tempTest = $.ajax({

    //         url: url,
    //         async: false,
    //         dataType: 'json',
    //         type: 'GET',
    //         headers: {
    //             'Api-User-Agent': 'Example/1.0'
    //         },
    //         success: function() {

    //             var jsonObject = tempTest.responseJSON

    //             // Clean up Data
    //             var pageID = Object.keys(jsonObject.query.pages)[0]
    //             jsonObject = jsonObject.query.pages[pageID].revisions

    //             // Get last revision ID

    //             // console.log(jsonObject)
    //             lastRevID = jsonObject[Object.keys(jsonObject)[Object.keys(jsonObject).length - 1]].revid

    //             //  console.log(lastRevID)

    //             //  console.log(url)

    //             // This is the length of the useful JSON object
    //             //c.log(Object.keys(jsonObject).length)

    //             // Run this part of the if - else everytime except for the last time.

    //             if (Object.keys(jsonObject).length == 500) {

    //                 if (parameterOne == 0) {
    //                     finaljsonObjectOne = finaljsonObjectOne.concat(jsonObject)
    //                     getDataExtraParams("https://" + graphOne[0] + ".wikipedia.org/w/api.php?action=query&prop=revisions&format=json&rvprop=ids%7Ctimestamp%7Cuser%7Cuserid%7Csize&rvlimit=1000&rvcontentformat=text%2Fplain" + "&rvstartid=" + lastRevID + "&titles=" + graphOne[1] + "&format=json&callback=?", parameterOne)
    //                 }

    //                 if (parameterOne == 1) {
    //                     finaljsonObjectTwo = finaljsonObjectTwo.concat(jsonObject)
    //                     getDataExtraParams("https:" + graphTwo[0] + "//en.wikipedia.org/w/api.php?action=query&prop=revisions&format=json&rvprop=ids%7Ctimestamp%7Cuser%7Cuserid%7Csize&rvlimit=1000&rvcontentformat=text%2Fplain" + "&rvstartid=" + lastRevID + "&titles=" + graphTwo[1] + "&format=json&callback=?", parameterOne)
    //                 }

    //             }

    //             // Run this part of the if - else everytime only for the last time when the callback exits.
    //             else {

    //                 if (parameterOne == 0) {
    //                     finaljsonObjectOne = finaljsonObjectOne.concat(jsonObject)
    //                     getDataExtraParams("https://" + graphTwo[0] + ".wikipedia.org/w/api.php?action=query&prop=revisions&format=json&rvprop=ids%7Ctimestamp%7Cuser%7Cuserid%7Csize&rvlimit=1000&rvcontentformat=text%2Fplain" + "&titles=" + graphTwo[1] + "&format=json&callback=?", 1)

    //                     console.log(parameterOne)

    //                     // console.log(finaljsonObjectOne)
    //                 }

    //                 if (parameterOne == 1) {
    //                     // console.log(finaljsonObjectOne)
    //                     finaljsonObjectTwo = finaljsonObjectTwo.concat(jsonObject)

    //                     console.log(finaljsonObjectTwo)
    //                     console.log(finaljsonObjectOne)

    //                     // multiplePlotter(finaljsonObjectOne, finaljsonObjectTwo, "#one", "none", "", "", "day", "pageTitle", "assets/defaultImage.jpg", 1000, 500)

    //                 }

    //                 // For the pageImage thingy

    //                 // linkAddress = pageEdits("https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original" + "&pageids=" + pageID + "&format=json&callback=?")

    //                 // var pageID = Object.keys(linkAddress.query.pages)[0]
    //                 // linkAddress = linkAddress.query.pages[pageID].thumbnail

    //                 // initialises runNow function which has the d3 stuff. Passes the concated data as the parameter.

    //             }
    //         },
    //     });
    // }

    var finaljsonObject = [];
    var finaljsonObjectNeverChange = [];

    var linkAddress;

    function initializer(objectOne, objectTwo, pageTitle, url, width, height, atribution) {

        pageEditsTester(objectOne,objectTwo, "#three", "none", "", "", "hour", pageTitle, url, width, height, "stretch", "lineChart", atribution)
        pageEditsTester(objectOne, objectTwo, "#two", "none", "", "", "day", pageTitle, url, width, height, "stretch", "lineChart", atribution)
        pageEditsTester(objectOne, objectTwo, "#one", "none", "", "", "week", pageTitle, url, width, height, "stretch", "lineChart", atribution)
    }

    function pageEditsTester(dataSourceOne, dataSourceTwo, idname, interpolation, parameter, plotParameter, timeDuration, pageTitle, picUrl, picWidth, picHeight, graphStyle, chartType, atribution) {

        var dataTempOne = clone(dataSourceOne)
        var dataTempTwo = clone(dataSourceTwo)

        console.log(dataTempOne)
        console.log(dataTempTwo)

        d3.select(idname + "Controls").selectAll("*")
            .remove()

        dataTempOne.sort(function(a, b) {
            var c = new Date(a.timestamp);
            var d = new Date(b.timestamp);
            return d - c;
        });

        dataTempTwo.sort(function(a, b) {
            var c = new Date(a.timestamp);
            var d = new Date(b.timestamp);
            return d - c;
        });

        var editorsOne = []
        var editorsTwo = []
        var editorsCountOne = 0;
        var editorsCountTwo = 0;

        dataTempOne.forEach(function(d, i) {
            var user = d.user
            if (editorsOne.indexOf(user) > -1) {
                d.editorsCountOne = editorsCountOne
            } else {
                editorsCountOne = editorsCountOne + 1;
                editorsOne.push(user)
                d.editorsCountOne = editorsCountOne
            }
        })

        dataTempTwo.forEach(function(d, i) {
            var user = d.user
            if (editorsTwo.indexOf(user) > -1) {
                d.editorsCountTwo = editorsCountTwo
            } else {
                editorsCountTwo = editorsCountTwo + 1;
                editorsTwo.push(user)
                d.editorsCountTwo = editorsCountTwo
            }
        })

        dataTempOne.forEach(function(d, i) {
            if (i == dataTempOne.length - 1) {
                d.difference = d.size;
            } else {
                d.difference = d.size - dataTempOne[i + 1].size;
            }
        })

        dataTempTwo.forEach(function(d, i) {
            if (i == dataTempTwo.length - 1) {
                d.difference = d.size;
            } else {
                d.difference = d.size - dataTempTwo[i + 1].size;
            }
        })

        var totalEditsOne = 0;
        var totalEditorsOne;
        var brokenDownDataSource = []

        var totalEditsTwo = 0;
        var totalEditorsTwo;

        dataTempOne.forEach(function(d) {

            if (timeLimit == null && timeLimitUpper == null) {
                totalEditsOne = totalEditsOne + 1
                brokenDownDataSource.push({
                    user: d.user,
                    timestamp: d.timestamp
                })
            } else if (timeLimit == null && timeLimitUpper != null) {
                if (moment(d.timestamp).diff(moment(timeLimitUpper)) < 0) {
                    totalEditsOne = totalEditsOne + 1
                    brokenDownDataSource.push({
                        user: d.user,
                        timestamp: d.timestamp
                    })
                }
            } else if (timeLimit != null && timeLimitUpper == null) {
                if (moment(d.timestamp).diff(moment(timeLimit)) > 0) {
                    totalEditsOne = totalEditsOne + 1
                    brokenDownDataSource.push({
                        user: d.user,
                        timestamp: d.timestamp
                    })
                }
            } else if (timeLimit != null && timeLimitUpper != null) {
                if (moment(d.timestamp).diff(moment(timeLimit)) < 0) {} else {
                    if (moment(d.timestamp).diff(moment(timeLimitUpper)) < 0) {
                        totalEditsOne = totalEditsOne + 1
                        brokenDownDataSource.push({
                            user: d.user,
                            timestamp: d.timestamp
                        })
                    }
                }
            }
        })

        // Counts the unique instances of 'user' so gets the total number of edits.
        var distances = {},
            e;
        for (var i = 0, l = brokenDownDataSource.length; i < l; i++) {
            e = brokenDownDataSource[i];
            distances[e.user] = (distances[e.user] || 0) + 1;
        }

        var totalEditorsOne = Object.keys(distances).length

        dataTempTwo.forEach(function(d) {

            if (timeLimit == null && timeLimitUpper == null) {
                totalEditsTwo = totalEditsTwo + 1
                brokenDownDataSource.push({
                    user: d.user,
                    timestamp: d.timestamp
                })
            } else if (timeLimit == null && timeLimitUpper != null) {
                if (moment(d.timestamp).diff(moment(timeLimitUpper)) < 0) {
                    totalEditsTwo = totalEditsTwo + 1
                    brokenDownDataSource.push({
                        user: d.user,
                        timestamp: d.timestamp
                    })
                }
            } else if (timeLimit != null && timeLimitUpper == null) {
                if (moment(d.timestamp).diff(moment(timeLimit)) > 0) {
                    totalEditsTwo = totalEditsTwo + 1
                    brokenDownDataSource.push({
                        user: d.user,
                        timestamp: d.timestamp
                    })
                }
            } else if (timeLimit != null && timeLimitUpper != null) {
                if (moment(d.timestamp).diff(moment(timeLimit)) < 0) {} else {
                    if (moment(d.timestamp).diff(moment(timeLimitUpper)) < 0) {
                        totalEditsTwo = totalEditsTwo + 1
                        brokenDownDataSource.push({
                            user: d.user,
                            timestamp: d.timestamp
                        })
                    }
                }
            }
        })

        // Counts the unique instances of 'user' so gets the total number of edits.
        var distances = {},
            e;
        for (var i = 0, l = brokenDownDataSource.length; i < l; i++) {
            e = brokenDownDataSource[i];
            distances[e.user] = (distances[e.user] || 0) + 1;
        }

        var totalEditorsTwo = Object.keys(distances).length

        $('#loader').html('');
        $(idname).html('')

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

        var x = d3.time.scale()
            .range([25, width - 25]);

        var y = d3.scale.linear()
            .range([height, 180]);

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

        var knotChecker;

        var upperline = d3.svg.line()
            .tension(0.95)
            .interpolate("bundle")
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
            // .attr("width", width + margin.left + margin.right)
            // .attr("height", height + margin.top + margin.bottom)
            .attr("transform", "translate(" + (-1) * margin.left + "," + (-1) * margin.top + ")");

        var count = 0;

        var previousParameter = 0;
        var weekInitial;
        var weekNumber;
        var thisWeekNumber;

        var lastDate;
        var totalCount = 0;

        // var newData = dataTempOne
        // all newData subsesquently were replaced with dataTempOne

        dataTempOne.forEach(function(d) {

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

        dataTempTwo.forEach(function(d) {

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

        // console.log(datasource)
        // console.log(newData)

        // dataOne and dataTwo from now on.

        var dataOne = d3.nest()
            .key(function(d) {
                return d.timestamp;
            })
            .rollup(function(d) {
                return d3.sum(d, function(d) {
                    return d.values;
                });
            }).entries(dataTempOne);

        var dataTwo = d3.nest()
            .key(function(d) {
                return d.timestamp;
            })
            .rollup(function(d) {
                return d3.sum(d, function(d) {
                    return d.values;
                });
            }).entries(dataTempTwo);

        // Attempting to fix the Zero Date problem
        var finaleOne = []
        var finaleTwo = []

        //console.log(finale)

        if (timeDuration == "hour") {

            var previousDateActual = "";
            var dayMinusOne;

            dataOne.forEach(function(d, i) {

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

                        finaleOne.push({
                            key: tempIn,
                            values: 0
                        })


                        var tempIn = JSON.stringify(smoothner).replace("\"", "").replace("\"", "")

                        finaleOne.push({
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

                        finaleOne.push({
                            key: tempIn,
                            values: 0
                        })

                        var smoothner = moment(dayPlusOne).add(2, "minutes")

                        var tempIn = JSON.stringify(smoothner).replace("\"", "").replace("\"", "")

                        finaleOne.push({
                            key: tempIn,
                            values: 0
                        })

                    } else {
                        finaleOne.push({
                            key: JSON.stringify(d.key).replace("\"", "").replace("\"", ""),
                            values: d.values
                        })
                    }
                } else {}

                finaleOne.push({
                    key: JSON.stringify(d.key).replace("\"", "").replace("\"", ""),
                    values: d.values
                })

                // Checks for the next 
                dayMinusOne = moment(d.key).subtract(1, 'hour')
                    // console.log(i)
                    // console.log(data.length)

                // if ( i == data.length - 1 ) {
                // //console.log('sadas')
                //     finaleOne.push({
                //         key: JSON.stringify(d.key).replace("\"", "").replace("\"", ""),
                //         values: 0
                //     })                
                // } 
                // // d.key = momen
                // if ( i == 0 ) {
                // //console.log(JSON.stringify(dayPlusOne).replace("\"", "").replace("\"", ""))

                //     finaleOne.push({
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

            dataOne.forEach(function(d, i) {

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

                        finaleOne.push({
                            key: tempIn,
                            values: 0
                        })

                        var tempIn = JSON.stringify(smoothner).replace("\"", "").replace("\"", "")

                        finaleOne.push({
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

                        finaleOne.push({
                            key: tempIn,
                            values: 0
                        })

                        var tempIn = JSON.stringify(smoothner).replace("\"", "").replace("\"", "")

                        finaleOne.push({
                                key: tempIn,
                                values: 0
                            })
                            // console.log('One  ' + tempIn)

                    } else {
                        finaleOne.push({
                            key: JSON.stringify(d.key).replace("\"", "").replace("\"", ""),
                            values: d.values
                        })
                    }
                } else {}

                finaleOne.push({
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

            dataOne.forEach(function(d, i) {

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

                        finaleOne.push({
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

                        finaleOne.push({
                                key: tempIn,
                                values: 0
                            })
                            //  console.log('One  ' + tempIn)

                    } else {
                        finaleOne.push({
                            key: JSON.stringify(d.key).replace("\"", "").replace("\"", ""),
                            values: d.values
                        })
                    }
                } else {}

                finaleOne.push({
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

            dataOne.forEach(function(d, i) {

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

        if (timeDuration == "hour") {

            var previousDateActual = "";
            var dayMinusOne;

            dataTwo.forEach(function(d, i) {

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

                        finaleTwo.push({
                            key: tempIn,
                            values: 0
                        })


                        var tempIn = JSON.stringify(smoothner).replace("\"", "").replace("\"", "")

                        finaleTwo.push({
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

                        finaleTwo.push({
                            key: tempIn,
                            values: 0
                        })

                        var smoothner = moment(dayPlusOne).add(2, "minutes")

                        var tempIn = JSON.stringify(smoothner).replace("\"", "").replace("\"", "")

                        finaleTwo.push({
                            key: tempIn,
                            values: 0
                        })

                    } else {
                        finaleTwo.push({
                            key: JSON.stringify(d.key).replace("\"", "").replace("\"", ""),
                            values: d.values
                        })
                    }
                } else {}

                finaleTwo.push({
                    key: JSON.stringify(d.key).replace("\"", "").replace("\"", ""),
                    values: d.values
                })

                // Checks for the next 
                dayMinusOne = moment(d.key).subtract(1, 'hour')
                    // console.log(i)
                    // console.log(data.length)

                // if ( i == data.length - 1 ) {
                // //console.log('sadas')
                //     finaleTwo.push({
                //         key: JSON.stringify(d.key).replace("\"", "").replace("\"", ""),
                //         values: 0
                //     })                
                // } 
                // // d.key = momen
                // if ( i == 0 ) {
                // //console.log(JSON.stringify(dayPlusOne).replace("\"", "").replace("\"", ""))

                //     finaleTwo.push({
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

            dataTwo.forEach(function(d, i) {

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

                        finaleTwo.push({
                            key: tempIn,
                            values: 0
                        })

                        var tempIn = JSON.stringify(smoothner).replace("\"", "").replace("\"", "")

                        finaleTwo.push({
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

                        finaleTwo.push({
                            key: tempIn,
                            values: 0
                        })

                        var tempIn = JSON.stringify(smoothner).replace("\"", "").replace("\"", "")

                        finaleTwo.push({
                                key: tempIn,
                                values: 0
                            })
                            // console.log('One  ' + tempIn)

                    } else {
                        finaleTwo.push({
                            key: JSON.stringify(d.key).replace("\"", "").replace("\"", ""),
                            values: d.values
                        })
                    }
                } else {}

                finaleTwo.push({
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

            dataTwo.forEach(function(d, i) {

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

                        finaleTwo.push({
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

                        finaleTwo.push({
                                key: tempIn,
                                values: 0
                            })
                            //  console.log('One  ' + tempIn)

                    } else {
                        finaleTwo.push({
                            key: JSON.stringify(d.key).replace("\"", "").replace("\"", ""),
                            values: d.values
                        })
                    }
                } else {}

                finaleTwo.push({
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

            dataTwo.forEach(function(d, i) {

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

                // PreviosDateActual is the actual date which follows the current date. It is a misnomer too. 
                previousDateActual = d.key;
            })
        }

        finaleOne.sort(function(a, b) {
            var c = new Date(a.key);
            var d = new Date(b.key);
            return d - c;
        });

        finaleTwo.sort(function(a, b) {
            var c = new Date(a.key);
            var d = new Date(b.key);
            return d - c;
        });

        // Concating the two dataSets
        var finaleFinale = []

        finaleFinale = finaleOne.concat(finaleTwo);
        console.log(finaleFinale)

        var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
                return "<strong>Frequency:</strong> <span style='color:red'>" + d.frequency + "</span>";
            })

        svgBase.call(tip);

        x.domain(d3.extent(finaleFinale, function(d) {

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
        y.domain(d3.extent(finaleFinale, function(d) {

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

        // The opacity rectangle and the image need to be above everything else. Otherwise the graphs and the text would be hidden

        // Image Bleed Stuff
        var imageBase64 = "";

        if (picUrl === undefined || picUrl === "assets/defaultImage.jpg") {
            picUrl = "http://wikitrends.github.io/assets/defaultImage.jpg"
        } else {}

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

                var opacityRect = svgFull.append("rect")
                    .attr("id", "rectCover" + idname.slice(1))
                    .attr("width", width + margin.right + margin.left)
                    .attr("fill", "#f9f9f9")
                    .attr("opacity", 0)
                    .attr("y", 155)
                    .attr("height", height + margin.top + margin.bottom - 155);

            if (picUrl != "http://wikitrends.github.io/assets/defaultImage.jpg") {

                var opacityRect = svgFull.append("rect")
                    .attr("id", "rect" + idname.slice(1))
                    .attr("width", width + margin.right + margin.left)
                    .attr("fill", "black")
                    .attr("opacity", 0.7)
                    .attr("height", height + margin.top + margin.bottom);

            }
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

        // d3.select(idname).select('.svgBase')
        //     .append('text')
        //     .text("Page Edits")
        //     .attr("x", function(d) {
        //         var length = numberWithSpaces(totalEditorsOne).length
        //         var lengthTwo = numberWithSpaces(totalEditsOne).length
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

        // d3.select(idname).select('.svgBase')
        //     .append('text')
        //     .text("Editors")
        //     .attr("x", function(d) {
        //         var length = numberWithSpaces(totalEditors).length
        //         return width - (24 * length) - 45 + 5
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
        //     .text(numberWithSpaces(totalEditors))
        //     .attr("x", function(d) {
        //         var length = numberWithSpaces(totalEditors).length
        //         return width - (24 * length) - 45
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
            .text("Number of Edits")
            .attr("x", function(d) {
                var length = numberWithSpaces(totalEditsOne).length
                var lengthTwo = numberWithSpaces(totalEditsTwo).length
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

        d3.select(idname).select('.svgBase')
            .append('text')
            .text(graphOne[0] + "-wiki " + graphOne[1].substring(0,9) )
            .attr("x", function(d) {
                var length = numberWithSpaces(totalEditsOne).length
                var lengthTwo = numberWithSpaces(totalEditsTwo).length
                return width - (24 * length) - 90 - (24 * lengthTwo) + 5
            })
            .attr("y", 55)
            .attr("font-family", "Helvetica Neue")
            .attr("font-size", function(d) {
                return "12.33px"
            })
            .attr("font-weight", "500")
            .attr("fill", "#DCDCDC")
            .attr('opacity', "1");

            ////////////

        d3.select(idname).select('.svgBase')
            .append('text')
            .text(numberWithSpaces(totalEditsOne))
            .attr("x", function(d) {
                var length = numberWithSpaces(totalEditsOne).length
                var lengthTwo = numberWithSpaces(totalEditsTwo).length
                return width - (24 * length) - 90 - (24 * lengthTwo)
            })
            .attr("y", 105)
            .attr("font-family", "Open Sans")
            .attr("font-weight", 700)
            .attr("font-size", function(d) {
                return "46px"
            })
            .attr("fill", "white")
            .attr('opacity', "1");

            ////////////

        d3.select(idname).select('.svgBase')
            .append('text')
            .text("Number of Edits")
            .attr("x", function(d) {
                var length = numberWithSpaces(totalEditsTwo).length
                return width - (24 * length) - 45 + 5
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
            .text(graphTwo[0] + "-wiki " + graphTwo[1].substring(0,9) )
            .attr("x", function(d) {
                var length = numberWithSpaces(totalEditsTwo).length
                return width - (24 * length) - 45 + 5
            })
            .attr("y", 55)
            .attr("font-family", "Helvetica Neue")
            .attr("font-size", function(d) {
                return "12.33px"
            })
            .attr("font-weight", "500")
            .attr("fill", "#DCDCDC")
            .attr('opacity', "1");

            ///////////

        d3.select(idname).select('.svgBase')
            .append('text')
            .text(numberWithSpaces(totalEditsTwo))
            .attr("x", function(d) {
                var length = numberWithSpaces(totalEditsTwo).length
                return width - (24 * length) - 45
            })
            .attr("y", 105)
            .attr("font-family", "Open Sans")
            .attr("font-weight", 700)
            .attr("font-size", function(d) {
                return "46px"
            })
            .attr("fill", "rgb(29, 177, 252)")
            .attr('opacity', "1");

        // d3.select(idname).select('.svgBase')
        //     .append('rect')
        //     .

        d3.select(idname).select('.svgBase')
            .append('text')
            .attr("id", "title" + idname.slice(1))
            .text("pageTitle")
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

        var drag = d3.behavior.drag()
            .on('dragstart', function() {
                rectangle.style('fill', 'red');
            })
            .on('drag', function() {
                rectangle.attr('x', d3.mouse(this)[0])
                    .attr('y', d3.mouse(this)[1]);

            })
            .on('dragend', function() {
                rectangle.style('fill', 'black');
            });


        svgBase.append("path")
            .datum(finaleOne)
            .attr("class", "upperline")
            .attr("d", upperline)
            .attr("fill", "none")
            .attr("stroke", function() {
                if (graphStyle == "cover") {
                    return "#e74c3c"
                } else {
                    return "#FAFAFA"
                }
            })
            .attr("stroke-width", "3px")
            .append('text')
            .text("Page Edits")
            .attr("x", function(d) {
                var length = numberWithSpaces(totalEditorsOne).length
                var lengthTwo = numberWithSpaces(totalEditsOne).length
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

        svgBase.append("path")
            .datum(finaleTwo)
            .attr("class", "upperline")
            .attr("d", upperline)
            .attr("fill", "none")
            .attr("stroke", function() {
                if (graphStyle == "cover") {
                    return "#e74c3c"
                } else {
                    return "#1DB1FC"
                }
            })
            .attr("stroke-width", "3px")
            .append('text')
            .text("Page Edits")
            .attr("x", function(d) {
                var length = numberWithSpaces(totalEditorsTwo).length
                var lengthTwo = numberWithSpaces(totalEditsTwo).length
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
                //                 return "<label class='btn btn-primary'  id='cover" + idname.slice(1) + "' ><input type='radio' name='options' autocomplete='off' checked=''>Cover</label><label class='btn btn-primary active' id='stretch" + idname.slice(1) + "'><input type='radio' name='options' autocomplete='off' checked=''>Stretch</label>"
                //             })
                //     });

                d3.select(this).append("div")
                    .attr("class", "sliderSections")
                    .each(function(d) {
                        d3.select(this).append("label")
                            .attr("class", "input-labels-graph")
                            .text('EXPORT')
                        d3.select(this).append("input")
                            .attr("type", "text")
                            .attr("class", "form-control")
                            .attr("placeholder", "Graph Title")
                            .style("width", "180px")
                            .attr("id", "graphTitle" + idname.slice(1))

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

        d3.select("#" + "graphTitle" + idname.slice(1)).on("input", function() {
            d3.select("#" + "title" + idname.slice(1))
                .text(this.value);
        });

        d3.select("#" + "imageHeightSlider" + idname.slice(1)).on("input", function() {
            updateImageHeight(+this.value);
        });

        d3.select("#" + "imageWidthSlider" + idname.slice(1)).on("input", function() {
            updateImageWidth(+this.value);
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

                    console.log(picUrl)

                    thereIs = width;
                    initializer(finaljsonObjectOne, finaljsonObjectTwo, pageTitle, userInputImageURL, width, height, "CCBYSA")
                        // initializer(dataTempOne, pageTitle, userInputImageURL, width, height)

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
            // d3.select("#svgdataurl").html(img);

            var canvas = document.querySelector("canvas"),
                context = canvas.getContext("2d");

            var image = new Image;
            image.src = imgsrc;
            image.onload = function() {

                canvas.height = 572;
                canvas.width = 1008;

                context.drawImage(image, 0, 0);

                // context.drawImage(image, -48, -72);

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
            console.log('asd')
                // initializer(finaljsonObjectOne, finaljsonObjectTwo, "one", "assets/defaultImage.jpg", 1000, 500)
            initializer(finaljsonObjectOne, finaljsonObjectTwo, pageTitle, picUrl, picWidth, picHeight, "CCBYSA")
        })
    }

    // This runs the pageEdit graph!
    // pageEdits(linkInitialPageEdits)

    // This gets the pageview stats from Stats.grok.se
    getDataExtraParams(linkInitialPageEdits, 0)
}