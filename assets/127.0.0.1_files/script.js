var multipleOne;
var multipleTwo;
var globali = 0;

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

// event.preventDefault();

/* The Search Functionality Starts */

// This part simply changes the UI. Just to add the the cross button when the WeeklyPedia section is used etc. 
$(document).ready(function() {
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
        cartodb.createVis('eleven', '    https://dpatel.cartodb.com/api/v2/viz/df71869c-2020-11e5-8a62-0e018d66dc29/viz.json');
    })
});

// Starts the search functionality of the article section. It then calls the next 4 functions (requestArticleExtracts, updateNumResults, resetDisplay, updateDisplay)
var search = function(query) {
    $.ajax({
        url: 'https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&srsearch=' + query,
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
    // Request extracts for each of the articles found in the search
    var extractQuery = 'https://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&exsentences=2&exlimit=max&exintro=&explaintext=&titles=';

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
        // I pray for forgiveness.
        // Todo: look for lightweight template libraries
        var htmlToAdd = "<div class='result_card'>";
        // htmlToAdd += "<a target='_' "  href='https://en.wikipedia.org/?curid=" + pages[pId].pageid + "'>";

        // Using pages[pId].title doesn't work in API call. Hence use pageID
        // console.log(pages[pId].title)
        var pageDetails = [pages[pId].pageid, pages[pId].title]
            // console.log(globali)
            // htmlToAdd += "<a nohref onClick=\"grandPlotter(" + pages[pId].pageid + "," + "\'" + pages[pId].title + "\'" + ")\">"
        htmlToAdd += "<a nohref onClick=\"precurssor(" + pages[pId].pageid +
            "," + globali +
            "," + "\'" + pages[pId].title + "\'" +
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

function imageChanger(id) {

    // console.log(id)

    var imageURL = d3.select("#" + "imageChanger" + id)

    // var zy = "#" + "imageChanger" + id

    // newImageURL = $(zy).val()
    // console.log(imageURL)

    // d3.select("#" + "rect" + xyz.slice(1))
    //     .data([0])
    //     .attr("opacity", function(d) {
    //         if (opacity == "increase") {
    //             return parseFloat(currentOpacity) + 0.05
    //         } else {
    //             return parseFloat(currentOpacity) - 0.05
    //         }
    //     })

}

/* Search functionality ends here */

function precurssor(input, globalia, pageTitle) {
    if (globali == 0) {
        multipleOne = input;
    } else {
        multipleTwo = input;
    }
    globali = globalia + 1;
    // console.log(globali)

    if (globali == 2) {
        // console.log(multipleOne + '  ' + multipleTwo)
        // grandPlotter2([multipleOne], [multipleTwo])

    } else {}

    grandPlotter(input, pageTitle)
}

/* WeeklyPedia functionality starts here */
// Automatic Most Editted and most recently editted pages are fetched and displayed. 
function weeklyPedia(parameter) {
    if (parameter == 'Most Edits') {

        //// Need to improve this. The previous friday date is hardcoded in here. Need to make it automatic using the current date.

        //         //moment().day(-2) always returns previous Friday!
        //         var previousFriday = moment().day(-2);
        //       // console.log(previousFriday)
        //         // Messy hack: will work only for California!     
        //         previousFriday = moment().add(7, "hours");

        var url = "http://weekly.hatnote.com/archive/en/" + 20150619 + "/weeklypedia_" + 20150619 + ".json"

        getWeeklyPedia(url, function(data) {
            var useFulData = data.query.results.json.mainspace

            for (i = 0; i < useFulData.length; i++) {

                var htmlToAdd = "<div class='weeklyPediaCards'>";
                // htmlToAdd += "<a target='_' "  href='https://en.wikipedia.org/?curid=" + pages[pId].pageid + "'>";

                // Using pages[pId].title doesn't work in API call. Hence use pageID
                // console.log(useFulData[i].title)

                htmlToAdd += "<a nohref onClick=\"precurssor(" + useFulData[i].page_id +
                    "," + globali +
                    "," + "\'" + useFulData[i].title_s + "\'" +
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

        //// Need to improve this. The previous friday date is hardcoded in here. Need to make it automatic using the current date.

        var url = "http://weekly.hatnote.com/archive/en/" + 20150619 + "/weeklypedia_" + 20150619 + ".json"
        getWeeklyPedia(url, function(data) {
            var useFulData = data.query.results.json.new_articles

            for (i = 0; i < useFulData.length; i++) {

                var htmlToAdd = "<div class='weeklyPediaCards'>";
                htmlToAdd += "<a nohref onClick=\"precurssor(" + useFulData[i].page_id +
                    "," + globali +
                    "," + "\'" + useFulData[i].title_s + "\'" +
                    ")\">"
                htmlToAdd += "<p>" + useFulData[i].title_s + "</p>";
                $('#closeMostEdits').hide()
                $('#closeMostNewEdits').show()
                $('#results_pane').find('.searchResults').html('');
                $('#suggestionsPane').find('.mostEdits').html('');
                $('#suggestionsPane').find('.mostNewEdits').append(htmlToAdd);

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
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
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

//// Have pity on this lonely variable. Find a new home for him. Preferrably somewhere with other variables.
var thereIs;

// Nepal Earthquake

// Jurrasic
grandPlotter('2615708', 'Jurrasic Park')

// grandPlotter("April_2015_Nepal_earthquake")

// This is the main place where everything works. All the calls the the APIs ( except for the article seach and weeklypedia suggestions ), pretty much everything lies here. 

function grandPlotter(pageIDin, pageTitlein) {

    // console.log(pageTitlein)

    //// Adding the upperBound for the timeLimit. Also, consider that the last week / last days edits are always less than the previous ones, since the day is just half completed. 
    var timeLimit = picker.getDate()
    var timeLimitUpper = pickerTwo.getDate()

    if (moment(timeLimit) == moment())

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
    //     container: "#one",
    //     id: "one"
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

    var jsonObject;
    var lastRevID;

    var linkInitialPageEdits = "https://en.wikipedia.org/w/api.php?action=query&prop=revisions&format=json&rvprop=ids%7Ctimestamp%7Cuser%7Cuserid%7Csize&rvlimit=1000&rvcontentformat=text%2Fplain" + "&pageids=" + pageID + "&format=json&callback=?"

    var linkSubsequentPageEdits = "https://en.wikipedia.org/w/api.php?action=query&prop=revisions&format=json&rvprop=ids%7Ctimestamp%7Cuser%7Cuserid%7Csize&rvlimit=1000&rvcontentformat=text%2Fplain" + "&rvstartid=" + lastRevID + "&pageids=" + pageID + "&format=json&callback=?"

    // The limit of results returned currently set to 300. Total number of Wikipedias is 277 ( as of 16/6/15 )
    var linkInitialWordCloud = "https://en.wikipedia.org/w/api.php?action=query&prop=langlinks&format=json&llprop=url%7Clangname%7Cautonym&lllimit=300&iwurl=" + "&pageids=" + pageID + "&format=json&callback=?"

    var linkInitialFeaturedArticle = "https://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&titles=Wikipedia%3A" + "Today\'s featured article/July 5, 2015"

    var linkInitialPageViews = "http://stats.grok.se/json/en/latest90/" + encodeURI(pageTitlein)

    var linkInitialEditorOfTheWeek = "https://en.wikipedia.org/w/api.php?action=query&prop=revisions&format=json&rvprop=timestamp%7Cuser%7Ccomment%7Ccontent&titles=Wikipedia%3AWikiProject_Editor_Retention%2FEditor_of_the_Week"

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

                var pageID = Object.keys(impData.query.pages)[0]
                var engTitle = impData.query.pages[pageID].title
                var impData = impData.query.pages[pageID].revisions
                    //  console.log(url)
                    // console.log("asdasdasdasddad")
                    // console.log(i + " } " + impData + " } " + pageID)

                // console.log(tempTest.responseJSON)
                // console.log(Object.keys(impData).length)

                if (Object.keys(impData).length == 500) {

                    var wordCloudJsonObjectlastRevID = impData[Object.keys(impData)[Object.keys(impData).length - 1]].revid

                    impDataConcated = impDataConcated.concat(impData)
                        // console.log(parameterTwo + "   ,   " + Object.keys(parameterOne).length)

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

                        wordCloud("https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original" + "&pageids=" + pageID + "&format=json&callback=?")

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
    var linkAddress;

    function getGeoData(editsRawData) {

        // $.post("https://wikimedia.cartodb.com/api/v2/sql?q=create table testinga (_user varchar, timestamp TIMESTAMP, difference int, lang int)&api_key=b80e6740e20f91d4cfda9b00a9474407f30ba7e1")
        // $.post("https://wikimedia.cartodb.com/api/v2/sql?q=select cdb_cartodbfytable('testinga')&api_key=b80e6740e20f91d4cfda9b00a9474407f30ba7e1")

        // $.post("https://wikimedia.cartodb.com/api/v2/sql?q=TRUNCATE TABLE test&api_key=b80e6740e20f91d4cfda9b00a9474407f30ba7e1")

        var ja = 0;

        var ipData = []

        for (i = 0; i < editsRawData.length; i++) {
            if ((editsRawData[i].user.match(/\./g) || []).length > 2) {
                ja = ja + 1;
                // console.log(editsRawData[i].user)
                ipData.push({
                    user: editsRawData[i].user,
                    timestamp: editsRawData[i].timestamp,
                    difference: editsRawData[i].difference
                        // difference: Math.abs(editsRawData[i].difference)
                })
            }
        }

        // console.log(JSON.stringify(ipData))

        var remainderEntries = ipData.length % 100;
        // console.log(remainderEntries)
        // console.log(ipData.length)
        // console.log(ipData.length - remainderEntries)

        for (j = 0; j < ipData.length - remainderEntries; j = j + 100) {
            var postQuery = "https://wikimedia.cartodb.com/api/v2/sql?q=INSERT INTO testinga (_user, timestamp, difference) VALUES "



            // console.log(ipData[i].difference)

            for (i = j; i < j + 100; i++) {
                // For the last one (without comma)
                if (i == j + 99) {
                    var postQueryPusher = "('" + ipData[i].user + "','" + ipData[i].timestamp + "','" + ipData[i].difference + "') &api_key=b80e6740e20f91d4cfda9b00a9474407f30ba7e1"
                } else {
                    var postQueryPusher = "('" + ipData[i].user + "','" + ipData[i].timestamp + "','" + ipData[i].difference + "'),"
                }
                postQuery = postQuery.concat(postQueryPusher)
            }

            // console.log(postQuery)
            // $.post("postQuery")
            $.post(postQuery)

        }

        var postQuery = "https://wikimedia.cartodb.com/api/v2/sql?q=INSERT INTO testinga (_user, timestamp, difference) VALUES "

        for (j = ipData.length - remainderEntries; j < ipData.length; j = j + 1) {

            // for (i = j; i < j + 100; i++) {
            //     // For the last one (without comma)
            if (j == ipData.length - 1) {
                var postQueryPusher = "('" + ipData[j].user + "','" + ipData[j].timestamp + "','" + ipData[j].difference + "') &api_key=b80e6740e20f91d4cfda9b00a9474407f30ba7e1"
            } else {
                var postQueryPusher = "('" + ipData[j].user + "','" + ipData[j].timestamp + "','" + ipData[j].difference + "'),"
            }
            postQuery = postQuery.concat(postQueryPusher)
                // }

            // console.log(postQuery)

            // console.log(postQuery)
            // $.post("postQuery")

        }
        // $.post(postQuery)
    }

    function pageEdits(url) {

        // console.log('check')

        getData(url, function(data) {

            // This part runs when the pageEdits function or the getData function is used to get the page edits. Otherwise the 'else' part is used (for the thumbnail dimensions and URL)
            if (url.indexOf("revisions") > -1) {

                jsonObject = data;

                // Clean up Data
                var pageID = Object.keys(jsonObject.query.pages)[0]
                jsonObject = jsonObject.query.pages[pageID].revisions

                // Get last revision ID
                lastRevID = jsonObject[Object.keys(jsonObject)[Object.keys(jsonObject).length - 1]].revid

                //  console.log(lastRevID)

                //  console.log(url)

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

                    // console.log(userInputImageURL)

                    if (userInputImageURL == "") {
                        // console.log('asdasd')
                        linkAddress = pageEdits("https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original" + "&pageids=" + pageID + "&format=json&callback=?")
                    } else {
                        getImageDimensions(
                            userInputImageURL,
                            function(width, height) {
                                thereIs = width;

                                pageEditsPlotter(finaljsonObject, "#one", "none", "", "", "day", pageTitle, userInputImageURL, width, height)
                                    // pageEditsPlotter(finaljsonObject, "#two", "none", "", "", "week", pageTitle, photoUrl, width, height)

                                // runNow("pageEdits", pageTitle, photoUrl, width, height, finaljsonObject, "", "", "")

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

                            pageEditsPlotter(finaljsonObject, "#one", "none", "", "", "day", pageTitle, photoUrl, width, height)
                                // pageEditsPlotter(finaljsonObject, "#two", "none", "", "", "week", pageTitle, photoUrl, width, height)

                            // runNow("pageEdits", pageTitle, photoUrl, width, height, finaljsonObject, "", "", "")

                        }
                    );

                } else {
                    // console.log('asdasd')

                    pageEditsPlotter(finaljsonObject, "#one", "none", "", "", "day", pageTitle, "assets/defaultImage.jpg", 1000, 500)
                        // pageEditsPlotter(finaljsonObject, "#two", "none", "", "", "week", pageTitle, "assets/defaultImage.jpg", 1000, 500)

                    // function runNow(origin, pageTitle, picUrl, picWidth, picHeight, dataSource, dataSourceLangLinks, pageEditCount) {
                    // runNow("pageEdits", pageTitle, "assets/defaultImage.jpg", 1000, 500, finaljsonObject, "", "", "")
                    // runNow("pageEdits", pageTitle, "assets/defaultImage.jpg", 1000, 500, finaljsonObject, "", "", "")

                }

            }
        })
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
                            runNow("wordCloud", pageTitle, photoUrl, width, height, "", langLinksJsonObject)
                            runNow("pieChart", pageTitle, "assets/defaultImage.jpg", 1000, 500, "", langLinksJsonObject)

                        }
                    );

                    // return jsonObjectLangLinks
                }
                // This part runs when there is no image for that article
                else {

                    runNow("wordCloud", pageTitle, "assets/defaultImage.jpg", 1000, 500, "", langLinksJsonObject)
                    runNow("pieChart", pageTitle, "assets/defaultImage.jpg", 1000, 500, "", langLinksJsonObject)

                    // return jsonObjectLangLinks

                }

            }

        })
    }

    function pageEditsPlotter(dataSource, idname, interpolation, parameter, plotParameter, timeDuration, pageTitle, picUrl, picWidth, picHeight) {

        var data = dataSource

        var previousSize;

        dataSource.forEach(function(d, i) {

            if (i == dataSource.length) {
                d.difference = d.size;
            }
            d.difference = d.size - previousSize;
            previousSize = d.size;
        })

        getGeoData(dataSource)

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
            .range([0, width]);

        var y = d3.scale.linear()
            .range([height, 150]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .ticks(5)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .ticks(4)
            .orient("left");

        var knotChecker;

        // console.log(timeLimit)
        // console.log(timeLimitUpper)

        var upperline = d3.svg.line()
            // .interpolate("bundle")
            .x(function(d, i) {

                if (timeLimit == null && timeLimitUpper == null) {
                    return x(parseDate(d.key));
                } else if (timeLimit == null && timeLimitUpper != null) {
                    if (moment(d.key).diff(moment(timeLimitUpper)) < 0) {
                        return x(parseDate(d.key))
                    }
                } else if (timeLimit != null && timeLimitUpper == null) {
                    if (moment(d.key).diff(moment(timeLimit)) > 0) {
                        return x(parseDate(d.key))
                    }
                } else if (timeLimit != null && timeLimitUpper != null) {
                    if (moment(d.key).diff(moment(timeLimit)) > 0 && moment(d.key).diff(moment(timeLimitUpper)) < 0) {
                        return x(parseDate(d.key))
                    }
                }

            })
            .y(function(d, i) {

                if (timeLimit == null && timeLimitUpper == null) {
                    return y(d.values);
                } else if (timeLimit == null && timeLimitUpper != null) {
                    if (moment(d.key).diff(moment(timeLimitUpper)) < 0) {
                        return y(d.values);
                    } else {}
                } else if (timeLimit != null && timeLimitUpper == null) {
                    if (moment(d.key).diff(moment(timeLimit)) > 0) {
                        return y(d.values);
                    } else {}
                } else if (timeLimit != null && timeLimitUpper != null) {
                    if (moment(d.key).diff(moment(timeLimit)) > 0 && moment(d.key).diff(moment(timeLimitUpper)) < 0) {
                        return y(d.values);
                    } else {}
                }

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

        var count = 0;

        var previousParameter = 0;
        var weekInitial;
        var weekNumber;
        var thisWeekNumber;

        var lastDate;
        var totalCount = 0;

        //  console.log(dataSource)
        // function (){
        dataSource.forEach(function(d) {

            var trueTime = d.timestamp

            // console.log(timeDuration)

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

            // // // Hours
            // // var tempDate = d.timestamp;
            // // tempDate = tempDate.substring(0, 13);
            // // tempDate = tempDate.concat(":00:00.000Z");

            d.timestamptrue = trueTime;

            // console.log(d.timestamptrue)

            d.values = 1;
        });

        // console.log(dataSource)

        // }

        //  console.log(dataSource)

        var data = d3.nest()
            .key(function(d) {
                //  console.log(d.timestamp + " " + moment(d.timestamp).day())
                return d.timestamp;
            })
            .rollup(function(d) {
                // return 100
                return d3.sum(d, function(d) {
                    return d.values;
                });
            }).entries(dataSource);

        //  console.log(data)

        // Attempting to fix the Zero Date problem

        var finale = []

        if (timeDuration == "day") {

            // BEWARE BEWARE BEWARE!
            // Countless hours have been spent trying to get this part to work. 
            // TLDR; On MediaWiki APIs, time runs backwards!

            var previousDateActual = "";
            var dayMinusOne;

            data.forEach(function(d, i) {

                // console.log('asd')

                var dayPlusOne = moment(d.key).add(1, 'days')

                // Daylight Savings (the knot problem)
                if (JSON.stringify(dayPlusOne).indexOf("T23:00:01.000Z") > -1) {
                    dayPlusOne = moment(dayPlusOne).add(1, "hour")

                    // console.log(JSON.stringify(dayPlusOne))
                }
                if (JSON.stringify(dayPlusOne).indexOf("T01:00:01.000Z") > -1) {
                    dayPlusOne = moment(dayPlusOne).subtract(1, "hour")

                    // console.log(JSON.stringify(dayPlusOne))
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

                        //  console.log('two  ' + tempIn)

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

                        //  console.log('two  ' + tempIn)

                    } else {

                    }
                }

                // END

                if (i != 0) {

                    if (JSON.stringify(dayPlusOne) != JSON.stringify(previousDate)) {

                        // console.log('Here')

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

                    // console.log(theDayMisnomerMinus)
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

        // console.log(data)

        var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
                return "<strong>Frequency:</strong> <span style='color:red'>" + d.frequency + "</span>";
            })

        svgBase.call(tip);

        //  console.log(JSON.stringify(finale, undefined, 2))

        x.domain(d3.extent(finale, function(d) {

            if (timeLimit == null && timeLimitUpper == null) {
                return parseDate(d.key);
            } else if (timeLimit == null && timeLimitUpper != null) {
                if (moment(d.key).diff(moment(timeLimitUpper)) < 0) {
                    return parseDate(d.key);
                } else {}
            } else if (timeLimit != null && timeLimitUpper == null) {
                if (moment(d.key).diff(moment(timeLimit)) > 0) {
                    return parseDate(d.key);
                } else {}
            } else if (timeLimit != null && timeLimitUpper != null) {
                if (moment(d.key).diff(moment(timeLimit)) > 0 && moment(d.key).diff(moment(timeLimitUpper)) < 0) {
                    return parseDate(d.key);
                } else {}
            } else {}
        }))
        y.domain(d3.extent(finale, function(d) {

            if (timeLimit == null && timeLimitUpper == null) {
                return d.values;
            } else if (timeLimit == null && timeLimitUpper != null) {
                if (moment(d.key).diff(moment(timeLimitUpper)) < 0) {
                    return d.values;
                } else {}
            } else if (timeLimit != null && timeLimitUpper == null) {
                if (moment(d.key).diff(moment(timeLimit)) > 0) {
                    return d.values;
                } else {}
            } else if (timeLimit != null && timeLimitUpper != null) {
                if (moment(d.key).diff(moment(timeLimit)) > 0 && moment(d.key).diff(moment(timeLimitUpper)) < 0) {
                    return d.values;
                } else {}
            } else {}
        }));

        // The opacity rectangle and the image need to be above everything else. Otherwise the graphs and the text would be hidden

        // Image Bleed Stuff
        var imgs = svgFull.selectAll("image").data([0]);
        imgs.enter()
            .append("svg:image")
            .attr('class', "images")
            .attr('id', "image" + idname.slice(1))
            .attr("xlink:href", function(d) {
                if (picUrl == undefined) {
                    picUrl = "assets/defaultImage.jpg"
                    return "assets/defaultImage.jpg"
                } else {
                    return picUrl
                }
            })
            .attr("x", function(d) {
                if (picUrl != "assets/defaultImage.jpg") {
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
                if (picUrl != "assets/defaultImage.jpg") {
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
                if (picUrl != "assets/defaultImage.jpg") {
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
                if (picUrl != "assets/defaultImage.jpg") {
                    if (picHeight / picWidth <= fullBleedHeight / fullBleedWidth) {
                        return fullBleedHeight
                    } else {
                        return (fullBleedWidth / picWidth) * picHeight
                    }
                } else {
                    return fullBleedHeight
                }
            });

        var totalEdits = 0;

        dataSource.forEach(function(d) {
            totalEdits = totalEdits + parseInt(d.values)
        })

        // Adding Wikipedia Logo
        d3.select(idname).select('.svgBase')
            .append("svg:image")
            .attr("xlink:href", "assets/wikipediaW.png")
            .attr("x", width - 80)
            .attr("y", 0)
            .attr("width", 70)
            .attr("height", 70);

        d3.select(idname).select('.svgBase')
            .append('text')
            .text("PAGEEDITS")
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
            .text(numberWithSpaces(totalEdits))
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

        if (picUrl != "assets/defaultImage.jpg") {

            var opacityRect = svgFull.append("rect")
                .attr("id", "rect" + idname.slice(1))
                .attr("width", width + margin.right + margin.left)
                .attr("fill", "black")
                .attr("opacity", 0.7)
                .attr("z-index", 0)
                .attr("height", height + margin.top + margin.bottom);

        }

        // .attr("transform", "translate(0," + height + ")") shifts the axis to the bottom part of the G element. 
        svgBase.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svgBase.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            //.text("Ratings");

        svgBase.append("path")
            .datum(finale)
            .attr("class", "upperline")
            .attr("d", upperline)
            .attr("fill", "white")
            .attr("stroke", "#3FC380")
            .attr("stroke-width", "1px")

        svgBase.selectAll("circle.line")
            .data(data)
            .enter().append("svg:circle")
            .attr("class", "line")
            .style("fill", "green")
            .attr("cx", upperline.x())
            .attr("cy", upperline.y())
            .attr("r", 12)
            .attr('opacity', 0)
            .on('click', tip.show)
            // .on('mouseout', tip.hide)

        d3.select(idname)
            .selectAll("div")
            .data([0])
            .enter()
            .append("div")
            .attr("id", function(d) {
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
                    // console.log(ina)
                    return ina
                })
        }
    }

    //// Think of a way to combine it with getData
    function pageViews(url, callback) {
        getDataNoCrossOrigin(url, function(data) {
            var arrayData = []
                // console.log(url)
                // console.log(data)
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

                // console.log(arrayData)

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

                            pageEditsPlotter(finaljsonObject, "#two", "none", "", "", "week", pageTitle, photoUrl, width, height)

                            // runNow("pageEdits", pageTitle, photoUrl, width, height, finaljsonObject, "", "", "")

                        }
                    );

                } else {
                    pageViewsPlotter(arrayData, "#seven", "none", "", "", "day", pageTitle, "assets/defaultImage.jpg", 1000, 500)
                    pageViewsPlotter(arrayData, "#eight", "bundle", "", "", "day", pageTitle, "assets/defaultImage.jpg", 1000, 500)

                    pageEditsPlotter(finaljsonObject, "#two", "none", "", "", "week", pageTitle, "assets/defaultImage.jpg", 1000, 500)

                    // function runNow(origin, pageTitle, picUrl, picWidth, picHeight, dataSource, dataSourceLangLinks, pageEditCount) {
                    // runNow("pageEdits", pageTitle, "assets/defaultImage.jpg", 1000, 500, finaljsonObject, "", "", "")
                    // runNow("pageEdits", pageTitle, "assets/defaultImage.jpg", 1000, 500, finaljsonObject, "", "", "")

                }
            })

            // pageViewsPlotter(arrayData)
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
            .range([0, width]);

        var y = d3.scale.linear()
            .range([height, 150]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .ticks(5)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .ticks(5)
            .orient("left");

        // var knotChecker;

        var upperline = d3.svg.line()
            .interpolate(interpolation)
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

        // Adding Wikipedia Logo
        d3.select(idname).select('.svgBase')
            .append("svg:image")
            .attr("xlink:href", "assets/wikipediaW.png")
            .attr("x", width - 80)
            .attr("y", 0)
            .attr("width", 70)
            .attr("height", 70);

        var totalViews = 0;

        dataSource.forEach(function(d) {
            totalViews = totalViews + parseInt(d.pageViews)
        })

        d3.select(idname).select('.svgBase')
            .append('text')
            .text("PAGEVIEWS")
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

        // .attr("transform", "translate(0," + height + ")") shifts the axis to the bottom part of the G element. 
        svgBase.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svgBase.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            //.text("Ratings");

        svgBase.append("path")
            .datum(dataSource)
            .attr("class", "upperline")
            .attr("d", upperline)
            .attr("fill", "white")
            .attr("stroke", "#3FC380")
            .attr("stroke-width", "1px")

        d3.select(idname)
            .selectAll("div")
            .data([0])
            .enter()
            .append("div")
            .attr("id", function(d) {
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
                    // console.log(ina)
                    return ina
                })
        }

    }

    function runNow(origin, pageTitle, picUrl, picWidth, picHeight, dataSource, dataSourceLangLinks, pageEditCount) {

        function wordCloudLangLinks(dataSourceLangLinks, idname, wordText, fontSizeLowerBound, fontSizeUpperBound) {

            $('#loader').html('');
            $(idname).html('');

            var sizeScale = d3.scale.linear()
                .domain([0, d3.max(dataSourceLangLinks, function(d) {
                    return d.totalEdits
                })])
                .range(
                    [fontSizeLowerBound, fontSizeUpperBound]
                ); // 95 because 100 was causing stuff to be missing

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
                // .attr("width", width + margin.left + margin.right)
                // .attr("height", height + margin.top + margin.bottom)
                .attr("transform", "translate(" + (-1) * margin.left + "," + (-1) * margin.top + ")");

            // var color = d3.scale.linear()
            //     .domain([100000,5000, 0])
            //     .color(["#222222", "#333333", "#444444"])
            //     //.domain([1000, 700, 300, 100, 0])
            //     //.range(["#eee", "#e6e6e6", "#ddd", "#d6d6d6", "#ccc"]);

            var imgs = svgFull.selectAll("image").data([0]);
            imgs.enter()
                .append("svg:image")
                .attr('class', "images")
                .attr("xlink:href", function(d) {
                    if (picUrl == undefined) {
                        picUrl = "assets/defaultImage.jpg"
                        return "assets/defaultImage.jpg"
                    } else {
                        return picUrl
                    }
                })
                .attr("x", function(d) {
                    if (picUrl != "assets/defaultImage.jpg") {
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
                    if (picUrl != "assets/defaultImage.jpg") {
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
                    if (picUrl != "assets/defaultImage.jpg") {
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
                    if (picUrl != "assets/defaultImage.jpg") {
                        if (picHeight / picWidth <= fullBleedHeight / fullBleedWidth) {
                            return fullBleedHeight
                        } else {
                            return (fullBleedWidth / picWidth) * picHeight
                        }
                    } else {
                        return fullBleedHeight
                    }
                });

            // Adding Wikipedia Logo
            d3.select(idname).select('.svgBase')
                .append("svg:image")
                .attr("xlink:href", "assets/wikipediaW.png")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", 70)
                .attr("height", 70);

            d3.select(idname).select('.svgBase')
                .append('text')
                .text(pageTitle)
                .attr("x", 100)
                .attr("y", 45)
                .attr("font-family", "Georgia")
                .attr("font-size", function(d) {
                    return "32px"
                })
                .attr("fill", "white")
                .attr('opacity', "0.8");

            if (picUrl != "assets/defaultImage.jpg") {

                var opacityRect = svgFull.append("rect")
                    .attr("width", width + margin.right + margin.left)
                    .attr("fill", "black")
                    .attr("opacity", 0.7)
                    .attr("z-index", 0)
                    .attr("height", height + margin.top + margin.bottom);

            }

            var layout = d3.layout.cloud().size([930, 420])
                .words(dataSourceLangLinks)
                .padding(10)
                .rotate(0)
                .text(function(d) {
                    if (wordText == "autonym") {
                        return d.autonym;
                    } else {
                        return d.articleTitle;
                    }
                })
                .fontSize(function(d) {
                    return sizeScale(d.totalEdits)
                })
                .on("end", draw)

            layout.start();

            //  console.log(dataSourceLangLinks)

            // langLinksJsonObject.push({
            //             lang: parameterOne[parameterTwo].lang,
            //             articleTitle: parameterOne[parameterTwo].articleTitle,
            //             autonym: parameterOne[parameterTwo].autonym,
            //             langname: parameterOne[parameterTwo].langname,
            //             totalEdits: pageEditsTotal
            //         })

            function draw(words) {
                svgBase.append("g")
                    .attr("transform", "translate(370,310)")
                    .attr("width", 1200)
                    .attr("height", 700)
                    .attr("class", "wordcloud")
                    .append("g")
                    // without the transform, words words would get cutoff to the left and top, they would
                    // appear outside of the SVG area
                    // .attr("transform", "translate(320,200)")
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

        function langPieChartTest(dataSourceLangLinks, idname) {

            var data = dataSourceLangLinks;

            $(idname).html('')

            var svg = d3.select("body").select("#five")
                // .attr("width", 1000)
                // .attr("height", 800)
                .append("svg")

            .attr("width", 1000)
                .attr("height", 500)
                .append("g")

            var colors = ['rgb(141,211,199)', 'rgb(255,255,179)', 'rgb(190,186,218)', 'rgb(251,128,114)', 'rgb(128,177,211)', 'rgb(253,180,98)', 'rgb(179,222,105)', 'rgb(252,205,229)', 'rgb(217,217,217)']

            // var svg = d3.select("body")
            //     .append("svg")
            //     .append("g")

            svg.append("g")
                .attr("class", "slices");
            svg.append("g")
                .attr("class", "labels");
            svg.append("g")
                .attr("class", "lines");

            var width = 960,
                height = 450,
                radius = Math.min(width, height) / 2;

            var pie = d3.layout.pie()
                .sort(null)
                .value(function(d) {
                    return d.totalEdits;
                });

            var arc = d3.svg.arc()
                .outerRadius(radius * 0.8)
                .innerRadius(radius * 0.4);

            var outerArc = d3.svg.arc()
                .innerRadius(radius * 0.9)
                .outerRadius(radius * 0.9);

            svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

            var key = function(d) {
                return d.data.autonym;
            };

            data.sort(function(x, y) {
                return d3.descending(x.totalEdits, y.totalEdits);
            })

            var totalOtherEdits = 0;
            var newData = []

            data.forEach(function(d, i) {

                // console.log(i + 'sadasd')
                if (i > 5) {
                    // d.totalEdits = 0;
                    totalOtherEdits = totalOtherEdits + d.totalEdits
                        // console.log(d.totalEdits)
                } else {
                    newData.push({
                        lang: d.lang,
                        articleTitle: d.articleTitle,
                        autonym: d.autonym,
                        langname: d.langname,
                        totalEdits: d.totalEdits
                    })

                }

                //  console.log(totalOtherEdits)

            })

            newData.push({
                lang: "Other",
                articleTitle: "Other",
                autonym: "Other",
                langname: "Other",
                totalEdits: totalOtherEdits
            })

            // var color = d3.scale.ordinal()
            //     .domain(["Lorem ipsum", "dolor sit", "amet", "consectetur", "adipisicing", "elit", "sed", "do", "eiusmod", "tempor", "incididunt"])
            //     .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

            // function randomData() {
            //     var labels = color.domain();
            //     return labels.map(function(label) {
            //         return {
            //             label: label,
            //             value: Math.random()
            //         }
            //     });
            // }

            change(newData);

            // d3.select(".randomize")
            //     .on("click", function() {
            //         change(randomData());
            //     });

            // console.log(colors.domain());

            function change(data) {

                /* ------- PIE SLICES -------*/
                var slice = svg.select(".slices").selectAll("path.slice")
                    .data(pie(data), key);

                slice.enter()
                    .insert("path")
                    .style("fill", function(d, i) {
                        // console.log(colorsa)
                        //  console.log(newData)
                        return colors[i]

                    })
                    .attr("class", "slice");

                slice
                    .transition().duration(1000)
                    .attrTween("d", function(d) {
                        this._current = this._current || d;
                        var interpolate = d3.interpolate(this._current, d);
                        this._current = interpolate(0);
                        return function(t) {
                            return arc(interpolate(t));
                        };
                    })

                slice.exit()
                    .remove();

                /* ------- TEXT LABELS -------*/

                var text = svg.select(".labels").selectAll("text")
                    .data(pie(data), key);

                text.enter()
                    .append("text")
                    .attr("dy", ".35em")
                    .text(function(d) {
                        return d.data.autonym;
                    });

                function midAngle(d) {
                    return d.startAngle + (d.endAngle - d.startAngle) / 2;
                }

                text.transition().duration(1000)
                    .attrTween("transform", function(d) {
                        this._current = this._current || d;
                        var interpolate = d3.interpolate(this._current, d);
                        this._current = interpolate(0);
                        return function(t) {
                            var d2 = interpolate(t);
                            var pos = outerArc.centroid(d2);
                            pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
                            return "translate(" + pos + ")";
                        };
                    })
                    .styleTween("text-anchor", function(d) {
                        this._current = this._current || d;
                        var interpolate = d3.interpolate(this._current, d);
                        this._current = interpolate(0);
                        return function(t) {
                            var d2 = interpolate(t);
                            return midAngle(d2) < Math.PI ? "start" : "end";
                        };
                    });

                text.exit()
                    .remove();

                /* ------- SLICE TO TEXT POLYLINES -------*/

                var polyline = svg.select(".lines").selectAll("polyline")
                    .data(pie(data), key);

                polyline.enter()
                    .append("polyline");

                polyline.transition().duration(1000)
                    .attrTween("points", function(d) {
                        this._current = this._current || d;
                        var interpolate = d3.interpolate(this._current, d);
                        this._current = interpolate(0);
                        return function(t) {
                            var d2 = interpolate(t);
                            var pos = outerArc.centroid(d2);
                            pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                            return [arc.centroid(d2), outerArc.centroid(d2), pos];
                        };
                    });

                polyline.exit()
                    .remove();
            };
        }

        if (origin == "pageEdits") {
            pageEditsPlotter(dataSource, "#one", "none", "size", "size", "day")
            pageEditsPlotter(dataSource, "#two", "none", "size", "size", "week")

        } else if (origin == "wordCloud") {
            wordCloudLangLinks(langLinksJsonObject, "#three", "autonym", 25, 75)
            wordCloudLangLinks(langLinksJsonObject, "#four", "articleTitle", 10, 50)
        } else if (origin == "pieChart") {
            langPieChartTest(langLinksJsonObject, "#five")
        }

        // pageEditsPlotter(dataSource, "#three", "none", "size", "size", "hour")
        // pageEditsPlotter(dataSource, "#four", "none", "size", "size", "month")
    }

    var extract;
    var articleTitle;

    function featuredArticle(url) {

        getData(url, function(data) {

            if (url.indexOf("extracts") > -1) {

                impData = data

                var pageID = Object.keys(impData.query.pages)[0]
                var engTitle = impData.query.pages[pageID].title

                extract = impData.query.pages[pageID].extract
                    // console.log(extract)

                articleTitle = extract.match(/<b>(.*?)<\/b>/g)[0]

                articleTitle = articleTitle.replace("<b>", "").replace("</b>", "")

                extract = extract.match(/<\/b>(.*)\(<b>/g, "")[0]
                extract = extract.replace("</b>", "").replace(" (<b>", "")

                // console.log(extract)

                var userInputImageURL = $('#imageURL').val()

                if (userInputImageURL == "") {
                    featuredArticle("https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original" + "&titles=" + articleTitle + "&format=json&callback=?")
                } else {
                    getImageDimensions(
                        userInputImageURL,
                        function(width, height) {
                            thereIs = width;
                            featuredArticlePlotter(articleTitle, extract, "#one", userInputImageURL, width, height)
                        }
                    );
                }

            } else {

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

                            // console.log(width)

                            featuredArticlePlotter(articleTitle, extract, "#one", photoUrl, width, height)
                        }
                    );

                } else {
                    featuredArticlePlotter(articleTitle, extract, "#one", "assets/defaultImage.jpg", 1000, 500)

                }

            }

        })
    }

    var EOWs;
    var reasonsEOWs;
    var dateEOWs;

    function editorOfTheWeek(url) {

        getData(url, function(data) {

            impData = data

            var pageID = Object.keys(impData.query.pages)[0]

            impData = impData.query.pages[pageID].revisions[0]['*']

            var currentYearTable = impData.replace(/\r?\n|\r/g, '')

            var x = currentYearTable.indexOf("2015 Recipients of ''Editor of the Week'' aka ''The Eddy''=={| class=\"wikitable sortable\" style=\"margin: 1em auto 1em auto;\"|-! Recipient !! data-sort-type=\"date\" | Date awarded !! Reason|");
            var y = currentYearTable.indexOf("{{mbox|text='''Visit the [[Wikipedia:WikiProject Editor Retention/Editor of the Week/Hall of Fame|Editor of the Week Hall of Fame]]'''|image=[[File:Editor of the week barnstar.svg|44px]]|style=width:30em;margin: 1em auto 1em auto;}}{{center|[[Wikipedia:WikiProject Editor Retention/Editor of the Week/Accepted nominations|Queue of accepted nominations]]}}==Members==*Please sign this with three tildes (<nowiki>~~~</nowiki>) if you are interested in helping with this project.")

            currentYearTable = currentYearTable.slice(x, y)
            currentYearTable = currentYearTable.replace("2015 Recipients of ''Editor of the Week'' aka ''The Eddy''=={| class=\"wikitable sortable\" style=\"margin: 1em auto 1em auto;\"|-! Recipient !! data-sort-type=\"date\" | Date awarded !! Reason", "")

            currentYearTable = currentYearTable.split("\|-\| ")

            // currentYearTable = currentYearTable.replace(/.*(?=2015 Recipients of )/g, '')

            // currentYearTable = currentYearTable.replace(/.*(?=2015 Recipients of )/g, '')

            // var totalEntriesCurrentYear = currentYearTable.length

            // TODO month wise seperation. Not past four or five

            var pastFourEOW = [currentYearTable[currentYearTable.length - 1], currentYearTable[currentYearTable.length - 2], currentYearTable[currentYearTable.length - 3], currentYearTable[currentYearTable.length - 4], ]


            var EOWs = []
            var reasonsEOWs = []
            var dateEOWs = []


            for (i = 0; i < 4; i++) {
                pastFourEOW[i] = pastFourEOW[i].split('\| ')

                // console.log(i)
                if (pastFourEOW[i][0].match(/(.*)\|/) != null) {
                    EOWs.push(((pastFourEOW[i][0].match(/(.*)\|/))[1]).replace('[[', '').replace('User:', ''))
                    reasonsEOWs.push(((pastFourEOW[i][2].match(/\d (.*)/))[1]).replace(']|}', ''))
                } else {
                    EOWs.push(null)
                    reasonsEOWs.push(null)
                }

                dateEOWs.push(pastFourEOW[i][1])

            }

            editorOfTheWeekPlotter(EOWs, reasonsEOWs, dateEOWs, "#thirteen", "assets/defaultImage.jpg", 1000, 500)



        })
    }

    function featuredArticlePlotter(articleTitle, extract, idname, picUrl, picWidth, picHeight) {

        var previousSize;

        // console.log(idname)

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

        // Image Bleed Stuff
        var imgs = svgFull.selectAll("image").data([0]);
        imgs.enter()
            .append("svg:image")
            .attr('class', "images")
            .attr('id', "image" + idname.slice(1))
            .attr("xlink:href", function(d) {
                if (picUrl == undefined) {
                    picUrl = "assets/defaultImage.jpg"
                    return "assets/defaultImage.jpg"
                } else {
                    return picUrl
                }
            })
            .attr("x", function(d) {
                if (picUrl != "assets/defaultImage.jpg") {
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
                if (picUrl != "assets/defaultImage.jpg") {
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
                if (picUrl != "assets/defaultImage.jpg") {
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
                if (picUrl != "assets/defaultImage.jpg") {
                    if (picHeight / picWidth <= fullBleedHeight / fullBleedWidth) {
                        return fullBleedHeight
                    } else {
                        return (fullBleedWidth / picWidth) * picHeight
                    }
                } else {
                    return fullBleedHeight
                }
            });

        // Adding Wikipedia Logo
        d3.select(idname).select('.svgBase')
            .append("svg:image")
            .attr("xlink:href", "assets/wikipediaW.png")
            .attr("x", width - 80)
            .attr("y", 0)
            .attr("width", 70)
            .attr("height", 70);

        d3.select(idname).select('.svgBase')
            .append('text')
            .text(articleTitle)
            .attr("x", 20)
            .attr("y", 200)
            .attr("font-family", "Open Sans")
            .attr("font-size", function(d) {
                return "50px"
            })
            .attr("fill", "white")
            .attr('opacity', "0.8");

        d3.select(idname).select('.svgBase')
            .append('rect')
            .attr("height", 400)
            .attr("width", 840)
            .attr("y", "200px")
            .attr("x", "20px")
            .attr("fill", "white")
            .attr('opacity', "0")

        extractRequiredPortion = extract.match(/\n|([^\r\n.!?]+([.!?]+|$))/gim)[0]
        extractRequiredPortion = extractRequiredPortion + extract.match(/\n|([^\r\n.!?]+([.!?]+|$))/gim)[1]
        extractRequiredPortion = extractRequiredPortion + extract.match(/\n|([^\r\n.!?]+([.!?]+|$))/gim)[2]


        d3.select(idname).select('.svgBase')
            .append('text')
            .attr("id", "rectResize")
            .text(extractRequiredPortion)
            .attr("x", 20)
            .attr("y", "220px")
            .attr("font-family", "Georgia")
            .attr("font-size", function(d) {
                return "30px"
            })
            .style("line-height", "40px")
            .attr("fill", "white")
            .attr('opacity', "0.8")

        d3plus.textwrap()
            .container(d3.select("#rectResize"))
            // .resize(true)
            .padding(50)
            .height(800)
            .draw();

        // d3.select(idname).select('.svgBase')
        //     .append('text')
        //     .text(numberWithSpaces(totalEdits))
        //     .attr("x", 0)
        //     .attr("y", 85)
        //     .attr("font-family", "Open Sans")
        //     .attr("font-weight", 700)
        //     .attr("font-size", function(d) {
        //         return "60px"
        //     })
        //     .attr("fill", "white")
        //     .attr('opacity', "0.8");

        d3.select(idname).select('.svgBase')
            .append('text')
            .text("Today's Featured Article")
            .attr("text-anchor", "end")
            .attr("x", width - 100)
            .attr("y", 45)
            .attr("font-family", "Georgia")
            .attr("font-size", function(d) {
                return "32px"
            })
            .attr("fill", "white")
            .attr('opacity', "0.8");

        if (picUrl != "assets/defaultImage.jpg") {

            // console.log('asdas')

            var opacityRect = svgFull.append("rect")
                .attr("id", "rect" + idname.slice(1))
                .attr("width", width + margin.right + margin.left)
                .attr("fill", "black")
                .attr("opacity", 0.7)
                .attr("z-index", 0)
                .attr("height", height + margin.top + margin.bottom);
        }

        d3.select(idname)
            .selectAll("div")
            .data([0])
            .enter()
            .append("div")
            .attr("id", function(d) {
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
                    // console.log(ina)
                    return ina
                })
        }

        function wrap(text, width) {
            text.each(function() {
                var text = d3.select(this),
                    words = text.text().split(/\s+/).reverse(),
                    word,
                    line = [],
                    lineNumber = 0,
                    lineHeight = 1.1, // ems
                    y = text.attr("y"),
                    dy = parseFloat(text.attr("dy")),
                    tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
                while (word = words.pop()) {
                    line.push(word);
                    tspan.text(line.join(" "));
                    if (tspan.node().getComputedTextLength() > width) {
                        line.pop();
                        tspan.text(line.join(" "));
                        line = [word];
                        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                    }
                }
            });
        }
    }

    function editorOfTheWeekPlotter(EOWs, reasonsEOWs, dateEOWs, idname, picUrl, picWidth, picHeight) {

        console.log(dateEOWs)

        var previousSize;

        // console.log(idname)

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

        // Image Bleed Stuff
        var imgs = svgFull.selectAll("image").data([0]);
        imgs.enter()
            .append("svg:image")
            .attr('class', "images")
            .attr('id', "image" + idname.slice(1))
            .attr("xlink:href", function(d) {
                return "assets/defaultImage.jpg"
            })
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", fullBleedWidth)
            .attr("height", fullBleedHeight);

        // Adding Wikipedia Logo
        d3.select(idname).select('.svgBase')
            .append("svg:image")
            .attr("xlink:href", "assets/wikipediaW.png")
            .attr("x", width - 80)
            .attr("y", 0)
            .attr("width", 70)
            .attr("height", 70);


        var circle = svgBase.selectAll("circle")
            .data([0, 0, 0, 0]);

        var imageEnter = circle.enter().append("svg:image");

        imageEnter.attr("xlink:href", "assets/EOWBarnstar.png")
        imageEnter.attr("x", function(d, i) {
            return i * 200 + 100;
        });
        imageEnter.attr("y", 240);
        imageEnter.attr("width", 100).attr("height", 100)
        EOWs = EOWs.concat(dateEOWs)
        EOWs = EOWs.concat(reasonsEOWs)

        // Editor of the Weeks
        var textEnter = svgBase.selectAll("text")
            .data(EOWs);
        var textEnter = textEnter.enter().append("text");


        textEnter.text(function(d) {
            if (d != null) {
                return d
            } else {
                return "N/A"
            }
        })
        textEnter.attr("x", function(d, i) {
            if ( i < 4) {
                return i * 200 + 150;
            } else if ( i > 3 && i < 8) {
                return (i - 4) * 200 + 150;
            }
        });
        textEnter.attr("y", function(d, i) {
            if ( i < 4) {
                return 180;
            } else if ( i > 3 && i < 8) {
                return 210;
            }
        });
        textEnter.attr("font-family", function(d, i) {
            if ( i < 4) {
                return "Georgia";
            } else if ( i > 3 && i < 8) {
                return "Open Sans";
            }
        }).attr("font-size", function(d, i) {
            if ( i < 4) {
                return 22;
            } else if ( i > 3 && i < 8) {
                return 16;
            }
        }).attr("text-anchor", "middle").attr("fill", "white").attr('opacity', "0.8")

        // Editor of the Weeks
        // var textEnterDate = svgBase.selectAll("text")
        //     .data(dateEOWs);
        // var textEnterDate = textEnterDate.enter().append("text");

        // textEnterDate.text(function(d) {
        //     console.log(d)
        //     return d
        // })
        // textEnterDate.attr("x", function(d, i) {
        //     return i * 200 + 150;
        // });
        // textEnterDate.attr("y", 200);
        // textEnterDate.attr("font-family", "Open Sans").attr("font-size", 10).attr("text-anchor", "middle").attr("fill", "white").attr('opacity', "0.8")


    }

    // This runs the pageEdit graph!
    // pageEdits(linkInitialPageEdits)

    // This runs the wordCloud graph!ssss
    // wordCloud(linkInitialWordCloud)

    // This gets the pageview stats from Stats.grok.se
    // pageViews(linkInitialPageViews)

    featuredArticle(linkInitialFeaturedArticle)

    editorOfTheWeek(linkInitialEditorOfTheWeek)
}

// grandPlotter(2615708, "Jurrasic World")
// grandPlotter2([46514718], [11056991])

// Legend //

///// = Pretty Difficult.
//*// = Not that Difficult
//**// = Ah! That is what I can fix in my sleep.