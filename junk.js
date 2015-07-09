var data = dataSource

var previousSize;

dataSource.forEach(function(d, i) {

    if (i == dataSource.length) {
        d.difference = d.size;
    }
    d.difference = d.size - previousSize;
    previousSize = d.size;
})

// getGeoData(dataSource)

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
            console.log(ina)
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
            console.log(ina)
            return ina
        })
}