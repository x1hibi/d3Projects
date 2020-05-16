//This function is to styling the console.log and optimize the debug process
function debugLog(label,message){
    let Label=label[0].toUpperCase() + label.slice(1)
    return  typeof(message)=="string" ? console.log(`%c ${Label}: %c${message}`,"color:yellow","color:cyan") : console.log(`%c ${Label}:`,"color:white",message)
}

let url="https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json"

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
            fetch(nameFile).then(response=>{console.log(response) ; return response.json()} ).then(jsonResponse=>callback(jsonResponse))
        }else{
            debugLog("Status","the petition is not ready")
        }
    }
    http.open(type,url,true);
    http.send()
    debugLog('Status',"the petition has sended")
}   


//Start the petition when the hmtl is load
window.addEventListener('load',makeRequest("GET",url,handleData))

function handleData(data){
    debugLog("handleData","enter to the funtion")
    let scatterData=data
    debugLog("data",scatterData )
    debugLog("step 1","start build a plot!") 

    //we declare the svg rellene 
    let height=800 
    let width=800 
    let padding=50
    let svg= d3.select("#title").append("svg").attr("width",width).attr("height",height) 
 
    //we add labels
    svg.append("text").attr("x",width/2).attr("y",padding).text("Doping in Professional Bicycle Racing").attr("text-anchor","middle").attr("class","title")
    svg.append("text").attr("x",width/2).attr("y",height-padding/2).text("Date (Year)").attr("text-anchor","middle").attr("class","axisLabel")
    svg.append("text").attr("x",(-height/2)+padding).attr("y",padding-15).text("Time (min:sec)").attr("text-anchor","middle").attr("transform","rotate(-90)").attr("class","axisLabel")

    //we create the y axis 
    let maxTime=d3.max(scatterData,d=>d.Time)  
    let minTime=d3.min(scatterData,d=>d.Time)
    let yScale=d3.scaleTime().domain([new Date("1994-01-01T00:"+minTime),new Date("1994-01-01T00:"+maxTime)]).range([padding,height-padding*2])
    //we select the format of the date
    let timeFormat=d3.timeFormat("%M:%S")
    let axisY=d3.axisLeft(yScale).tickFormat(timeFormat)
    
    let maxDate=d3.max(scatterData,d=>d.Year)  
    let minDate=d3.min(scatterData,d=>d.Year)
    let xScale=d3.scaleLinear().domain([minDate,maxDate]).range([padding*1.5,width-padding/2])
    let axisX=d3.axisBottom(xScale).tickFormat(d3.format("d"))

    //we add the axis 
    svg.append("g").attr("transform","translate("+padding*1.5+",25)").attr("id","y-axis").call(axisY)
    svg.append("g").attr("transform","translate(0,"+(height-padding*1.5)+")").attr("id","x-axis").call(axisX)
    //we add a lengend
    let legend=svg.append("g").attr("id","legend")
    legend.append("text").attr("transform","translate(570,400)").text("Cyclists with alleged drug")
    legend.append("rect").attr("transform","translate(555,390)").attr("width",10).attr("height",10).attr("fill","darkred")
    legend.append("text").attr("transform","translate(570,420)").text("Cyclists with not alleged drug") 
    legend.append("rect").attr("transform","translate(555,410)").attr("width",10).attr("height",10).attr("fill","darkblue")


    let circle=svg.selectAll("circle").data(scatterData).enter().append("circle").attr("r",d=>7.5).attr("cx",(d,i)=>xScale(d.Year)).attr("cy",d=>yScale(new Date("1994-01-01T00:"+d.Time))+1+padding/2).attr("class","dot").attr("fill",d=>d.Doping=="" ? "darkblue" :"darkred").attr("data-xvalue",d=>d.Year).attr("data-yvalue",d=>"1994-01-01T00:"+d.Time)
    circle.on("mouseover",d=>{
        let tooltip=document.getElementById("tooltip")
        tooltip.style.opacity=1
        tooltip.innerHTML=`<span>Name:</span> ${d.Name} (${d.Nationality}) <br/><span>Info:</span> ${d.Doping=="" ? "No doping" : d.Doping}`;
        tooltip.setAttribute("data-year",d.Year) 
        tooltip.setAttribute("data-xvalue","1994-01-01T00:"+d.Time)
        tooltip.style.left=`${event.clientX+25}px`;
        tooltip.style.top=`${event.clientY-75}px`;
    }).on("mouseout",d=>{
        let tooltip=document.getElementById("tooltip")
        tooltip.style.opacity=0
    })

}
