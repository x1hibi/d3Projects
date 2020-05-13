//This function is to styling the console.log and optimize the debug process
function debugLog(label,message){
    let Label=label[0].toUpperCase() + label.slice(1)
    return  typeof(message)=="string" ? console.log(`%c ${Label}: %c${message}`,"color:yellow","color:cyan") : console.log(`%c ${Label}:`,"color:white",message)
}

let url="https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json"

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
    let chartData=data.data
    let size=chartData.length
    let height=500
    let width=1000
    let padding = 25
    let leftPadding= 60
    //we declare and the variables to make a scale of y axis
    let maxValueY=d3.max(chartData,d=>d[1])
    const yScale=d3.scaleLinear().domain([0,maxValueY]).range([height-padding,padding])
    const yAxis=d3.axisLeft(yScale)
    //we declare and the variables to make a scale of x axis
    let minValueX=d3.min(chartData,d=>d[0])
    let maxValueX=d3.max(chartData,d=>d[0])
    let timeScale = d3.scaleTime().domain([new Date(minValueX), new Date(maxValueX)]).range([0, width-50]);
    let xAxis=d3.axisBottom(timeScale)

    //create a svg 
    const svg=d3.select("#title").append("svg").attr("width",width+25).attr("height",height)
    //we add axes, his labels and the title of them
    svg.append("text").attr("x",width/2).attr("y",padding).text("Gross Domestic Product Growing US").attr("text-anchor","middle").attr("class","title")
    svg.append("text").attr("x",width/2).attr("y",height-padding/2).text("Date (Year)").attr("text-anchor","middle").attr("class","axisLabel")
    svg.append("text").attr("x",(-height/2)+padding).attr("y",15).text("Gross Domestic Product (Billion USD)").attr("text-anchor","middle").attr("transform","rotate(-90)").attr("class","axisLabel")
    svg.append("div").attr("id","tooltip")
    svg.append("g").attr("id","y-axis").attr("transform","translate("+leftPadding+","+(-padding+5)+")").call(yAxis)
    svg.append('g').attr("id","x-axis").attr("transform","translate("+(leftPadding)+","+(height-padding*2+5)+")").call(xAxis)
    
    //We create a single rect for every value in the array data
    let bars=svg.selectAll("rect") //we select all the rect created inside the svg
                .data(chartData).enter() //we select all the data inside chardata
                .append("rect") //create a rect for each value
                .attr("width",(width-50)/size).attr("height",d=>height-yScale(d[1])-padding) //we define the width and the height of each bar 
                .attr("x",(d,i)=>leftPadding+i*(width-50)/size).attr("y",d=>yScale(d[1])-padding+5) //we asign the position in x and y for them
                .attr("class","bar").attr("fill",(d,i)=>"rgb(95,25,"+(255-i)+")") //we style these bars in order to make a gradient effect
                .attr("data-date",d=>d[0]).attr("data-gdp",d=>d[1]) // we sert the data as atributes

    bars.on("mouseover",d=>{// we declare actions for over mouse event and show the current data in a tooltip
        let tooltip=document.getElementById("tooltip")
        tooltip.style.opacity=1
        tooltip.innerHTML=`<p><em>Current data</em> <br/><b style='display:inline'>${d[1]}</b> Billion USD <br/> <i>${d[0]}</i></p>`;
        tooltip.setAttribute("data-date",d[0])
        tooltip.style.left=`${event.clientX+25}px`
        tooltip.style.top=`${event.clientY-75}px`
    }).on("mouseout",d=>{document.getElementById("tooltip").style.opacity=0}) //we hide the data when the mouse is not over the bar
}