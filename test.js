    function multiplePlotter(objectOne, objectTwo, idname, interpolation, parameter, plotParameter, timeDuration, pageTitle, picUrl, picWidth, picHeight) {
        // var data = objectOne

        ////
        var timeLimit = null;

        var previousSize;

        // objectOne.forEach(function(d, i) {

        //     if (i == objectOne.length) {
        //         d.difference = d.size;
        //     }
        //     d.difference = d.size - previousSize;

        //     // console.log(d.)
        //     // console.log(d.timestamp + '  |  ' + d.difference + '  |  ' + d.size+ '  |  ' + d.user)
        //     previousSize = d.size;
        // })

        // console.log(tempCheck)

        // getGeoData(objectOne)

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

        var upperline = d3.svg.line()
            // .interpolate("bundle")
            .x(function(d, i) {

                // console.log(x(parseDate(d.key)))

                if (timeLimit != null) {
                    if (moment(d.key).diff(moment(timeLimit)) > 0) {
                        //     if (d.key.indexOf("T23:00:01.000Z") > -1 || d.key.indexOf("T01:00:01.000Z") > -1) {
                        //   // console.log('wooh' + "   " + d.key)
                        //     } else {
                        return x(parseDate(d.key));
                        // }
                    } else {
                        // return x(parseDate(JSON.stringify(moment(timeLimit)).replace("\"", "").replace("\"", "")))
                    }
                } else {
                    return x(parseDate(d.key));
                }

            })
            .y(function(d, i) {

                if (timeLimit != null) {

                    if (moment(d.key).diff(moment(timeLimit)) > 0) {
                        // if (d.key.indexOf("T23:00:01.000Z") > -1 || d.key.indexOf("T01:00:01.000Z") > -1) {
                        //  console.log('wooh' + "   " + d.key)

                        // } else {
                        return y(d.values);
                        // }
                    } else {}
                } else {
                    return y(d.values);
                }

            });

        var upperlineTwo = d3.svg.line()
            // .interpolate("bundle")
            .x(function(d, i) {

                // console.log(x(parseDate(d.key)))

                if (timeLimit != null) {
                    if (moment(d.key).diff(moment(timeLimit)) > 0) {
                        //     if (d.key.indexOf("T23:00:01.000Z") > -1 || d.key.indexOf("T01:00:01.000Z") > -1) {
                        //   // console.log('wooh' + "   " + d.key)
                        //     } else {
                        return x(parseDate(d.key));
                        // }
                    } else {
                        // return x(parseDate(JSON.stringify(moment(timeLimit)).replace("\"", "").replace("\"", "")))
                    }
                } else {
                    return x(parseDate(d.key));
                }

            })
            .y(function(d, i) {

                if (timeLimit != null) {

                    if (moment(d.key).diff(moment(timeLimit)) > 0) {
                        // if (d.key.indexOf("T23:00:01.000Z") > -1 || d.key.indexOf("T01:00:01.000Z") > -1) {
                        //  console.log('wooh' + "   " + d.key)

                        // } else {
                        return y(d.values);
                        // }
                    } else {}
                } else {
                    return y(d.values);
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

        objectOne.forEach(function(d) {

            var trueTime = d.timestamp

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

        objectTwo.forEach(function(d) {

            var trueTime = d.timestamp

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

        var dataOne = d3.nest()
            .key(function(d) {
                //  console.log(d.timestamp + " " + moment(d.timestamp).day())
                return d.timestamp;
            })
            .rollup(function(d) {
                // return 100
                return d3.sum(d, function(d) {
                    return d.values;
                });
            }).entries(objectOne);

        var dataTwo = d3.nest()
            .key(function(d) {
                //  console.log(d.timestamp + " " + moment(d.timestamp).day())
                return d.timestamp;
            })
            .rollup(function(d) {
                // return 100
                return d3.sum(d, function(d) {
                    return d.values;
                });
            }).entries(objectTwo);

        //  console.log(data)

        // Attempting to fix the Zero Date problem

        var finaleOne = []
        var finaleTwo = []

        if (timeDuration == "day") {

            // BEWARE BEWARE BEWARE!
            // Countless hours have been spent trying to get this part to work. 
            // TLDR; On MediaWiki APIs, time runs backwards!

            var previousDateActual = "";
            var dayMinusOne;

            dataOne.forEach(function(d, i) {

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

                        finaleOne.push({
                            key: tempIn,
                            values: 0
                        })

                        var tempIn = JSON.stringify(smoothner).replace("\"", "").replace("\"", "")

                        finaleOne.push({
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

                        finaleOne.push({
                            key: tempIn,
                            values: 0
                        })

                        var tempIn = JSON.stringify(smoothner).replace("\"", "").replace("\"", "")

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

            // console.log(d.timestamp)

            var previousDateActual = "";
            var theDayMisnomerPlus;

            dataOne.forEach(function(d, i) {

                // 2015-06-08T23:47:06Z

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
                    dataOne.splice(i, 1, {
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
                        dataOne.splice(i - 1, 1, {
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

        if (timeDuration == "day") {

            // BEWARE BEWARE BEWARE!
            // Countless hours have been spent trying to get this part to work. 
            // TLDR; On MediaWiki APIs, time runs backwards!

            var previousDateActual = "";
            var dayMinusOne;

            dataTwo.forEach(function(d, i) {

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

                        finaleTwo.push({
                            key: tempIn,
                            values: 0
                        })

                        var tempIn = JSON.stringify(smoothner).replace("\"", "").replace("\"", "")

                        finaleTwo.push({
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

                        finaleTwo.push({
                            key: tempIn,
                            values: 0
                        })

                        var tempIn = JSON.stringify(smoothner).replace("\"", "").replace("\"", "")

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

            // console.log(d.timestamp)

            var previousDateActual = "";
            var theDayMisnomerPlus;

            dataTwo.forEach(function(d, i) {

                // 2015-06-08T23:47:06Z

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
                    dataTwo.splice(i, 1, {
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
                        dataTwo.splice(i - 1, 1, {
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

        //  console.log(JSON.stringify(finaleOne, undefined, 2))

        x.domain(d3.extent(finaleOne, function(d) {
            //  console.log(d.key + '   ' + d.values)
            if (timeLimit != null) {
                if (moment(d.key).diff(moment(timeLimit)) > 0) {
                    return parseDate(d.key);
                } else {
                    //  console.log('inHere')
                    return parseDate(JSON.stringify(moment(timeLimit)).replace("\"", "").replace("\"", ""))
                }
            } else {
                return parseDate(d.key);

            }
        }))
        y.domain(d3.extent(finaleOne, function(d) {
            if (timeLimit != null) {
                if (moment(d.key).diff(moment(timeLimit)) > 0) {
                    return d.values;
                } else {
                    //  console.log(moment(d.key).diff(moment(timeLimit)))
                    //  console.log('ere2123')
                    return 0
                }
            } else {
                return d.values;
            }
        }));

        // The opacity rectangle and the image need to be above everything else. Otherwise the graphs and the text would be hidden

        // Image Bleed Stuff
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

        var totalEdits = 0;

        objectOne.forEach(function(d) {
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

        if (picUrl != "assets/defaultImage.jpg") {

            var opacityRect = svgFull.append("rect")
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
            .datum(finaleOne)
            .attr("class", "upperline")
            .attr("d", upperline)
            .attr("fill", "white")
            .attr("stroke", "#3FC380")
            .attr("stroke-width", "1px")

console.log(finaleOne)
console.log(finaleTwo)

        svgBase.append("path")
            .datum(finaleTwo)
            .attr("class", "upperlineTwo")
            .attr("d", upperlineTwo)
            .attr("fill", "white")
            .attr("stroke", "#3FC380")
            .attr("stroke-width", "1px")
    }