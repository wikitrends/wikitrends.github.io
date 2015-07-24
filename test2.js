
    function pageEditsTester(dataSource, idname, interpolation, parameter, plotParameter, timeDuration, pageTitle, picUrl, picWidth, picHeight, graphStyle, chartType) {

        d3.select(idname + "Controls").selectAll("*")
            .remove()


                    var dataTemp = dataSource


        dataTemp.sort(function(a, b) {
            var c = new Date(a.timestamp);
            var d = new Date(b.timestamp);
            return d - c;
        });

        var editors = []
        var editorsCount = 0;

        var pristineData = dataSource

        // pristineData.forEach(function(d){
        //     console.log(d.timestamp)
        // })

        dataTemp.forEach(function(d, i) {


            var user = d.user

            if (editors.indexOf(user) > -1) {
                d.editorsCount = editorsCount
            } else {
                editorsCount = editorsCount + 1;
                editors.push(user)
                d.editorsCount = editorsCount
            }
        })

        var data = dataTemp

        dataTemp.forEach(function(d, i) {

            if (i == dataTemp.length - 1) {
                d.difference = d.size;
            } else {
                d.difference = d.size - dataTemp[i + 1].size;
            }

        })

        // getGeoData(dataSource)

        var totalEdits = 0;
        var totalEditors;
        var brokenDownDataSource = []

        dataTemp.forEach(function(d) {

            if (timeLimit == null && timeLimitUpper == null) {
                totalEdits = totalEdits + 1
                brokenDownDataSource.push({
                    user: d.user,
                    timestamp: d.timestamp
                })
            } else if (timeLimit == null && timeLimitUpper != null) {
                if (moment(d.timestamp).diff(moment(timeLimitUpper)) < 0) {
                    totalEdits = totalEdits + 1
                    brokenDownDataSource.push({
                        user: d.user,
                        timestamp: d.timestamp
                    })
                }
            } else if (timeLimit != null && timeLimitUpper == null) {
                if (moment(d.timestamp).diff(moment(timeLimit)) > 0) {
                    totalEdits = totalEdits + 1
                    brokenDownDataSource.push({
                        user: d.user,
                        timestamp: d.timestamp
                    })
                }
            } else if (timeLimit != null && timeLimitUpper != null) {
                if (moment(d.timestamp).diff(moment(timeLimit)) < 0) {} else {
                    if (moment(d.timestamp).diff(moment(timeLimitUpper)) < 0) {
                        totalEdits = totalEdits + 1
                        brokenDownDataSource.push({
                            user: d.user,
                            timestamp: d.timestamp
                        })
                    }
                }
            }
        })

        var distances = {},
            e;
        for (var i = 0, l = brokenDownDataSource.length; i < l; i++) {
            e = brokenDownDataSource[i];
            distances[e.user] = (distances[e.user] || 0) + 1;
        }

        var totalEditors = Object.keys(distances).length

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

        var newData = dataTemp

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
                // console.log(timeDuration)

                // console.log(d.timestamp)

                // Days
                var tempDate = d.timestamp;
                tempDate = tempDate.substring(0, 10);
                tempDate = tempDate.concat("T00:00:01.000Z");
                d.timestamp = tempDate;
                lastDate = tempDate;
                totalCount = totalCount + 1;

            }

            if (timeDuration == "week") {

                console.log(timeDuration)

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

                console.log(timeDuration)


        var data = d3.nest()
            .key(function(d) {
                return d.timestamp;
            })
            .rollup(function(d) {
                return d3.sum(d, function(d) {
                    return d.values;
                });
            }).entries(dataTemp);

        // Attempting to fix the Zero Date problem
        var finale = []

        console.log(dataTemp)

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

        var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
                return "<strong>Frequency:</strong> <span style='color:red'>" + d.frequency + "</span>";
            })

        svgBase.call(tip);

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

            if (picUrl != "http://wikitrends.github.io/assets/defaultImage.jpg") {

                var opacityRect = svgFull.append("rect")
                    .attr("id", "rect" + idname.slice(1))
                    .attr("width", width + margin.right + margin.left)
                    .attr("fill", "black")
                    .attr("opacity", 0.7)
                    .attr("height", height + margin.top + margin.bottom);

                if (graphStyle == "cover") {

                    var opacityRect = svgFull.append("rect")
                        .attr("id", "rect" + idname.slice(1))
                        .attr("width", width + margin.right + margin.left)
                        .attr("fill", "#f9f9f9")
                        .attr("opacity", 1)
                        .attr("y", 155)
                        .attr("height", height + margin.top + margin.bottom - 155);
                }

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

        d3.select(idname).select('.svgBase')
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

        d3.select(idname).select('.svgBase')
            .append('text')
            .text(numberWithSpaces(totalEdits))
            .attr("x", function(d) {
                var length = numberWithSpaces(totalEditors).length
                var lengthTwo = numberWithSpaces(totalEdits).length
                return width - (24 * length) - 90 - (24 * lengthTwo)
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
            .text("Editors")
            .attr("x", function(d) {
                var length = numberWithSpaces(totalEditors).length
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
            .text(numberWithSpaces(totalEditors))
            .attr("x", function(d) {
                var length = numberWithSpaces(totalEditors).length
                return width - (24 * length) - 45
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

        if (chartType == "barChart") {

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
                    // if (type == "WeeklyAvgEvaluationTime") {
                    //     return "#3498db"
                    // } else if (type == "WeeklyVulns") {
                    //     return "#e74c3c"
                    // } else if (type == "WeeklyImpressions") {
                    //     return "#f1c40f"
                    // } else if (type == "AvgEvaluationTime") {
                    return "#2196F3"
                        // }

                })
        } else {
        svgBase.append("path")
            .datum(finale)
            .attr("class", "upperline")
            .attr("d", upperline)
            .attr("fill", "none")
            .attr("stroke", function() {
                if (graphStyle == "cover") {
                    return "#e74c3c"
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
        }


        var rectangle = svgBase.append("rect")
            // .attr("x", d3.mouse(this)[0])
            // .attr("y", d3.mouse(this)[1])
            .attr("width", 100)
            .attr("fill", "black")
            .attr("opacity", 0.7)
            .attr("height", 100)
            .call(drag);

        var text = svgBase.append("rect")
            .attr("id", "rect" + idname.slice(1))
            .attr("width", 100)
            .attr("fill", "black")
            .attr("opacity", 0.7)
            .attr("height", 100)
            .call(drag);

        svgBase.selectAll("circle.line")
            .data(data)
            .enter().append("svg:circle")
            .attr("class", "line")
            .style("fill", "green")
            .attr("cx", upperline.x())
            .attr("cy", upperline.y())
            .attr("r", 12)
            .attr('opacity', 0)
            .on("click", function(d) {})

        // var circle = box.selectAll('.draggableCircle')  
        //         .data([{ x: (boxWidth / 2), y: (boxHeight / 2), r: 25 }])
        //         .enter()
        //         .append('svg:circle')
        //         .attr('class', 'draggableCircle')
        //         .attr('cx', function(d) { return d.x; })
        //         .attr('cy', function(d) { return d.y; })
        //         .attr('r', function(d) { return d.r; })
        //         .call(drag)
        //         .style('fill', 'black');

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
                                return "<label class='btn btn-primary active'><input type='radio' name='options' id='cover" + idname.slice(1) + "' autocomplete='off' checked=''>Cover</label><label class='btn btn-primary'><input type='radio' name='options' id='stretch" + idname.slice(1) + "' autocomplete='off' checked=''>Stretch</label>"
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

        console.log(idname + ' ' + chartType)
        // console.log(finale)

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
                if (graphStyle == "cover") {
                    return "#e74c3c"
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

        d3.select("#barChart" + idname.slice(1)).on("click", function() {
            
            svgBase.selectAll(".upperline")
                .remove()

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

                    initializer(dataSource, pageTitle, userInputImageURL, width, height)

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
                canvas.width = 1095;

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
    }