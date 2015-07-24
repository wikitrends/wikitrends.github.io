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

/* The Search Functionality Starts */

// This part simply changes the UI. Just to add the the cross button when the WeeklyPedia section is used etc. 
$(document).ready(function() {

    $('#element').tooltip('show')

    var currFFZoom = 1;
    var currIEZoom = 100;

    var step = 10;
    currIEZoom -= step;
    $('body').css('zoom', ' ' + currIEZoom + '%');

    $(".lang-selector li a").click(function(){
        console.log('asd')
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

    $('#tenB').click(function() {
        cartodb.createVis('ten', 'https://dpatel.cartodb.com/api/v2/viz/7f6c716a-1a1e-11e5-9539-0e4fddd5de28/viz.json');
    })

    $('#nineB').click(function() {
        cartodb.createVis('nine', 'https://dpatel.cartodb.com/api/v2/viz/771e43ca-1a38-11e5-a03e-0e0c41326911/viz.json');
    })

    $('#elevenB').click(function() {
            cartodb.createVis('eleven', '    https://dpatel.cartodb.com/api/v2/viz/df71869c-2020-11e5-8a62-0e018d66dc29/viz.json');
        })
        // $('#svgToPng').click(function() {
        //     svgToPng()
        // })
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
        var htmlToAdd = "<div class='result_card'>";
        // htmlToAdd += "<a target='_' "  href='https://en.wikipedia.org/?curid=" + pages[pId].pageid + "'>";

        // Using pages[pId].title doesn't work in API call. Hence use pageID
        // console.log(pages[pId].title)
        var pageDetails = [pages[pId].pageid, pages[pId].title]
            // console.log(globali)
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
        // console.log(pageTitle)

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
    var lastFriday = moment().startOf('week').subtract(2, 'days')
    lastFriday = JSON.stringify(lastFriday).slice(1,11).replace(/-/g, "")


    var textCheck = $(".lang-selector li a").parents(".input-group-btn").find('.btn').text()

    console.log(textCheck.replace("<span class='caret'></span>", "").toLowerCase());

    if (parameter == 'Most Edits') {

        var url = "http://weekly.hatnote.com/archive/en/" + lastFriday + "/weeklypedia_" + lastFriday + ".json"

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

// function grandPlotter(pageIDin, pageTitlein) {

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
                .call(spin, 1600)

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
                    .duration(7600)
                    .attrTween("stroke-dasharray", tweenDash)
                    .each("end", function() {
                        d3.select(this).call(transition);
                    });
            }
        };
    }

    var myLoader = loader({
        width: 960,
        height: 600,
        container: "#one",
        id: "one"
    });
    myLoader();
    var myLoader = loader({
        width: 960,
        height: 600,
        container: "#two",
        id: "one"
    });
    myLoader();
    var myLoader = loader({
        width: 960,
        height: 600,
        container: "#three",
        id: "one"
    });
    myLoader();
    var myLoader = loader({
        width: 960,
        height: 600,
        container: "#four",
        id: "one"
    });
    myLoader();

    /* Loader Section ends */

    //// You mad, bro? 

    var pageTitle

    var jsonObject;
    var lastRevID;
    var objectTwo = []

    var linkInitialFeaturedArticle = "https://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&titles=Wikipedia%3A" + "Today\'s featured article/July 5, 2015"
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

    var impDataConcated = [];
    var langLinksJsonObject = []
    var finalJsonObjectLangLinks = [];
    var originalPageID;

    var fullOnData = []

    var finaljsonObject = [];
    var finaljsonObjectNeverChange = [];

    var linkAddress;

    function initializer(object, pageTitle, url, width, height, atribution) {

        pageEditsTester(object, "#three", "none", "", "", "hour", pageTitle, url, width, height, "stretch", "lineChart", atribution)
        pageEditsTester(object, "#two", "none", "", "", "day", pageTitle, url, width, height, "stretch", "lineChart", atribution)
        pageEditsTester(object, "#one", "none", "", "", "week", pageTitle, url, width, height, "stretch", "lineChart", atribution)
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

                            featuredArticlePlotter(articleTitle, extract, "#twelve", photoUrl, width, height)
                        }
                    );

                } else {
                    featuredArticlePlotter(articleTitle, extract, "#twelve", "assets/defaultImage.jpg", 1000, 600)

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

            editorOfTheWeekPlotter(EOWs, reasonsEOWs, dateEOWs, "#thirteen", "assets/defaultImage.jpg", 1000, 600)
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

        extractRequiredPortion = extract.match(/\n|([^\r\n.!?]+([.!?]+|$))/gim)[0]
        extractRequiredPortion = extractRequiredPortion + extract.match(/\n|([^\r\n.!?]+([.!?]+|$))/gim)[1]
        extractRequiredPortion = extractRequiredPortion + extract.match(/\n|([^\r\n.!?]+([.!?]+|$))/gim)[2]

        if (extractRequiredPortion.indexOf(" ") == 0) {
            extractRequiredPortion = extractRequiredPortion.slice(1, extractRequiredPortion.length)
        }

        var textEnter = svgBase.selectAll("text")
            .data([0]);

        var textEnter = textEnter.enter().append("text");

        // console.log(extractRequiredPortion)

        textEnter.text(extractRequiredPortion)
            .attr("x", 20)
            .attr("y", 250)
            .attr("dy", "0.7em")
            .attr("font-family", "Georgia")
            .attr("font-size", 25)
            .attr("fill", "white").attr('opacity', "0.8").call(wrap, 800);

        function wrap(text, width) {
            text.each(function() {

                var text = d3.select(this),
                    words = text.text().split(/\s+/).reverse(),
                    word,
                    line = [],
                    lineNumber = 0,
                    lineHeight = 1.6, // ems
                    y = text.attr("y"),
                    x = text.attr("x"),
                    dy = parseFloat(text.attr("dy")),
                    tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

                while (word = words.pop()) {
                    line.push(word);
                    tspan.text(line.join(" "));
                    if (tspan.node().getComputedTextLength() > width) {
                        line.pop();
                        tspan.text(line.join(" "));
                        line = [word];
                        tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                    }
                }

            });
        }


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
    }

    function editorOfTheWeekPlotter(EOWs, reasonsEOWs, dateEOWs, idname, picUrl, picWidth, picHeight) {

        var previousSize;

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

        var svgBase = d3.select("body").select(idname).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr('class', 'svgBase')

        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var svgFull = svgBase.append("g")
            .attr('class', 'svgFull')
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
        imageEnter.attr("y", 215);
        imageEnter.attr("width", 100).attr("height", 100)


        var circle = svgBase.selectAll("line")
            .data([0, 0, 0, 0]);

        var lines = circle.enter().append("line")
            .attr("x1", function(d, i) {
                return i * 200 + 80;
            })
            .attr("y1", 350)
            .attr("x2", function(d, i) {
                return i * 200 + 220;
            })
            .attr("y2", 350)
            .attr("stroke-width", 0.5)
            .attr("stroke", "#ddd");

        EOWs = EOWs.concat(dateEOWs)
        EOWs = EOWs.concat(reasonsEOWs)

        // Editor of the Weeks
        var textEnter = svgBase.selectAll("text")
            .data(EOWs);
        var textEnter = textEnter.enter().append("text");

        var tackyStuff = 0;

        var x;

        textEnter.text(function(d, i) {
                if (d != null) {
                    return d
                } else if (d == null && i < 8) {
                    return "N/A"
                } else {
                    return "No award distributed\n due to clerk error"
                }
            })
            .attr("x", function(d, i) {
                if (i < 4) {
                    x = i * 200 + 150
                    return i * 200 + 150;
                } else if (i > 3 && i < 8) {
                    x = (i - 4) * 200 + 150
                    return (i - 4) * 200 + 150;
                } else {
                    x = (i - 8) * 200 + 150
                    return (i - 8) * 200 + 150;
                }
            })
            .attr("y", function(d, i) {
                if (i < 4) {
                    return 150;
                } else if (i > 3 && i < 8) {
                    return 180;
                } else {
                    return 380;
                }
            })
            .attr("font-family", function(d, i) {
                if (i < 4) {
                    return "Georgia";
                } else if (i > 3 && i < 8) {
                    return "Open Sans";
                } else {
                    return "Open Sans";
                }
            }).attr("font-size", function(d, i) {
                if (i < 4) {
                    return 22;
                } else if (i > 3 && i < 8) {
                    return 14;
                } else {
                    return 18;
                }
            })
            .attr("dy", "0.7em").attr("text-anchor", "middle").attr("fill", "white").attr('opacity', "0.8").call(wrap, 150);

        function wrap(text, width) {
            text.each(function(d, i) {
                if (i < 12 && i > 7) {
                    var text = d3.select(this),
                        words = text.text().split(/\s+/).reverse(),
                        word,
                        line = [],
                        lineNumber = 0,
                        lineHeight = 1.6, // ems
                        y = text.attr("y"),
                        dy = parseFloat(text.attr("dy")),
                        tspan = text.text(null).append("tspan").attr("x", function() {
                            return (i - 8) * 200 + 150;

                        }).attr("y", y).attr("dy", dy + "em");

                    while (word = words.pop()) {
                        line.push(word);
                        tspan.text(line.join(" "));
                        if (tspan.node().getComputedTextLength() > width) {
                            line.pop();
                            tspan.text(line.join(" "));
                            line = [word];
                            tspan = text.append("tspan").attr("x", function() {
                                return (i - 8) * 200 + 150;

                            }).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                        }
                    }
                }
            });
        }
    }

    function monthlyStats(idname, url, interpolation, picUrl, picWidth, picHeight) {

        d3.csv(url, function(error, data) {

            d3.csv("http://reportcard.wmflabs.org/data/datafiles/rc/rc_very_active_editors_count.csv", function(error, dataTwo) {

                var previousSize;

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

                var svgBase = d3.select("body").select(idname).append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr('class', 'svgBase')

                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                var svgFull = svgBase.append("g")
                    .attr('class', 'svgFull')
                    .attr("transform", "translate(" + (-1) * margin.left + "," + (-1) * margin.top + ")");

                var imageBase64 = "";

                if (picUrl === undefined) {
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
                        .attr("x", 0)
                        .attr("y", 0)
                        .attr("width", fullBleedWidth)
                        .attr("height", fullBleedHeight);

                })

                // Adding Wikipedia Logo
                d3.select(idname).select('.svgBase')
                    .append("svg:image")
                    .attr("xlink:href", "assets/wikipediaW.png")
                    .attr("x", width - 80)
                    .attr("y", 0)
                    .attr("width", 70)
                    .attr("height", 70);

                var YOYRawOne = data[data.length - 1].Total - data[data.length - 13].Total
                var MOMRawOne = data[data.length - 1].Total - data[data.length - 2].Total

                var YOYPercentOne = (100 * YOYRawOne / data[data.length - 1].Total).toFixed(2)
                var MOMPercentOne = (100 * MOMRawOne / data[data.length - 1].Total).toFixed(2)

                var YOYRawTwo = dataTwo[dataTwo.length - 1].Total - dataTwo[dataTwo.length - 13].Total
                var MOMRawTwo = dataTwo[dataTwo.length - 1].Total - dataTwo[dataTwo.length - 2].Total

                var YOYPercentTwo = (100 * YOYRawTwo / dataTwo[dataTwo.length - 1].Total).toFixed(2)
                var MOMPercentTwo = (100 * MOMRawTwo / dataTwo[dataTwo.length - 1].Total).toFixed(2)

                d3.select(idname).select('.svgBase')
                    .append('text')
                    .text("May, 2015")
                    .attr("text-anchor", "end")
                    .attr("x", width - 100)
                    .attr("y", 45)
                    .attr("font-family", "Georgia")
                    .attr("font-size", 32)
                    .attr("fill", "#ccc");

                //TODO Figure out a way to put italics into the svg without cutting the edge off.
                d3.select(idname).select('.svgBase')
                    .append('text')
                    .text(numberWithSpaces(data[data.length - 1].Total))
                    .attr("x", 20)
                    .attr("y", 400)
                    .attr("font-family", "Open Sans")
                    .attr("font-size", function(d) {
                        return "80px"
                    })
                    .attr("font-weight", "600")
                    .attr("fill", "#eee")

                // d3.select(idname).select('.svgBase')
                //     .append('text')
                //     .text(function() {
                //         if (YOYPercentOne.indexOf("-") > -1) {
                //             return YOYPercentOne + "%"
                //         } else {
                //             return "+" + YOYPercentOne + "%"
                //         }
                //     })
                //     .attr("x", 600)
                //     .attr("y", 400)
                //     // .attr("text-anchor", "right")
                //     .attr("font-family", "Open Sans")
                //     .attr("font-size", 80)
                //     .attr("font-weight", "600")
                //     .attr("fill", function() {
                //         if (YOYPercentOne.indexOf("-") > -1) {
                //             return "rgb(247, 139, 139)"
                //         } else {
                //             return "rgb(149, 248, 150)"
                //         }
                //     })

                d3.select(idname).select('.svgBase')
                    .append('text')
                    .text("New Editors per Month")
                    .attr("x", 30)
                    .attr("font-family", "Georgia")
                    .attr("letter-spacing", "1px")
                    .attr("y", 450)
                    .attr("font-size", function(d) {
                        return "30px"
                    })
                    .attr("font-weight", "100")
                    .attr("fill", "white")
                    .attr('opacity', "0.8");

                d3.select(idname).select('.svgBase')
                    .append('text')
                    .text(numberWithSpaces(dataTwo[dataTwo.length - 1].Total))
                    .attr("x", 20)
                    .attr("y", 200)
                    .attr("font-family", "Open Sans")
                    .attr("font-size", function(d) {
                        return "80px"
                    })
                    .attr("font-weight", "600")
                    .attr("fill", "#eee")

                // d3.select(idname).select('.svgBase')
                //     .append('text')
                //     .text(function() {
                //         if (YOYPercentTwo.indexOf("-") > -1) {
                //             return YOYPercentTwo + "%"
                //         } else {
                //             return "+" + YOYPercentTwo + "%"
                //         }
                //     })
                //     .attr("x", 600)
                //     .attr("y", 200)
                //     // .attr("text-anchor", "right")
                //     .attr("font-family", "Open Sans")
                //     .attr("font-size", 80)
                //     .attr("font-weight", "600")
                //     .attr("fill", function() {
                //         if (YOYPercentTwo.indexOf("-") > -1) {
                //             return "rgb(247, 139, 139)"
                //         } else {
                //             return "rgb(149, 248, 150)"
                //         }
                //     })

                d3.select(idname).select('.svgBase')
                    .append('text')
                    .text("Very Active Editors")
                    .attr("x", 30)
                    .attr("y", 250)
                    .attr("font-family", "Georgia")
                    .attr("letter-spacing", "2px")
                    .attr("font-size", function(d) {
                        return "30px"
                    })
                    .attr("font-weight", "100")
                    .attr("fill", "white")
                    .attr('opacity', "0.8");

                var parseDate = d3.time.format("%Y-%m-%d").parse;

                data.splice(0, data.length - 13)

                data.forEach(function(d, i) {
                    d.Month = (d.Month).replace('/', '-').replace('/', '-').replace('/', '-')
                    d.Month = parseDate(d.Month)
                })


                var x = d3.time.scale()
                    .range([440, width - 20]);

                var y = d3.scale.linear()
                    .range([height - 50, height - 200]);

                var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient("bottom")
                    .ticks(3);

                var yAxis = d3.svg.axis()
                    .scale(y)
                    .orient("left")
                    .ticks(2);

                var line = d3.svg.line()
                    .tension(0.92)
                    .interpolate("bundle")
                    .x(function(d) {
                        return x(d.Month);
                    })
                    .y(function(d) {
                        return y(d.Total);
                    });

                x.domain(d3.extent(data, function(d) {
                    return d.Month;
                }));
                y.domain(d3.extent(data, function(d) {
                    return d.Total;
                }));

                svgBase.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + (height - 50) + ")")
                    .call(xAxis);

                // svgBase.append("g")
                //   .attr("class", "y axis")
                //                 .attr("transform", "translate(" + (height-50) + ", 0) ")
                //   .call(yAxis)
                // .append("text")
                //   .attr("transform", "rotate(-90)")
                //   .attr("y", 6)
                //   .attr("dy", ".71em")
                //   .style("text-anchor", "end")

                svgBase.append("path")
                    .datum(data)
                    .attr("class", "linea")
                    .attr("d", line)
                    .attr("fill", "none")
                    .attr("stroke", function() {
                            return "#FFAB00"
                    })
                    .attr("stroke-width", "3px")


                d3.select(idname).select('.svgBase')
                    .append('text')
                    .text("Very Active Editors")
                    .attr("x", 30)
                    .attr("y", 250)
                    .attr("font-family", "Georgia")
                    .attr("letter-spacing", "2px")
                    .attr("font-size", function(d) {
                        return "30px"
                    })
                    .attr("font-weight", "100")
                    .attr("fill", "white")
                    .attr('opacity', "0.8");

                var parseDate = d3.time.format("%Y-%m-%d").parse;

                dataTwo.splice(0, dataTwo.length - 13)

                dataTwo.forEach(function(d, i) {
                    d.Month = (d.Month).replace('/', '-').replace('/', '-').replace('/', '-')
                    d.Month = parseDate(d.Month)
                        // console.log(d.Month)
                })


                var x = d3.time.scale()
                    .range([440, width - 20]);

                var y = d3.scale.linear()
                    .range([height - 290, height - 440]);

                var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient("bottom")
                    .ticks(3);

                var yAxis = d3.svg.axis()
                    .scale(y)
                    .orient("left")
                    .ticks(2);

                var lineTwo = d3.svg.line()
                    .tension(0.92)
                    .interpolate("bundle")
                    .x(function(d) {
                        return x(d.Month);
                    })
                    .y(function(d) {
                        return y(d.Total);
                    });

                x.domain(d3.extent(dataTwo, function(d) {
                    return d.Month;
                }));
                y.domain(d3.extent(dataTwo, function(d) {
                    // console.log(d.Total)
                    return d.Total;
                }));

                svgBase.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + (height - 290) + ")")
                    .call(xAxis);

                svgBase.append("path")
                    .datum(dataTwo)
                    .attr("class", "linea")
                    .attr("d", lineTwo)
                    .attr("fill", "none")
                    .attr("stroke", function() {
                            return "#FFAB00"
                    })
                    .attr("stroke-width", "3px")
            });

        });
    }

    function monthlyStatsMobileDesktop(idname, urlOne, urlTwo, interpolation, picUrl, picWidth, picHeight) {

        d3.csv(urlOne, function(error, data) {

            d3.csv(urlTwo, function(error, dataTwo) {

                // console.log(data)

                var previousSize;

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

                var svgBase = d3.select("body").select(idname).append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr('class', 'svgBase')

                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                var svgFull = svgBase.append("g")
                    .attr('class', 'svgFull')
                    .attr("transform", "translate(" + (-1) * margin.left + "," + (-1) * margin.top + ")");


                var imageBase64 = "";

                if (picUrl === undefined) {
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
                        .attr("x", 0)
                        .attr("y", 0)
                        .attr("width", fullBleedWidth)
                        .attr("height", fullBleedHeight);

                })

                // Adding Wikipedia Logo
                d3.select(idname).select('.svgBase')
                    .append("svg:image")
                    .attr("xlink:href", "assets/wikipediaW.png")
                    .attr("x", width - 80)
                    .attr("y", 0)
                    .attr("width", 70)
                    .attr("height", 70);

                var YOYRawOne = data[data.length - 1]["All Wikipedias (+Mobile)"] - data[data.length - 13]["All Wikipedias (+Mobile)"]
                var MOMRawOne = data[data.length - 1]["All Wikipedias (+Mobile)"] - data[data.length - 2]["All Wikipedias (+Mobile)"]

                var YOYPercentOne = (100 * YOYRawOne / data[data.length - 1]["All Wikipedias (+Mobile)"]).toFixed(2)
                var MOMPercentOne = (100 * MOMRawOne / data[data.length - 1]["All Wikipedias (+Mobile)"]).toFixed(2)

                var YOYRawTwo = dataTwo[dataTwo.length - 1]["All Wikipedias (+Mobile)"] - dataTwo[dataTwo.length - 13]["All Wikipedias (+Mobile)"]
                var MOMRawTwo = dataTwo[dataTwo.length - 1]["All Wikipedias (+Mobile)"] - dataTwo[dataTwo.length - 2]["All Wikipedias (+Mobile)"]

                var YOYPercentTwo = (100 * YOYRawTwo / dataTwo[dataTwo.length - 1]["All Wikipedias (+Mobile)"]).toFixed(2)
                var MOMPercentTwo = (100 * MOMRawTwo / dataTwo[dataTwo.length - 1]["All Wikipedias (+Mobile)"]).toFixed(2)

                d3.select(idname).select('.svgBase')
                    .append('text')
                    .text("May, 2015")
                    .attr("text-anchor", "end")
                    .attr("x", width - 100)
                    .attr("y", 45)
                    .attr("font-family", "Georgia")
                    .attr("font-size", 32)
                    .attr("fill", "#ccc");

                //TODO Figure out a way to put italics into the svg without cutting the edge off.
                d3.select(idname).select('.svgBase')
                    .append('text')
                    .text(function() {
                        var number = parseInt(data[data.length - 1]["All Wikipedias (+Mobile)"] - dataTwo[dataTwo.length - 1]["Total Mobile"])
                        number = number / 100000000
                        var flooredNumber = Math.floor(number)
                        return (flooredNumber / 10) + " BILLION"
                    })
                    .attr("x", 20)
                    .attr("y", 400)
                    .attr("font-family", "Open Sans")
                    .attr("font-size", function(d) {
                        return "60px"
                    })
                    .attr("letter-spacing", "1px")
                    .attr("font-weight", "600")
                    .attr("fill", "#eee")

                d3.select(idname).select('.svgBase')
                    .append('text')
                    .text("Desktop PageViews")
                    .attr("x", 30)
                    .attr("font-family", "Georgia")
                    .attr("letter-spacing", "1px")
                    .attr("y", 450)
                    .attr("font-size", function(d) {
                        return "25px"
                    })
                    .attr("font-weight", "100")
                    .attr("fill", "white")
                    .attr('opacity', "0.8");

                d3.select(idname).select('.svgBase')
                    .append('text')
                    .text(function() {
                        var number = parseInt(dataTwo[dataTwo.length - 1]["Total Mobile"])
                        number = number / 100000000
                        var flooredNumber = Math.floor(number)
                        return (flooredNumber / 10) + " BILLION"
                    })
                    .attr("x", 20)
                    .attr("y", 200)
                    .attr("font-family", "Open Sans")
                    .attr("letter-spacing", "1px")
                    .attr("font-size", function(d) {
                        return "60px"
                    })
                    .attr("font-weight", "600")
                    .attr("fill", "#eee")

                // d3.select(idname).select('.svgBase')
                //     .append('text')
                //     .text(function() {
                //         if (YOYPercentTwo.indexOf("-") > -1) {
                //             return YOYPercentTwo + "%"
                //         } else {
                //             return "+" + YOYPercentTwo + "%"
                //         }
                //     })
                //     .attr("x", 600)
                //     .attr("y", 200)
                //     // .attr("text-anchor", "right")
                //     .attr("font-family", "Open Sans")
                //     .attr("font-size", 80)
                //     .attr("font-weight", "600")
                //     .attr("fill", function() {
                //         if (YOYPercentTwo.indexOf("-") > -1) {
                //             return "rgb(247, 139, 139)"
                //         } else {
                //             return "rgb(149, 248, 150)"
                //         }
                //     })

                d3.select(idname).select('.svgBase')
                    .append('text')
                    .text("Mobile PageViews")
                    .attr("x", 30)
                    .attr("y", 250)
                    .attr("font-family", "Georgia")
                    .attr("letter-spacing", "2px")
                    .attr("font-size", function(d) {
                        return "25px"
                    })
                    .attr("font-weight", "100")
                    .attr("fill", "white")
                    .attr('opacity', "0.8");

                var parseDate = d3.time.format("%Y-%m-%d").parse;

                data.splice(0, data.length - 13)
                dataTwo.splice(0, dataTwo.length - 13)


                data.forEach(function(d, i) {
                    d.Month = (d.Month).replace('/', '-').replace('/', '-').replace('/', '-')
                    d.Month = parseDate(d.Month)
                })


                var x = d3.time.scale()
                    .range([440, width - 20]);

                var y = d3.scale.linear()
                    .range([height - 50, height - 200]);

                var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient("bottom")
                    .ticks(3);

                var yAxis = d3.svg.axis()
                    .scale(y)
                    .orient("left")
                    .ticks(2);

                var line = d3.svg.line()
                    .tension(0.92)
                    .interpolate("bundle").x(function(d) {
                        return x(d.Month);
                    })
                    .y(function(d, i) {
                        // console.log(d["All Wikipedias (+Mobile)"])
                        // console.log(dataTwo[i]["Total Mobile"])
                        return y(d["All Wikipedias (+Mobile)"] - dataTwo[i]["Total Mobile"]);
                        // return y(d["All Wikipedias (+Mobile)"]);
                    });

                x.domain(d3.extent(data, function(d) {
                    return d.Month;
                }));
                y.domain(d3.extent(data, function(d, i) {
                    return d["All Wikipedias (+Mobile)"] - dataTwo[i]["Total Mobile"];
                    // return d["All Wikipedias (+Mobile)"];
                }));

                svgBase.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + (height - 50) + ")")
                    .call(xAxis);

                // svgBase.append("g")
                //   .attr("class", "y axis")
                //                 .attr("transform", "translate(" + (height-50) + ", 0) ")
                //   .call(yAxis)
                // .append("text")
                //   .attr("transform", "rotate(-90)")
                //   .attr("y", 6)
                //   .attr("dy", ".71em")
                //   .style("text-anchor", "end")

                svgBase.append("path")
                    .datum(data)
                    .attr("class", "linea")
                    .attr("d", line)
                    .attr("stroke", "white")
                    .attr("stroke-width", "2.5px");

                var parseDate = d3.time.format("%Y-%m-%d").parse;

                dataTwo.forEach(function(d, i) {
                    d.Month = (d.Month).replace('/', '-').replace('/', '-').replace('/', '-')
                    d.Month = parseDate(d.Month)
                        // console.log(d.Month)
                })


                var x = d3.time.scale()
                    .range([440, width - 20]);

                var y = d3.scale.linear()
                    .range([height - 290, height - 440]);

                var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient("bottom")
                    .ticks(3);

                var yAxis = d3.svg.axis()
                    .scale(y)
                    .orient("left")
                    .ticks(2);

                var lineTwo = d3.svg.line()
                    .tension(0.92)
                    .interpolate("bundle").x(function(d) {
                        return x(d.Month);
                    })
                    .y(function(d) {
                        return y(d["Total Mobile"]);
                    });

                x.domain(d3.extent(dataTwo, function(d) {
                    return d.Month;
                }));
                y.domain(d3.extent(dataTwo, function(d) {
                    // console.log(d["Total Mobile"])
                    return d["Total Mobile"];
                }));

                svgBase.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + (height - 290) + ")")
                    .call(xAxis);

                svgBase.append("path")
                    .datum(dataTwo)
                    .attr("class", "linea")
                    .attr("d", lineTwo)
                    .attr("stroke", "white")
                    .attr("stroke-width", "2.5px");
            });

        });
    }


    featuredArticle(linkInitialFeaturedArticle)

    editorOfTheWeek(linkInitialEditorOfTheWeek)

    monthlyStats("#fourteen", "http://reportcard.wmflabs.org/data/datafiles/rc/rc_new_editors_count.csv", "bundle", "assets/defaultImage.jpg", 1000, 600)

    monthlyStatsMobileDesktop("#fifteen", "http://reportcard.wmflabs.org/data/datafiles/rc/rc_page_requests.csv", "http://reportcard.wmflabs.org/data/datafiles/rc/rc_page_requests_mobile.csv", "bundle", "assets/defaultImage.jpg", 1000, 600)




// grandPlotter(2615708, "Jurrasic World")
// grandPlotter2([46514718], [11056991])

// Legend //

///// = Pretty Difficult.
//*// = Not that Difficult
//**// = Ah! That is what I can fix in my sleep.