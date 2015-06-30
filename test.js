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

         data.forEach(function(d){
             d.date = 
         })

        var x = d3.time.scale()
            .range([0, width]);

        var y = d3.scale.linear()
            .range([height, 150]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .ticks(5)
            .orient("left");

        // var knotChecker;

        var upperline = d3.svg.line()
            // .interpolate("bundle")
            .x(function(d) {

                console.log(x(moment(d.date)))
                console.log(x(d3.time.format("%Y-%m-%d").parse(d.date)))


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

                console.log()
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

    }