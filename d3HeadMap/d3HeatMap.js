//This function is to styling the console.log and optimize the debug process
function debugLog(label,message){
    let Label=label[0].toUpperCase() + label.slice(1)
    return  typeof(message)=="string" ? console.log(`%c ${Label}: %c${message}`,"color:yellow","color:cyan") : console.log(`%c ${Label}:`,"color:white",message)
}

let url="https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"

//This fuction make a AJAX petition and is handle the result by the callback function
function makeRequest(type,url,callback,nameFile='data.json'){
    const http=new XMLHttpRequest();
    debugLog("Status","the petiton was created")
    http.onreadystatechange=function(){
        if(this.readyState==4 && this.status==200){
            let jsonData=JSON.parse(this.response)
            debugLog("Status","the petition is ready")
            callback(jsonData)
        }else if(this.readyState==4 && this.status==0){
            debugLog("Status","network not avalible")
            //this is called when the network is not avalible 
            fetch(nameFile).then(response=>{console.log(response) ; return response.json()} ).then(jsonResponse=>callback(jsonResponse))
        }else{
            debugLog("Status","the petition is not ready")
        }
    }
    http.open(type,url,true);
    http.send()
    debugLog('Status',"the petition has sended")
}   


//Start the petition when the html is load
window.addEventListener('load',makeRequest("GET",url,handleData))


//this function handle the behabior of the page when get the data from the petition
function handleData(data){
    let tempData=data.monthlyVariance
    let tempBase=data.baseTemperature
    let size=tempData.length
    let height=700
    let width=1000
    let padding = 25
    //we declare and the variables to make a scale of x axis
    let minValueX=d3.min(tempData,d=>d.year)
    let maxValueX=d3.max(tempData,d=>d.year)
    let xScale=d3.scaleTime().domain([minValueX,maxValueX]).range([padding*2,width-padding])
    let xAxis=d3.axisBottom(xScale).tickFormat(d3.format("d"))
    let yScale = d3.scaleTime().domain([new Date("1998-01-01"), new Date("1998-12-31")]).range([padding*5, height-padding*2 ]);
    let yAxis=d3.axisLeft(yScale).tickFormat(d3.timeFormat("%B"))
    let maxVar=d3.max(tempData,d=>d.variance)
    let minVar=d3.min(tempData,d=>d.variance)

    //create a svg, axis nad labels
    const svg=d3.select("#title").append("svg").attr("width",width+25).attr("height",height)
    svg.append("text").attr("x",width/2).attr("y",padding).text("Monthly Global Temperature Variation").attr("text-anchor","middle").attr("class","title")
    svg.append("text").attr("x",width/2).attr("y",padding*2.5).text("(The base temperature is 8.66C)").attr("text-anchor","middle").attr("font-size",22.5).attr("id","description")
    svg.append('g').attr("id","x-axis").attr("transform","translate("+(padding*2)+","+(height-padding*2)+")").call(xAxis)
    svg.append("text").attr("x",width/2).attr("y",height).text("Years").attr("text-anchor","middle").attr("class","axisLabel")
    svg.append("g").attr("id","y-axis").attr("transform","translate("+padding*4+",0)").call(yAxis)
    svg.append("text").attr("x",(-height/2)+padding).attr("y",padding*1.5).text("Months").attr("text-anchor","middle").attr("transform","rotate(-90)").attr("class","axisLabel")


    //this variables are the dimentions of each cell
    let cellWidth=((width-padding*3)/(size))*12
    let cellHeight=(height-7*padding)/12
    //we add the legend
    let legend=svg.append("g").attr("id","legend")
    legend.append("text").attr("transform",`translate(${width-190},${padding*2})`).text("Temperature intervals")
    //we define colors and the intervals of colors 
    let colors=["#73C6B6","#52BE80","#2ECC71","#D4AC0D","#B9770E","#935116","#6E2C00"]
    colors.forEach((color,i)=>{
        legend.append("rect").attr("transform",`translate(${width-305+(41*(i+1))},${padding*2.5})`).attr("width",41).attr("height",20).attr("fill",color)
        legend.append("text").attr("transform",`translate(${width-285+(41*(i+1))},${padding*4})`).text(`${i*2}-${(i*2)+2}`).attr("text-anchor","middle")
    })
    
    //We create a single rect for every value in the array data
    let cell=svg.selectAll("rect")
                .data(data.monthlyVariance).enter()
                .append("rect") //create a rect for each value
                .attr("width",d=>cellWidth)
                .attr("height",d=>cellHeight) //we define the width and the height of each bar 
                .attr("x",d=>{
                    let xOrigin=padding*4
                    let xPosition=xOrigin+cellWidth*(d.year-minValueX)
                    return xPosition
                })
                .attr("y",d=>{
                    let yOrigin=padding*5
                    let yPosition=yOrigin+cellHeight*(d.month-1)
                    return yPosition
                })
                .attr("fill",d=>{
                    let temp=tempBase+d.variance
                    let color = temp <=2 ? colors[0] : temp <=4 ? colors[1] : temp <=6 ? colors[2] : temp <=8 ? colors[3] : temp <=10 ? colors[4] : temp <=12 ? colors[5] : colors[6] ;
                    return color
                })
                .attr("class","cell")
                .attr("data-month",d=>d.month-1).attr("data-year",d=>d.year).attr("data-temp",d=>tempBase+d.variance) // we sert the data as atributes
    
    cell.on("mouseover",d=>{// we declare actions for over mouse event and show the current data in a tooltip
        let tooltip=document.getElementById("tooltip")
        tooltip.style.opacity=1
        tooltip.innerHTML=`<p><em>Temperature</em> <br/><b style='display:inline'>${(d.variance+tempBase).toFixed(2)} °C</b><br/> <em>Variance</em><br/><b style='display:inline'>${d.variance.toFixed(2)}</b></p>`;
        tooltip.setAttribute("data-year",d.year)
        tooltip.style.left=`${event.clientX+25}px`
        tooltip.style.top=`${event.clientY-75}px`
    }).on("mouseout",d=>{document.getElementById("tooltip").style.opacity=0}) //we hide the data when the mouse is not over the bar

}